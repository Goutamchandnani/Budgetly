const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth Middleware (Since we didn't create a separate file yet, or to be safe)
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

// @desc    Get all expenses
// @route   GET /api/expenses
router.get('/', protect, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Create new expense
// @route   POST /api/expenses
router.post('/', protect, async (req, res) => {
    try {
        const { amount, description, category, date } = req.body;

        const expense = await Expense.create({
            userId: req.user._id,
            amount,
            description,
            category: category || 'Other',
            date: date || Date.now()
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Check user
        if (expense.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'User not authorized' });
        }

        await expense.deleteOne();
        res.json({ id: req.params.id, message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        // Check user
        if (expense.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'User not authorized' });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedExpense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
