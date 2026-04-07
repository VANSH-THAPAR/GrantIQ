module.exports = function evaluateAge(userYear, schemeMinAge = null, schemeMaxAge = null) {
  if (!userYear) return { score: 50, reason: 'Business age largely unknown; default assumptions made.' };
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - userYear;
  
  let score = 100;
  let reason = 'Business age meets scheme criteria perfectly.';

  if (schemeMinAge != null && age < schemeMinAge) {
      score = 0;
      reason = `Business is too new (minimum ${schemeMinAge} years). Currently ${age} years old.`;
  } else if (schemeMaxAge != null && age > schemeMaxAge) {
      score = 0;
      reason = `Business is too old (maximum ${schemeMaxAge} years). Currently ${age} years old.`;
  } else if (schemeMinAge == null && schemeMaxAge == null) {
      reason = 'No explicit business age limitations for this scheme.';
  }

  return { score, reason };
};