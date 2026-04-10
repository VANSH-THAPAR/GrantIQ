const { chromium } = require('playwright');
const path = require('path');
const { CONFIDENCE, SOURCE, FIELD_CLASS } = require('./dataResolver');

class PlaywrightService {
    constructor() {
        this.browser = null;
    }

    async launchBrowser() {
        // Headful mode for observability and debugging
        this.browser = await chromium.launch({ headless: false });
        const context = await this.browser.newContext();
        return await context.newPage();
    }

    async openPage(page, url) {
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            return true;
        } catch (error) {
            console.error(`Error opening page ${url}:`, error.message);
            return false;
        }
    }

    async extractHTML(page) {
        return await page.content();
    }

    async extractFields(page) {
        // Extracts inputs, selects, textareas via headless evaluation to parse structure.
        return await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'));
            return elements.map(el => {
                const id = el.id || '';
                const name = el.name || '';
                const type = el.tagName.toLowerCase() === 'input' ? el.type : el.tagName.toLowerCase();
                const required = el.required || false;
                
                // Try finding associated label
                let label = '';
                if (id) {
                    const labelEl = document.querySelector(`label[for="${id}"]`);
                    if (labelEl) label = labelEl.innerText.trim();
                }
                if (!label && el.closest('label')) {
                    label = el.closest('label').innerText.trim();
                }
                if (!label) label = el.getAttribute('aria-label') || el.placeholder || '';

                // Extract options if it's a select element
                const options = type === 'select' 
                    ? Array.from(el.querySelectorAll('option')).map(opt => opt.value || opt.text) 
                    : [];

                return { label, name, type, id, required, options };
            }).filter(field => field.name || field.id || field.label);
        });
    }

    async safeFill(page, field, resolvedData) {          try {
              // Wait for ASP.NET WebForms AJAX UpdatePanel to finish processing
              await page.waitForFunction(() => typeof Sys === 'undefined' || typeof Sys.WebForms === 'undefined' || !Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack(), { timeout: 10000 });
          } catch(e) {}
        // Validation check for confidence
        if (resolvedData.confidence === CONFIDENCE.NONE) {
            console.log(`[Playwright] Skipping fill for ${field.name || field.label}: Confidence is NONE (Missing data).`);
            return false;
        }

        // Critical field fail-safe
        if (resolvedData.class === FIELD_CLASS.CRITICAL && resolvedData.source === SOURCE.FALLBACK) {
            console.warn(`[Playwright] Cannot fill CRITICAL field (${field.name || field.label}) with fallback data. Skipping.`);
            return false;
        }

        const value = resolvedData.value;
        if (!value) return false;

        // Dynamic DOM wait handling & target fallback selectors
        const selectors = [];
        if (field.id) selectors.push(`#${field.id}`);
        if (field.name) selectors.push(`[name="${field.name}"]`);
        
        // Attempt fill logic with fallback selectors
        let filled = false;

        // Force fill if possible
        for (const selector of selectors) {
            try {
                const locator = page.locator(selector).first();
                await locator.waitFor({ state: 'attached', timeout: 2000 }); // Wait for it to exist in the DOM

                // Just interact with it, force it even if hidden
                await this._interactWithElement(locator, field.type, value);
                filled = true;
                console.log(`[Playwright] Filled field using selector: ${selector}`);
                break;
            } catch (error) {
                console.log(`[Playwright] Failed selector ${selector}:`, error.message);
            }
        }

        // Try using getByLabel as fallback strategy
        if (!filled && field.label) {
            try {
                const locator = page.getByLabel(new RegExp(field.label, 'i')).first();
                if (await locator.isVisible({ timeout: 2000 })) {
                    await this._interactWithElement(locator, field.type, value);
                    filled = true;
                    console.log(`[Playwright] Filled ${field.label} via getByLabel.`);
                }
            } catch (e) { /* Fallback to standard selectors */ }
        }

        if (!filled) {
            console.error(`[Playwright] Failed to find or fill field: ${field.label || field.name}`);
        }

        return filled;
    }

    async _interactWithElement(locator, type, value) {
        if (type === 'submit' || type === 'button' || type === 'hidden') {
            return; // don't fill buttons or hidden fields
        }

        try {
            await locator.scrollIntoViewIfNeeded({ timeout: 2000 });
        } catch(e) {}

        if (type === 'checkbox' || type === 'radio') {
            if (value === true || value === 'true' || value === 'on' || value === 'Yes') {
                await locator.check({ force: true });
            } else {
                await locator.uncheck({ force: true });
            }
        } else if (type === 'select') {
            // Attempt to select by exact text, label, or value
            try {
                await locator.selectOption({ label: String(value) }, { force: true, timeout: 1000 });
            } catch (e) {
                try {
                    await locator.selectOption({ value: String(value) }, { force: true, timeout: 1000 });
                } catch (e2) {
                     // Try to get all options and do a fuzzy match (e.g. "Ex-Servicemen" for "ESM")
                     try {
                         const options = await locator.evaluate(select => Array.from(select.options).map(o => ({text: o.text, value: o.value})));
                         const match = options.find(o => o.text.toLowerCase().includes(String(value).toLowerCase()) || o.value.toLowerCase() === String(value).toLowerCase());
                         if (match) await locator.selectOption({ value: match.value }, { force: true });
                     } catch(e3) {
                         console.log("Failed to select fuzzy match", e3);
                     }
                }
            }
            try { await locator.page().waitForTimeout(1000); } catch(e){} 
        } else if (type === 'date' || type === 'text') {
            // Clear input and fill to prevent append errors
            try {
                // Click to trigger any datepickers
                await locator.click({ force: true, timeout: 1000 });
            } catch(e) {}

            try {
                // Some date pickers have weird readonly behavior. evaluate it
                await locator.evaluate((node, val) => {
                    node.value = val;
                    node.dispatchEvent(new Event('input', { bubbles: true }));
                    node.dispatchEvent(new Event('change', { bubbles: true }));
                }, String(value));
            } catch (e) {}
            
            try { await locator.evaluate(n => n.removeAttribute('readonly')); } catch(e){} await locator.fill('', { force: true, timeout: 1000 });
            await locator.fill(String(value), { force: true, timeout: 1000 });
            
            try {
                await locator.press('Escape'); // required to hide datepicker overlay
                await locator.evaluate((node, val) => {
                    node.value = val;
                    node.dispatchEvent(new Event('change', { bubbles: true }));
                }, String(value));
                await locator.blur(); // Blur out of it
            } catch(e) {}
        } else {
            // Clear input and fill to prevent append errors
            try {
                try { await locator.evaluate(n => n.removeAttribute('readonly')); } catch(e){} await locator.fill('', { force: true, timeout: 1000 });
                await locator.fill(String(value), { force: true, timeout: 1000 });
            } catch(e) {}
        }
    }

    async submitForm(page) {
        try {
            console.log('[Playwright] Skipping automatic submit. Browser will remain open for user to manually verify and submit.');
            return true;
        } catch (error) {
            console.error('[Playwright] Error submitting form:', error.message);
            await this.takeScreenshot(page, 'submit-failure');
            return false;
        }
    }

    async detectCaptcha(page) {
        try {
            // Look for Google ReCaptcha or iframes containing "captcha"        
            const captchaElements = await page.locator('iframe[src*="captcha"], .g-recaptcha, iframe[title*="recaptcha"]').count();
            if (captchaElements > 0) {
                console.warn('[Playwright] CAPTCHA detected!');
                await this.takeScreenshot(page, 'captcha-detected');
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    async captureErrors(page) {
        try {
            // Collect visible error messages or validation states from the DOM     
            const errors = await page.evaluate(() => {
                const errorElements = Array.from(document.querySelectorAll('.error, .invalid-feedback, .error-message, [aria-invalid="true"]'));
                return errorElements.map(el => {
                    const text = el.innerText.trim();
                    let fieldName = null;

                    // Try taking ID if aria-invalid
                    if (el.hasAttribute('aria-invalid') && el.id) fieldName = el.id;
                    if (el.hasAttribute('aria-invalid') && el.name) fieldName = el.name;
                    
                    // Fallback to parent container query
                    if (!fieldName) {
                        const parentInput = el.closest('.form-group, .field-wrapper') ? el.closest('.form-group, .field-wrapper').querySelector('input, select, textarea') : null;
                        fieldName = parentInput ? (parentInput.name || parentInput.id) : null;
                    }
                    
                    // If still nothing, try checking previous sibling
                    if (!fieldName && el.previousElementSibling) {
                        const prev = el.previousElementSibling;
                        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(prev.tagName)) {
                            fieldName = prev.name || prev.id;
                        }
                    }

                    return { message: text, field: fieldName };
                }).filter(err => err.message.length > 0);
            });

            if (errors.length > 0) {
                await this.takeScreenshot(page, 'validation-errors');
            }
            return errors;
        } catch (error) {
            console.error('[Playwright] Error capturing errors:', error.message);
            return [];
        }
    }

    async takeScreenshot(page, stepLabel) {
        try {
            const timestamp = Date.now();
            const filePath = path.join(__dirname, '..', 'screenshots', `step-${timestamp}-${stepLabel}.png`);
            await page.screenshot({ path: filePath, fullPage: true });
            console.log(`[Playwright] Screenshot captured: ${filePath}`);
        } catch (err) {
            console.error(`[Playwright] Failed to take screenshot (${stepLabel}):`, err.message);
        }
    }
}

module.exports = new PlaywrightService();
