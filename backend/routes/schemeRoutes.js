const express = require('express');
const router = express.Router();
const { triggerScraper, getSchemes, getSchemeById, getRecommendedSchemes, testRecommendationsDirect } = require('../controllers/schemeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scrape', protect, triggerScraper); // Protected: only authenticated users can trigger
router.post('/test-recommend', testRecommendationsDirect); // Direct POST to test AI scoring
router.get('/', getSchemes);
router.get('/recommended/:userId', getRecommendedSchemes);
router.get('/:id', getSchemeById);

module.exports = router;
