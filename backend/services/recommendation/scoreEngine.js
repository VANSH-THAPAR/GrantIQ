const evaluateIndustry = require('./factors/industryScore');
const evaluateStage = require('./factors/stageScore');
const evaluateLocation = require('./factors/locationScore');
const evaluateRevenue = require('./factors/revenueScore');
const evaluateDemographics = require('./factors/demographicScore');
const evaluateAge = require('./factors/ageScore');
const weights = require('./weights');

const calculateBaseScore = (user, scheme) => {
  // Gracefully handle potentially missing array structures from scraped data
  const schemeIndustries = scheme.industry || scheme.industries || [];
  const schemeStages = scheme.stage || scheme.stages || [];
  const schemeDemographics = scheme.demographics || ['All'];
  
  const industryRes = evaluateIndustry(user.industry, schemeIndustries);
  const stageRes = evaluateStage(user.stage, schemeStages);
  const locationRes = evaluateLocation(user.state, scheme.state);
  const revenueRes = evaluateRevenue(user.revenue, scheme.minRevenue, scheme.maxRevenue);
  const demographicRes = evaluateDemographics(user.founderCategory, schemeDemographics);
  const ageRes = evaluateAge(user.yearOfEstablishment, scheme.minAge, scheme.maxAge);

  const baseScore = 
    (industryRes.score * weights.industry) +
    (stageRes.score * weights.stage) +
    (locationRes.score * weights.location) +
    (demographicRes.score * weights.demographics) +
    (ageRes.score * weights.age) +
    (revenueRes.score * weights.revenue);

  return {
    scheme: scheme,
    baseScore: Math.round(baseScore),
    breakdown: {
      industry: industryRes.score,
      stage: stageRes.score,
      location: locationRes.score,
      demographics: demographicRes.score,
      age: ageRes.score,
      revenue: revenueRes.score
    },
    reasons: [
      industryRes.reason,
      stageRes.reason,
      locationRes.reason,
      demographicRes.reason,
      ageRes.reason,
      revenueRes.reason
    ].filter(r => r) // Remove any empty reasons
  };
};

module.exports = { calculateBaseScore };