const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth Middleware
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

// @desc    Get user budget
// @route   GET /api/budget
router.get('/', protect, async (req, res) => {
    try {
        res.json({
            monthlyBudget: req.user.monthlyBudget,
            currency: req.user.currency
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Update user budget
// @route   PUT /api/budget
router.put('/', protect, async (req, res) => {
    try {
        const { monthlyBudget, currency } = req.body;

        // Update fields if provided
        if (monthlyBudget !== undefined) req.user.monthlyBudget = monthlyBudget;
        if (currency) req.user.currency = currency;

        await req.user.save();

        res.json({
            monthlyBudget: req.user.monthlyBudget,
            currency: req.user.currency
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
