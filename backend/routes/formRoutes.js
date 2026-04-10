const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

router.post('/fill', formController.fillForm);
router.post('/auto-agent', formController.runAutoAgent);

module.exports = router;
