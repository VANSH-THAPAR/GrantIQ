const mongoose = require('mongoose');

const VALID_INDUSTRIES = [
  'IT', 'Fintech', 'Agriculture', 'Healthcare', 'Manufacturing',
  'EdTech', 'Food Processing', 'Biotech', 'Defense Tech', 'Aerospace',
  'Marine', 'Retail', 'Logistics', 'Energy', 'Textiles', 'Other'
];

const VALID_STAGES = [
  'Ideation', 'Validation', 'Early Traction', 'Startup', 'Growth', 'Scaling', 'Mature'
];

const VALID_BUSINESS_TYPES = [
  'Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited',
  'Public Limited', 'One Person Company', 'Section 8', 'Other'
];

const VALID_FOUNDER_CATEGORIES = [
  'General', 'Women', 'SC/ST', 'OBC', 'Minority', 'Veteran', 'Differently Abled'
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    industry: { type: String, required: true, enum: VALID_INDUSTRIES },
    businessType: { type: String, required: true, enum: VALID_BUSINESS_TYPES },
    stage: { type: String, required: true, enum: VALID_STAGES },
    revenue: { type: Number, required: true, min: 0 },
    employeeCount: { type: Number, required: true, min: 0 },
    yearOfEstablishment: { type: Number, required: true, min: 1900, max: new Date().getFullYear() },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    founderCategory: { type: String, required: true, default: 'General', enum: VALID_FOUNDER_CATEGORIES },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
