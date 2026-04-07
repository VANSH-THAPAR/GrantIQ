module.exports = function evaluateLocation(userState, schemeState) {
  if (!schemeState || schemeState.toLowerCase() === 'central' || schemeState.toLowerCase() === 'all') {
    return { score: 100, reason: 'Central/National scheme, applicable anywhere.' };
  }

  if (schemeState.toLowerCase() === userState.toLowerCase()) {
    return { score: 100, reason: 'State location matches perfectly.' };
  }

  return { score: 0, reason: `Scheme is specific to another state (${schemeState}).` };
};