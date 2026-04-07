const Scheme = require('../models/Scheme');
const User = require('../models/User');
const { scrapeGovernmentSchemes } = require('../services/scraperService');
const { recommendSchemes } = require('../services/recommendation/recommendationService');

// @desc    Trigger Scraper Manually (For Admins/Cron jobs later)
// @route   POST /api/schemes/scrape
// @access  Public (No tokens for now, until Admin roles are built)
const triggerScraper = async (req, res) => {
  try {
    const newSchemes = await scrapeGovernmentSchemes();
    res.status(201).json({
      message: 'Scraping successful',
      count: newSchemes.length,
      data: newSchemes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch all schemes (paginated)
// @route   GET /api/schemes?page=1&limit=20
// @access  Public
const getSchemes = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [schemes, total] = await Promise.all([
      Scheme.find({}).skip(skip).limit(limit).lean(),
      Scheme.countDocuments()
    ]);

    res.json({
      data: schemes,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single scheme by ID
// @route   GET /api/schemes/:id
// @access  Public
const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id).lean();

    if (scheme) {
      res.json(scheme);
    } else {
      res.status(404).json({ message: 'Scheme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommended schemes for a user
// @route   GET /api/schemes/recommended/:userId
// @access  Public (or protected if token strategy is enforced)
const getRecommendedSchemes = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Pre-filter at DB level: only fetch schemes that could possibly match
    // Updated to use industry_tags from myscheme_gov_in collection
    const relevantSchemes = await Scheme.find({
      $or: [
        { industry_tags: { $in: [user.industry, 'All Sectors', 'All'] } },
        { industry_tags: { $size: 0 } },
        { industry_tags: { $exists: false } }
      ]
    }).lean();

    // Process through the hybrid AI recommendation pipeline
    const recommendations = await recommendSchemes(user, relevantSchemes);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error("Recommendation Engine Error:", error);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
};

// @desc    Direct route to test recommended schemes matching without a user id
// @route   POST /api/schemes/test-recommend
// @access  Public
const testRecommendationsDirect = async (req, res) => {
  try {
    const userProfile = req.body; // Pass user profile directly in request body

    const relevantSchemes = await Scheme.find({
      $or: [
        { industry_tags: { $in: [userProfile.industry, 'All Sectors', 'All'] } },
        { industry_tags: { $size: 0 } },
        { industry_tags: { $exists: false } }
      ]
    }).lean();

    const recommendations = await recommendSchemes(userProfile, relevantSchemes);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error("Test Recommendation Engine Error:", error);
    res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
  }
};

module.exports = { triggerScraper, getSchemes, getSchemeById, getRecommendedSchemes, testRecommendationsDirect };