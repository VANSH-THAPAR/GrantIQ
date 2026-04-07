const { calculateBaseScore } = require('./scoreEngine');

const sampleUser = {
  name: 'FinFlow Services',
  industry: 'Fintech',
  stage: 'Startup',
  state: 'Maharashtra',
  revenue: 500000 
};

const sampleSchemes = [
  {
    name: 'Digital India Startup Grant',
    industries: ['Fintech', 'IT'],
    stages: ['Startup', 'Seed'],
    state: 'Central',
    minRevenue: 0,
    maxRevenue: null
  },
  {
    name: 'Maha Agri Fund',
    industries: ['Agriculture'],
    stages: ['Startup'],
    state: 'Maharashtra',
    minRevenue: 0,
    maxRevenue: 1000000
  },
  {
    name: 'ScaleUp Fintech Fund',
    industries: ['Fintech'],
    stages: ['Scale'],
    state: 'Karnataka',
    minRevenue: 1000000,
    maxRevenue: null
  }
];

console.log("=== Testing Rule-Based Engine ===");
const results = sampleSchemes.map(scheme => calculateBaseScore(sampleUser, scheme));

results.sort((a, b) => b.baseScore - a.baseScore);
console.log(JSON.stringify(results, null, 2));