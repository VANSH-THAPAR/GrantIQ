const { calculateBaseScore } = require('./scoreEngine');
const { enhanceWithAI } = require('./aiEnhancer');

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
  let scoredSchemes = allSchemes.map(scheme => {
    return calculateBaseScore(userProfile, scheme);
  });

  // Step 2: Sort based on baseScore desc, cut top N
  scoredSchemes.sort((a, b) => b.baseScore - a.baseScore);
  const topScoredSchemes = scoredSchemes.slice(0, TOP_N_FOR_AI);
  const remainingSchemes = scoredSchemes.slice(TOP_N_FOR_AI);

  // Step 3 & 4: Process top schemes through AI (Parallel requests)
  const aiEnhancedPromises = topScoredSchemes.map(async (item) => {
    const aiAnalysis = await enhanceWithAI(userProfile, item.scheme, item.baseScore);
    
    // finalScore = baseScore + adjustment
    let finalScore = item.baseScore + (aiAnalysis.adjustment || 0);
    // Bound to max 100
    finalScore = Math.min(100, Math.max(0, finalScore));

    return {
      scheme: item.scheme,
      finalScore: finalScore,
      baseScore: item.baseScore,
      aiAdjustment: aiAnalysis.adjustment || 0,
      confidence: aiAnalysis.confidence || 0,
      breakdown: item.breakdown,
      reasons: item.reasons,
      aiExplanation: aiAnalysis.explanation || "No AI feedback"
    };
  });

  const enhancedTopSchemes = await Promise.all(aiEnhancedPromises);

  // Reformat remaining schemes to match the schema but without AI applied
  const unenhancedSchemes = remainingSchemes.map(item => ({
    scheme: item.scheme,
    finalScore: item.baseScore,
    baseScore: item.baseScore,
    aiAdjustment: 0,
    confidence: null,
    breakdown: item.breakdown,
    reasons: item.reasons,
    aiExplanation: "Not evaluated by AI layer"
  }));

  // Combine top N and remaining
  const finalResults = [...enhancedTopSchemes, ...unenhancedSchemes];

  // Step 5: Re-rank schemes
  finalResults.sort((a, b) => b.finalScore - a.finalScore);

  // Return formatted array list
  return finalResults.map(({ scheme, finalScore, baseScore, aiAdjustment, breakdown, reasons, aiExplanation }) => ({
    scheme: { name: scheme.name, id: scheme._id || null }, // Expose only required info
    finalScore,
    baseScore,
    aiAdjustment,
    breakdown,
    reasons,
    aiExplanation
  }));
};

module.exports = { recommendSchemes };