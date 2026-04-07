require('dotenv').config({ path: '../.env' });
const { recommendSchemes } = require('./recommendation/recommendationService');
const { calculateBaseScore } = require('./recommendation/scoreEngine');

const sampleUser = {
  name: 'FinFlow Services',
  industry: 'Fintech',
  stage: 'Startup',
  state: 'Maharashtra',
  revenue: 500000,
  yearOfEstablishment: 2021,
  founderCategory: 'Women',
  employeeCount: 15
};

const sampleSchemes = [
  { _id: 1, name: 'Digital India Startup Grant', industries: ['IT'], stages: ['Startup'], state: 'Central', minRevenue: null, maxRevenue: null, minAge: 0, maxAge: 10, demographics: ['All'] },
  { _id: 2, name: 'ScaleUp Fintech Fund', industries: ['Fintech'], stages: ['Scale'], state: 'Central', minRevenue: 1000000, maxRevenue: null, minAge: 5, maxAge: 15, demographics: ['All'] },
  { _id: 3, name: 'AgriTech Seed Yojana', industries: ['Agriculture'], stages: ['Seed'], state: 'Maharashtra', minRevenue: null, maxRevenue: null, demographics: ['SC/ST', 'Women'] },
];

async function runTests() {
  console.log("=== Testing BEFORE AI (Base Scores) ===");
  const baseScores = sampleSchemes.map(s => calculateBaseScore(sampleUser, s));
  console.log(JSON.stringify(baseScores.map(s => ({ scheme: s.scheme.name, score: s.baseScore })), null, 2));

  console.log("\n=== Testing AFTER AI (Combined Pipeline) ===");
  const finalRankings = await recommendSchemes(sampleUser, sampleSchemes);
  
  console.log(JSON.stringify(finalRankings, null, 2));
}

runTests();