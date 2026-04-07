module.exports = function evaluateStage(userStage, schemeStages = []) {
  if (!schemeStages || schemeStages.length === 0 || schemeStages.includes('All')) {
    return { score: 100, reason: 'Scheme is open to all business stages.' };
  }

  if (schemeStages.includes(userStage)) {
    return { score: 100, reason: 'Business stage fits scheme requirements perfectly.' };
  }

  return { score: 0, reason: `Business stage (${userStage}) does not match requirements.` };
};