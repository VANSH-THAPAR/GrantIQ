module.exports = function evaluateDemographics(userCategory, schemeDemographics = []) {
  if (!schemeDemographics || schemeDemographics.length === 0 || schemeDemographics.includes('All') || schemeDemographics.includes('General')) {
    return { score: 100, reason: 'Scheme is open to all demographics.' };
  }

  if (userCategory && schemeDemographics.includes(userCategory)) {
    return { score: 100, reason: `Targeted scheme match for ${userCategory} founders.` };
  }

  return { score: 0, reason: `Scheme heavily targeted towards ${schemeDemographics.join(', ')} founders.` };
};