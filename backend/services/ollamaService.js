const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = 'mistral'; // Hardcoded mistral for now

async function deriveValue(field, userData) {
    const prompt = `
        You are an intelligent data derivation engine mapping user profiles to form inputs safely.
        
        USER DATA:
        ${JSON.stringify(userData, null, 2)}
        
        TARGET FIELD:
        Label: "${field.label}"
        Name: "${field.name}"
        Type: "${field.type}"
        Required: ${field.required}
        Options (if any dropdown): ${JSON.stringify(field.options || [])}

        Task: Examine the user data to find the most accurate value for this specific field. Ensure the format matches the field type. Do not hallucinate unknown values. If the dropdown options are constrained, return EXACTLY the matched option value. Return ONLY valid JSON and nothing else. No markdown formatting.
        
        Format:
        { "derived_value": "..." }

        If no confident match can be made, return: { "derived_value": null }
    `;

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: MODEL,
            prompt: prompt,
            stream: false,
            format: 'json'
        });

        const raw = response.data.response;
        const result = JSON.parse(raw);
        if (result && result.derived_value) {
            return result.derived_value;
        }

        return null;
    } catch (error) {
        console.error('Ollama invocation failed:', error.message);
        return null;
    }
}

async function callOllamaFullMapping(fields, userData) {
     // Optional batch processing instead of field-by-field derivation
}

module.exports = { deriveValue, callOllamaFullMapping };