const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth Middleware (Inline for consistency with other routes)
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ error: 'Not authorized' });
        }
    } else {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

// @desc    Generate a new linking code
// @route   POST /api/telegram/link
router.post('/link', protect, async (req, res) => {
    try {
        const code = req.user.generateLinkingCode();
        await req.user.save();

        res.json({
            code,
            expiry: req.user.linkingCodeExpiry,
            botUsername: process.env.TELEGRAM_BOT_USERNAME || 'YourBudgetlyBot'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Get current linking status
// @route   GET /api/telegram/status
router.get('/status', protect, async (req, res) => {
    try {
        const isLinked = !!req.user.telegramChatId;
        res.json({
            isLinked,
            telegramUsername: req.user.telegramUsername,
            code: req.user.linkingCode
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
