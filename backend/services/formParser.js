function parseHTMLToSchema(extractFieldsOutput) {
    if (!extractFieldsOutput || !Array.isArray(extractFieldsOutput)) {
        return [];
    }

    return extractFieldsOutput.map(field => {
        // Keep ID for Playwright fallback
        return {
            label: field.label,
            name: field.name,
            type: field.type,
            id: field.id,
            required: field.required,
            options: field.options || []
        };
    }).filter(f => f.label || f.name); // only keep actionable fields
}

module.exports = { parseHTMLToSchema };
