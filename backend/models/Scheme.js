const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    source_url: { type: String },
    application_steps: { type: String },
    benefits: { type: String },
    eligibility: { type: String },
    date_of_scheme_launch: { type: String },
    category_tags: [{ type: String }],
    industry_tags: [{ type: String }],
    location_tags: [{ type: String }],
    target_audience_tags: [{ type: String }],
    scheme_id: { type: String }
  },
  { timestamps: true }
);

// Indexes for common query patterns
schemeSchema.index({ industry_tags: 1 });
schemeSchema.index({ location_tags: 1 });

// Explicitly bind to the "myscheme_gov_in" collection where your scraped data is stored
module.exports = mongoose.model('Scheme', schemeSchema, 'myscheme_gov_in');
