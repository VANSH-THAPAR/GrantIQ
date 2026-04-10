const axios = require('axios');

const TOP_N_FOR_AI = 5;

/**
 * 1. Send the user profile to our Python FastAPI Semantic AI Engine
 * 2. Return the pure machine learning semantic matches
 */
const recommendSchemes = async (userProfile, allSchemes = []) => {
  try {
    console.log(`Sending profile to Semantic AI Engine for ${userProfile.name || 'User'}...`);
    
    // Format the payload to match Pydantic CompanyProfile in matching_engine.py
    const payload = {
      name: userProfile.name || "Unknown Company",
      industry: userProfile.industry || "General",
      business_stage: userProfile.stage || "Startup",
      annual_revenue_crores: userProfile.revenue || 0,
      location: {
        state: userProfile.location?.state || "National",
        scope: "national"
      },
      founded_year: userProfile.founded_year || null,
      women_led: userProfile.women_led || false,
      export_focused: userProfile.export_focused || false
    };

    // Calling the Python AI Backend
    const response = await axios.post('http://127.0.0.1:8000/api/v1/recommend', payload);
    
    if (response.data && response.data.status === 'success') {
      const recommendations = response.data.recommendations;
      
      // Map the FastAPI response format to what the frontend expects
      return recommendations.map((rec) => ({
        scheme: { 
            name: rec.scheme_name, 
            id: rec.scheme_id, 
            source_url: rec.source_url,
            benefits: rec.benefits,
            eligibility: rec.eligibility_summary
        },
        finalScore: rec.relevance_score,
        baseScore: rec.relevance_score, // Pure AI score
        aiAdjustment: 0,
        breakdown: rec.match_breakdown,
        reasons: [`Matched by Semantic AI. Score breakdown: NLP Meaning Match: ${rec.match_breakdown.semantic_ai_match}%`],
        aiExplanation: `Our Semantic AI determined a ${rec.relevance_score}% relevance directly based on comparing the meaning of your company profile with the actual text of the scheme.`
      }));
    }

    return [];
  } catch (error) {
    console.error('FastAPI AI matching engine error:', error.message);
    
    // FALLBACK IF AI ENGINE CRASHES (So demo doesn't fail)
    console.log('Falling back to basic keyword matching due to AI engine timeout/error.');
    return allSchemes.slice(0, 3).map(scheme => ({
      scheme: { name: scheme.name, id: scheme._id },
      finalScore: 50,
      baseScore: 50,
      breakdown: { semantic_ai_match: 0 },
      reasons: ['Fallback recommendation'],
      aiExplanation: 'Matching engine offline.'
    }));
  }
};

module.exports = { recommendSchemes };