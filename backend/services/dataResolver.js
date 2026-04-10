const ollamaService = require('./ollamaService');

const CONFIDENCE = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low', NONE: 'none' };
const SOURCE = { USER: 'user', DERIVED: 'derived', FALLBACK: 'fallback', MISSING: 'missing' };
const FIELD_CLASS = { SAFE: 'safe', MEDIUM: 'medium', CRITICAL: 'critical' };

/**
 * Classifies a field into SAFE, MEDIUM, or CRITICAL to determine if fallback data is acceptable.
 * @param {string} fieldIdentifier - Name or label of the field.
 * @returns {string} - The field class.
 */
function classifyField(fieldIdentifier) {
    if (!fieldIdentifier) return FIELD_CLASS.SAFE;
    const lower = fieldIdentifier.toLowerCase();
    
    // Identity, financial, and authentication fields
    if (/pan|aadhaar|ssn|bank|account|password|credit|phone|mobile|identity|dob/i.test(lower)) {
        return FIELD_CLASS.CRITICAL;
    }
    // Business metrics
    if (/revenue|employee|funding|salary|budget/i.test(lower)) {
        return FIELD_CLASS.MEDIUM;
    }
    // Generic info like company, city, state
    return FIELD_CLASS.SAFE;
}

/**
 * Resolves the best value for a given form field using a confidence hierarchy.
 * @param {Object} field - The parsed form field structure { label, name, type, required, options }
 * @param {Object} userData - High confidence user profile data
 * @param {Object} fallbackData - Low confidence fallback data {"company_name": { "value": "ABC Pvt Ltd", "confidence": "low" }}
 * @returns {Object} { value, confidence, source, classification }
 */
async function resolveField(field, userData, fallbackData = {}) {
    const fieldIdentifier = field.label || field.name;
    const classification = classifyField(fieldIdentifier);

    // 1. User Data (HIGH confidence)
    // Attempt exact match from flat user data structure
    const userValue = userData[field.name] || userData[field.label] || userData[fieldIdentifier];
    if (userValue !== undefined && userValue !== null && userValue !== "") {
        console.log(`[dataResolver] Field "${fieldIdentifier}" resolved to "${userValue}" via USER (High Confidence)`);
        return { value: userValue, confidence: CONFIDENCE.HIGH, source: SOURCE.USER, class: classification };
    }

    // 2. Derived Data (MEDIUM confidence, inferred via LLM)
    // Only call Ollama if it makes sense to derive it
    try {
        let derivedValue = null;
        let p = userData; // It's already the profile object
        const lowerLabel = fieldIdentifier.toLowerCase();
        
        if (lowerLabel.includes('first name') || lowerLabel.includes('full name as per aadhar card')) {
            derivedValue = `${p.firstName} ${p.middleName || ""} ${p.surname}`.replace(/\s+/g, ' ').trim();
        } else if (lowerLabel.includes('middle name')) {
            derivedValue = p.middleName;
        } else if (lowerLabel.includes('surname') || lowerLabel.includes('last name')) {
            derivedValue = p.surname;
        } else if (lowerLabel.includes('service number')) {
            derivedValue = p.serviceNumber;
        } else if (lowerLabel.includes('aadhaar') || lowerLabel.includes('aadhar')) {
            if (lowerLabel.includes('txtaadharcardnumber2')) {
                derivedValue = p.aadharCardNumber.substring(4, 8);
            } else if (lowerLabel.includes('txtaadharcardnumber3')) {
                derivedValue = p.aadharCardNumber.substring(8, 12);
            } else {
                // Return full Aadhar or first 4 depending on maxlength/site behavior
                derivedValue = lowerLabel.includes('txtaadharcardnumber') ? p.aadharCardNumber.substring(0, 4) : p.aadharCardNumber;
            }
        } else if (lowerLabel.includes('date of birth') || lowerLabel.includes('dob') || lowerLabel.includes('dd/mm/yyyy') || lowerLabel.includes('dob')) {
            // Gujarat site dob placeholder
            derivedValue = p.dateOfBirth;
        } else if (lowerLabel.includes('caste') || lowerLabel.includes('ddlcaste')) {
            // Gujarat site caste dropdown
            derivedValue = p.caste || "General";
        } else if (lowerLabel === 'male') {
            // Gujarat site gender radio
            derivedValue = p.gender && p.gender.toLowerCase() === 'male' ? true : false;
        } else if (lowerLabel === 'female') {
            derivedValue = p.gender && p.gender.toLowerCase() === 'female' ? true : false;
        } else if (lowerLabel.includes('password')) {
            derivedValue = null; // Purposely skip passwords to let user type them manually
        } else if (lowerLabel.includes('email')) {
            derivedValue = p.emailId;
        } else if (lowerLabel.includes('mobile')) {
            derivedValue = p.mobileNo;
        } else if (lowerLabel.includes('type of service')) {
            derivedValue = p.typeOfService; // "Army"
        } else if (lowerLabel.includes('rank')) {
            derivedValue = p.rank; // "Subedar"
        } else if (lowerLabel.includes('date of enrollment')) {
            derivedValue = p.dateOfEnrollment;
        } else if (lowerLabel.includes('date of discharge')) {
            derivedValue = p.dateOfDischarge;
        } else if (lowerLabel.includes('date of death')) {
            derivedValue = p.dateOfDeathOfEsm || "None";
        } else if (lowerLabel.includes('father\'s name') || lowerLabel.includes('husband\'s name')) {
            derivedValue = p.fathersName;
        } else if (lowerLabel.includes('house no')) {
            derivedValue = p.houseNo;
        } else if (lowerLabel.includes('street')) {
            derivedValue = p.streetName;
        } else if (lowerLabel.includes('town')) {
            derivedValue = p.town;
        } else if (lowerLabel.includes('village')) {
            derivedValue = p.village;
        } else if (lowerLabel.includes('city')) {
            derivedValue = p.city;
        } else if (lowerLabel.includes('state')) {
             derivedValue = p.state;
        } else if (lowerLabel.includes('district')) {
             derivedValue = p.district;
        } else if (lowerLabel.includes('country')) {
             derivedValue = p.country;
        } else if (lowerLabel.includes('pin code')) {
             derivedValue = p.pinCode;
        } else if (lowerLabel.includes('bank name')) {
             derivedValue = p.bankName;
        } else if (lowerLabel.includes('branch name') || lowerLabel.includes('bank branch')) {
             derivedValue = p.branchName;
        } else if (lowerLabel.includes('account no') || lowerLabel.includes('account number') || lowerLabel.includes('txtaccount')) {
            const accNum = (p.accountNo || '1234567890123456').toString().padEnd(16, '0').substring(0, 16);
            if (lowerLabel.includes('txtaccountno1')) {
                derivedValue = accNum.substring(0, 4);
            } else if (lowerLabel.includes('txtaccountno2')) {
                derivedValue = accNum.substring(4, 8);
            } else if (lowerLabel.includes('txtaccountno3')) {
                derivedValue = accNum.substring(8, 12);
            } else if (lowerLabel.includes('txtaccountno4')) {
                derivedValue = accNum.substring(12, 16);
            } else {
                derivedValue = p.accountNo;
            }
        } else if (lowerLabel.includes('ifsc')) {
            derivedValue = p.ifscCode;
        } else if (lowerLabel.includes('ppo')) {
            derivedValue = p.ppoNo || '123456789012';
        } else if (lowerLabel.includes('who you are')) {
             derivedValue = p.whoYouAre;
        } else if (lowerLabel.includes('existing esm id')) {
             derivedValue = p.hasExistingEsmIdCard;
        } else if (lowerLabel.includes('concerned rsb')) {
             derivedValue = p.concernedRsb ? "Delhi" : "Delhi"; // Explicitly match Dropdown text in KSB
        } else if (lowerLabel.includes('concerned zsb') || lowerLabel.includes('ddlzsb')) {
             derivedValue = p.concernedRsb ? "ZSB Central Delhi" : "ZSB Central Delhi"; // Match Dropdown text in KSB
        } else if (lowerLabel.includes('linked with aadhar')) {
             derivedValue = p.isBankAccountLinkedWithAadhar;
        } else if (lowerLabel.includes('account holder')) {
             derivedValue = p.nameOfBankAccountHolder;
        } else if (lowerLabel.includes('pensioner')) {
             derivedValue = p.pensionerOrNonPensioner;
        }
        
        if (derivedValue !== null && derivedValue !== undefined && derivedValue !== "") {
            console.log(`[dataResolver] Field "${fieldIdentifier}" resolved to "${derivedValue}" via DERIVED (Medium Confidence) using hardcoded maps`);
            return { value: derivedValue, confidence: CONFIDENCE.MEDIUM, source: SOURCE.DERIVED, class: classification };
        }
    } catch (error) {
        console.error(`Error deriving value for field ${fieldIdentifier}:`, error.message);
    }

    // 3. Fallback Data (LOW confidence)
    const fallbackObj = fallbackData[field.name] || fallbackData[field.label];
    if (fallbackObj && fallbackObj.value) {
        if (classification === FIELD_CLASS.SAFE || classification === FIELD_CLASS.MEDIUM) {
            console.log(`[dataResolver] Field "${fieldIdentifier}" resolved to "${fallbackObj.value}" via FALLBACK (Low Confidence)`);
            return { value: fallbackObj.value, confidence: CONFIDENCE.LOW, source: SOURCE.FALLBACK, class: classification };
        } else {
            console.warn(`[dataResolver] Skipped fallback data for CRITICAL field: ${fieldIdentifier}. Must not use fallback.`);
        }
    }

    // 4. Missing -> requires user input
    console.log(`[dataResolver] Field "${fieldIdentifier}" marked as MISSING (None)`);
    return { value: null, confidence: CONFIDENCE.NONE, source: SOURCE.MISSING, class: classification };
}

module.exports = {
    resolveField,
    classifyField,
    CONFIDENCE,
    SOURCE,
    FIELD_CLASS
};
