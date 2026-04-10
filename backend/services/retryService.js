const MappingService = require('./mappingService');
const mappingService = new MappingService();
const playwrightService = require('./playwrightService');
const { CONFIDENCE, SOURCE, FIELD_CLASS } = require('./dataResolver');

class RetryService {
    constructor() {
        this.maxRetries = 3;
    }

    async submitAndRetry(page, mappedFields, userData, fallbackData) {
        let attempt = 0;
        let success = false;
        let capturedErrors = [];
        
        while (attempt < this.maxRetries && !success) {
            console.log(`\n[RetryService] Attempting form submission... (Attempt ${attempt + 1}/${this.maxRetries})`);
            // Attempt submission
            const submitted = await playwrightService.submitForm(page);
            if (submitted) {
                // Check if errors appeared
                capturedErrors = await playwrightService.captureErrors(page);
                if (capturedErrors.length > 0) {
                    console.warn(`[RetryService] Submission errors encountered:`, capturedErrors);
                    // Filter fields associated with errors
                    const fieldsToRetry = capturedErrors.map(err => err.field).filter(Boolean);
                    
                    if (fieldsToRetry.length > 0) {
                        console.log(`[RetryService] Retrying for fields: ${fieldsToRetry.join(', ')}`);
                        
                        // Break if all failed fields are already low confidence
                        let lowConfidenceErrors = true;
                        fieldsToRetry.forEach(fieldName => {
                            // Find in mappedFields
                            const mf = mappedFields[fieldName];
                            if (mf && mf.confidence !== CONFIDENCE.LOW && mf.confidence !== CONFIDENCE.NONE) {
                                lowConfidenceErrors = false;
                            }
                        });
                        
                        if (!lowConfidenceErrors) {
                            console.log(`[RetryService] Retrying mapped fields that failed validation...`);
                             attempt++;
                        } else {
                            console.error(`[RetryService] Cannot retry safely. Failing fields are LOW/NONE confidence or critical.`);
                            break;
                        }
                    } else {
                        // General unstructured error, cannot confidently fix
                        console.error(`[RetryService] Unstructured validation error found. Cannot isolate field.`);
                        break;
                    }
                } else {
                    console.log(`[RetryService] Form submitted successfully!`);
                    success = true;
                }
            } else {
                console.error("[RetryService] Form submission button click failed.");
                break;
            }
        }
        
        return { success, retriesUsed: attempt, errors: capturedErrors };
    }
}

module.exports = new RetryService();
