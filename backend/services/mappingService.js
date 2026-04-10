// mappingService.js integrates dataResolver to build confident outputs

const dataResolver = require('./dataResolver');
const formParser = require('./formParser');

class MappingService {
    async mapExtractedFields(extractOutput, userData, fallbackData) {
        // Parse the raw DOM extract into structured fields
        const parsedSchema = formParser.parseHTMLToSchema(extractOutput);
        
        let mappedResult = {};

        // Iterate and resolve each field systematically
        for (const field of parsedSchema) {
            // resolveField(field, userData, fallbackData) returns 
            // { value, confidence, source, classification }
            const resolution = await dataResolver.resolveField(field, userData, fallbackData);
            
            mappedResult[field.label || field.name] = {
                value: resolution.value,
                confidence: resolution.confidence,
                source: resolution.source,
                class: resolution.class,
                originalFieldProps: field // Persist DOM pointers
            };
            
            if (resolution.confidence === 'none') {
                console.log(`[MappingService] Warning: Missing data for field: ${field.label || field.name}`);
            } else {
                console.log(`[MappingService] Mapped [${field.label || field.name}] -> "${resolution.value}" (Conf: ${resolution.confidence} | Source: ${resolution.source})`);
            }
        }

        return mappedResult;
    }
}

module.exports = MappingService;
