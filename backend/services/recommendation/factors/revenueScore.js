module.exports = function evaluateRevenue(userRevenue = 0, schemeMinRevenue, schemeMaxRevenue) {
  let score = 100;
  let reason = 'Revenue fits within scheme criteria limits.';

  if (schemeMinRevenue != null && userRevenue < schemeMinRevenue) {
    score = 0;
    reason = 'Revenue is below the scheme minimum requirement.';
  } else if (schemeMaxRevenue != null && userRevenue > schemeMaxRevenue) {
    score = 0;
    reason = 'Revenue exceeds the scheme maximum limit.';
  }

  if (schemeMinRevenue == null && schemeMaxRevenue == null) {
      reason = 'No revenue restrictions specified for this scheme.';
  }

  return { score, reason };
};