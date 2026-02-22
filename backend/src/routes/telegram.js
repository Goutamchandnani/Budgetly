const express = require('express');
const { generateLinkCode, getStatus, disconnect, webhook } = require('../controllers/telegramController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/generate-code', authMiddleware, generateLinkCode);
router.get('/status', authMiddleware, getStatus);
router.delete('/disconnect', authMiddleware, disconnect);
router.post('/webhook', webhook);

module.exports = router;
