const evaluateIndustry = require('./factors/industryScore');
const evaluateStage = require('./factors/stageScore');
const evaluateLocation = require('./factors/locationScore');
const evaluateRevenue = require('./factors/revenueScore');
const evaluateDemographics = require('./factors/demographicScore');
const evaluateAge = require('./factors/ageScore');
const weights = require('./weights');

const calculateBaseScore = (user, scheme) => {
  // Gracefully handle potentially missing array structures from scraped data
  const schemeIndustries = scheme.industry_tags || scheme.industry || [];
  const schemeStages = scheme.category_tags || scheme.stage || [];
  const schemeDemographics = scheme.target_audience_tags || scheme.demographics || ['All'];
  const schemeLocation = (scheme.location_tags && scheme.location_tags.length > 0) ? scheme.location_tags[0] : 'All';
  
  const industryRes = evaluateIndustry(user.industry, schemeIndustries);
  const stageRes = evaluateStage(user.stage, schemeStages);
  const locationRes = evaluateLocation(user.state, schemeLocation);
  
  const schemeMinRev = scheme.minRevenue !== undefined ? scheme.minRevenue : 0;
  const schemeMaxRev = scheme.maxRevenue !== undefined ? scheme.maxRevenue : Infinity;
  const schemeMinAge = scheme.minAge !== undefined ? scheme.minAge : 0;
  const schemeMaxAge = scheme.maxAge !== undefined ? scheme.maxAge : Infinity;

  const revenueRes = evaluateRevenue(user.revenue, schemeMinRev, schemeMaxRev);
  const demographicRes = evaluateDemographics(user.founderCategory, schemeDemographics);
  const ageRes = evaluateAge(user.yearOfEstablishment, schemeMinAge, schemeMaxAge);

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