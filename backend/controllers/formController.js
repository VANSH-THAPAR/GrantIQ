const playwrightService = require('../services/playwrightService');
const MappingService = require('../services/mappingService');
const retryService = require('../services/retryService');
const { CONFIDENCE, SOURCE, FIELD_CLASS } = require('../services/dataResolver');
const Form = require('../models/Form');
const User = require('../models/User');

const mappingService = new MappingService();

const fillForm = async (req, res) => {
    try {
        const { formId, userId } = req.body;

        if (!formId || !userId) {
            return res.status(400).json({ status: 'failed', message: 'Missing formId or userId' });
        }

        // 1. Fetch Form URL & User Data from MongoDB
        const user = await User.findById(userId);
        const form = await Form.findById(formId);

        if (!user || (!form && !formId.startsWith('http'))) {
            return res.status(404).json({ status: 'failed', message: 'User or Form not found' });
        }

        const targetUrl = form ? form.url : formId;
        const userData = user.profile || user; // Adjust to your user schema
        const fallbackData = user.fallback || {}; // Low confidence fallback JSON

        // 2. Launch Playwright
        const page = await playwrightService.launchBrowser();
        
        console.log(`[Controller] Opening Form URL: ${targetUrl}`);
        const opened = await playwrightService.openPage(page, targetUrl);
        if (!opened) {
            await playwrightService.browser.close();
            return res.status(500).json({ status: 'failed', message: 'Failed to fully load the form URL.' });
        }

        // 3. CAPTCHA Check (Before any interaction)
        if (await playwrightService.detectCaptcha(page)) {
            // Do not close browser to let user solve it if headful mode
            return res.status(200).json({ 
                status: 'captcha_required', 
                message: 'CAPTCHA detected. User intervention required.',
                filledFields: [],
                skippedFields: [],
                errors: [{ message: 'CAPTCHA Block' }],
                retries: 0
            });
        }

        // 4. Extract form structure
        console.log(`[Controller] Extracting fields...`);
        const extractedFields = await playwrightService.extractFields(page);

        // 5. Intelligent Mapping & Resolution (LLM & Logic)
        console.log(`[Controller] Resolving data and mapping...`);
        const mappedResult = await mappingService.mapExtractedFields(extractedFields, userData, fallbackData);

        // Track what needs user intervention and filled metrics
        const missingCriticalFields = [];
        const filledFields = [];
        const skippedFields = [];

        // 6. Safe Fill Execution
        console.log(`\n[Controller] --- STARTING FILL PROCESS ---`);
        for (const [key, mapping] of Object.entries(mappedResult)) {
            // Check confidence limits and source definitions
            if (mapping.confidence === CONFIDENCE.NONE || 
               (mapping.class === FIELD_CLASS.CRITICAL && mapping.source === SOURCE.FALLBACK)) {
                
                skippedFields.push({ field: key, reason: 'Low Confidence or Critical Fallback' });
                
                if (mapping.originalFieldProps && mapping.originalFieldProps.required) {
                    missingCriticalFields.push(key);
                }
                console.log(`[Controller] SKIPPED field "${key}": Confidence=${mapping.confidence}`);
                continue;
            }

            console.log(`[Controller] FILLING field "${key}" (Conf: ${mapping.confidence} | Source: ${mapping.source})`);
            const isFilled = await playwrightService.safeFill(page, mapping.originalFieldProps, mapping);
            
            if (isFilled) {
                filledFields.push(key);
            } else {
                skippedFields.push({ field: key, reason: 'Failed DOM interaction' });
            }
        }
        console.log(`[Controller] --- FILL PROCESS COMPLETE ---\n`);

        // Check for specific dynamic KSB fields (PPO Number)
        if (targetUrl.includes('ksb.gov.in')) {
            console.log(`[Controller] Checking for dynamic KSB fields (PPO Number)...`);
            try {
                // Wait briefly for postback after clicking Pensioner to render the fields
                await page.waitForTimeout(3000); 
                const ppoValue = userData.ppoNo || '123456789012';
                
                const injectedPPO = await page.evaluate((val) => {
                    let filled = false;
                    const inputs = document.querySelectorAll('input[id*="PPO"]');
                    for (const inp of inputs) {
                        if (!inp.disabled && getComputedStyle(inp).display !== 'none') {
                            inp.value = val;
                            inp.dispatchEvent(new Event('input', { bubbles: true }));
                            inp.dispatchEvent(new Event('change', { bubbles: true }));
                            filled = true;
                        }
                    }
                    return filled;
                }, ppoValue);

                if (injectedPPO) {
                    console.log(`[Controller] Successfully injected dynamic PPO field natively: ${ppoValue}`);
                    filledFields.push('TxtPPO (Dynamic)');
                }
            } catch (err) {
                console.log(`[Controller] Could not find or inject dynamic PPO field. Skipping.`);
            }
        }

        // 7. Halt if critical REQUIRED fields couldn't be resolved safely
        if (missingCriticalFields.length > 0) {
            console.warn(`[Controller] Halting execution. Critical missing fields:`, missingCriticalFields);
            return res.status(200).json({
                status: 'user_input_required',
                message: 'Missing required inputs with high confidence',
                filledFields,
                skippedFields,
                errors: [{ message: 'Missing critical fields', fields: missingCriticalFields }],
                retries: 0
            });
        }

        // 8. Attempt Submit & Retry Workflow
        console.log(`[Controller] Triggering Submission & Retry Engine...`);
        const { success, retriesUsed, errors } = await retryService.submitAndRetry(page, mappedResult, userData, fallbackData);

        // Final payload construction
        const payload = {
            filledFields,
            skippedFields,
            errors,
            retries: retriesUsed
        };

        if (success) {
            console.log(`[Controller] SUCCESS: Automated submission passed.`);
            return res.status(200).json({ status: 'success', message: 'Form submitted successfully!', ...payload });
        } else {
            console.log(`[Controller] FAILED: Could not reconcile validation errors.`);
            return res.status(200).json({ status: 'failed', message: 'Submission failed validation or max retries.', ...payload });
        }

    } catch (error) {
        console.error('[Controller Error]', error);
        return res.status(500).json({ status: 'failed', message: error.message });
    }
};

const { spawn } = require('child_process');
const path = require('path');

const runAutoAgent = (req, res) => {
    try {
        const { target } = req.body; // 'ksb' or 'gujarat'
        if (!['ksb', 'gujarat'].includes(target)) {
            return res.status(400).json({ status: 'failed', message: 'Invalid target specified.' });
        }
        
        console.log(`[FormController] Spawning testRunner for: ${target}`);
        
        const runnerPath = path.join(__dirname, '..', 'testRunner.js');
        // Spawn detached so it runs in background and opens the local browser natively
        const child = spawn('node', [runnerPath, target], {
            detached: true,
            stdio: 'ignore', // ignore stdout/stderr to fully detach
            shell: true
        });
        
        child.unref();

        return res.status(200).json({ status: 'success', message: `Successfully launched automation agent for ${target}. Browser will open shortly!` });
    } catch (error) {
        console.error('[AutoAgent Error]', error);
        return res.status(500).json({ status: 'failed', message: error.message });
    }
};

module.exports = { fillForm, runAutoAgent };
