const express = require('express');
const router = express.Router();
const { getStatus } = require('../controllers/status.controller');

// GET /api/internal/status
router.get('/status', getStatus);

module.exports = router;