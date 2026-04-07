const { calculateBaseScore } = require('./scoreEngine');
const aiEnhancer = require('./aiEnhancer');

const TOP_N_FOR_AI = 5;

/**
 * 1. Run rule-based scoring
 * 2. Filter top N schemes (e.g. top 5-10)
 * 3. Send top N to AI
 * 4. Apply AI adjustments
 * 5. Re-rank schemes
 * 6. Return final output
 */
const recommendSchemes = async (userProfile, allSchemes = []) => {
  // Step 1: Run rule-based scoring for ALL schemes
  let scoredSchemes = allSchemes.map(scheme => calculateBaseScore(userProfile, scheme));

  // Step 2: Sort based on baseScore desc, cut top N
  scoredSchemes.sort((a, b) => b.baseScore - a.baseScore);
  const topScoredSchemes = scoredSchemes.slice(0, TOP_N_FOR_AI);
  const remainingSchemes = scoredSchemes.slice(TOP_N_FOR_AI);

  // Step 3 & 4: Process top schemes through AI sequentially to respect rate limits
  const enhancedTopSchemes = [];
  for (const item of topScoredSchemes) {
    const aiAnalysis = await aiEnhancer.enhanceWithAI(userProfile, item.scheme, item.baseScore);

    let finalScore = item.baseScore + (aiAnalysis.adjustment || 0);
    finalScore = Math.min(100, Math.max(0, finalScore));

    enhancedTopSchemes.push({
      scheme: item.scheme,
      finalScore,
      baseScore: item.baseScore,
      aiAdjustment: aiAnalysis.adjustment || 0,
      confidence: aiAnalysis.confidence || null,
      breakdown: item.breakdown,
      reasons: item.reasons,
      aiExplanation: aiAnalysis.explanation || "No AI feedback",
      missingRequirements: aiAnalysis.missingRequirements || [],
      eligibilityWarning: aiAnalysis.eligibilityWarning || false
    });
  }

  // Reformat remaining schemes to match the schema
  const unenhancedSchemes = remainingSchemes.map(item => ({
    scheme: item.scheme,
    finalScore: item.baseScore,
    baseScore: item.baseScore,
    aiAdjustment: 0,
    confidence: null,
    breakdown: item.breakdown,
    reasons: item.reasons,
    aiExplanation: "Not evaluated by AI layer limit",
    missingRequirements: [],
    eligibilityWarning: false
  }));

  // Combine top N and remaining
  let finalResults = [...enhancedTopSchemes, ...unenhancedSchemes];

  // Step 5: Re-rank schemes
  finalResults.sort((a, b) => b.finalScore - a.finalScore);

  // Return formatted array list
  return finalResults.map(result => ({
    scheme: result.scheme,
    finalScore: result.finalScore,
    baseScore: result.baseScore,
    aiAdjustment: result.aiAdjustment,
    breakdown: result.breakdown,
    reasons: result.reasons,
    aiExplanation: result.aiExplanation,
    missingRequirements: result.missingRequirements,
    eligibilityWarning: result.eligibilityWarning
  }));
};

module.exports = { recommendSchemes };