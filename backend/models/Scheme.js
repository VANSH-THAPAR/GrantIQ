const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    industry: [{ type: String }],
    stage: [{ type: String }],
    benefits: { type: String },
    deadline: { type: Date },
    documents: [{ type: String }],
    link: { type: String, required: true },
    // Fields required by the recommendation scoring engine
    state: { type: String, default: 'Central' },
    minRevenue: { type: Number, default: null },
    maxRevenue: { type: Number, default: null },
    minAge: { type: Number, default: null },
    maxAge: { type: Number, default: null },
    demographics: [{ type: String, default: 'All' }],
  },
  { timestamps: true }
);

// Indexes for common query patterns
schemeSchema.index({ industry: 1 });
schemeSchema.index({ stage: 1 });
schemeSchema.index({ state: 1 });
schemeSchema.index({ link: 1 }, { unique: true });

module.exports = mongoose.model('Scheme', schemeSchema);
