const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_tests');
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Or any suitable Gemini model
} catch (e) {
  console.warn("Gemini API key missing, but proceeding for tests.");
}

/**
 * Enhances a single scheme's recommendation using AI
 * @param {Object} userProfile The user's business profile
 * @param {Object} scheme The scheme details
 * @param {Number} baseScore The rule-based engine score
 * @returns {Promise<Object>} AI analysis output
 */
const enhanceWithAI = async (userProfile, scheme, baseScore) => {
  try {
    const prompt = `
You are an expert AI business advisor assessing if a government scheme fits a business.

Business Profile: 
${JSON.stringify({
  industry: userProfile.industry,
  stage: userProfile.stage,
  state: userProfile.state,
  revenue: userProfile.revenue,
  businessType: userProfile.businessType,
  yearOfEstablishment: userProfile.yearOfEstablishment,
  founderCategory: userProfile.founderCategory,
  employeeCount: userProfile.employeeCount
}, null, 2)}

Scheme Details: 
${JSON.stringify({
  name: scheme.name,
  description: scheme.description || scheme.name,
  industries: scheme.industry || scheme.industries,
  stage: scheme.stage || scheme.stages,
  benefits: scheme.benefits,
  demographics: scheme.demographics,
  requirements: scheme.eligibilityRequirements || "Unknown"
}, null, 2)}

Rule-based matched score: ${baseScore}/100

Analyze the semantic relevance of the scheme to the business (e.g. identify hidden relevance like fintech matching with digital payments, funding purpose overlap, or explicit demographic focus).
Provide an adjustment to the base score (between -10 and +10). A +10 means absolutely perfect hidden match, a -10 means the scheme has clauses that explicitly exclude the user despite basic matching.

Also identify any 'missing requirements'. For example, if the user needs a 'DPIIT Certificate' or 'Udyam Registration' not listed in their profile, note it. If they are fundamentally excluded (e.g. scheme is only for Women but founder is General Male), set eligibilityWarning to true.

Respond STRICTLY in JSON format with exactly 5 fields:
- "adjustment": integer between -10 and 10
- "confidence": decimal between 0.0 and 1.0
- "explanation": a short 1-2 sentence human-readable explanation of why this scheme is or isn't a good fit.
- "missingRequirements": an array of strings listing actions or certificates the user needs to get to be eligible (empty array if none).
- "eligibilityWarning": boolean flag (true ONLY if the user is strictly disqualified by age, gender, or explicit constraints).
JSON:
`;

    // Note: Configure model properly with generateContent
    if (!model) throw new Error("Gemini Model not initialized");

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON from the markdown code block if applicable
    const jsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiResult = JSON.parse(jsonString);
    
    // Safety check constraints
    aiResult.adjustment = Math.max(-10, Math.min(10, aiResult.adjustment || 0));
    
    return aiResult;
  } catch (error) {
    console.error("AI Enhancer Error for scheme:", scheme.name, error);
    // Graceful fallback
    return {
      adjustment: 0,
      confidence: 0,
      explanation: "AI analysis unavailable. Base score applied.",
      missingRequirements: [],
      eligibilityWarning: false
    };
  }
};

module.exports = { enhanceWithAI };
