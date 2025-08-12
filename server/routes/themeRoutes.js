const express = require('express');
const { getThemeSettings, updateThemeSettings } = require('../controllers/themeController');
const router = express.Router();

router.get('/', getThemeSettings);
router.put('/', updateThemeSettings); // TODO: add auth middleware for admin-only access

module.exports = router;
