const express = require('express');
const router = express.Router();
const { triggerScraper, getSchemes, getSchemeById, getRecommendedSchemes } = require('../controllers/schemeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scrape', protect, triggerScraper); // Protected: only authenticated users can trigger
router.get('/', getSchemes);
router.get('/recommended/:userId', getRecommendedSchemes);
router.get('/:id', getSchemeById);

module.exports = router;
