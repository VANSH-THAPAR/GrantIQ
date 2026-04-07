// Related industries for partial matching — extend as your data grows
const INDUSTRY_RELATIONS = {
  'Fintech': ['IT', 'Finance', 'Digital Services', 'Services'],
  'IT': ['Fintech', 'EdTech', 'Digital Services', 'Services'],
  'EdTech': ['IT', 'Education', 'Digital Services'],
  'Healthcare': ['Biotech', 'MedTech'],
  'Biotech': ['Healthcare', 'MedTech', 'Agriculture'],
  'Agriculture': ['Food Processing', 'AgriTech', 'Rural & Agri Businesses'],
  'Food Processing': ['Agriculture', 'Manufacturing'],
  'Manufacturing': ['Food Processing', 'Textiles', 'Large Manufacturing'],
  'Defense Tech': ['Aerospace', 'Manufacturing'],
  'Aerospace': ['Defense Tech', 'Manufacturing'],
  'Energy': ['Manufacturing', 'CleanTech'],
  'Retail': ['Logistics', 'Services'],
  'Logistics': ['Retail', 'Manufacturing'],
  'Marine': ['Agriculture', 'Marine Exports'],
  'Textiles': ['Manufacturing', 'Retail'],
};

module.exports = function evaluateIndustry(userIndustry, schemeIndustries = []) {
  if (!schemeIndustries || schemeIndustries.length === 0 ||
      schemeIndustries.includes('All') || schemeIndustries.includes('All Sectors')) {
    return { score: 100, reason: 'Scheme is open to all industries.' };
  }

  // Exact match
  if (schemeIndustries.includes(userIndustry)) {
    return { score: 100, reason: 'Exact industry match found.' };
  }

  // Partial match via related industries
  const related = INDUSTRY_RELATIONS[userIndustry] || [];
  const overlap = schemeIndustries.filter(si => related.includes(si));
  if (overlap.length > 0) {
    return { score: 60, reason: `Related industry match (${userIndustry} is related to ${overlap.join(', ')}).` };
  }

  return { score: 0, reason: `Industry (${userIndustry}) does not match scheme criteria.` };
};