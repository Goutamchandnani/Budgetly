const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { forgotPassword, resetPassword, exportData, deleteAccount } = require('../controllers/authController');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        // Check password (using method from User model)
        // Note: comparePassword might be named matchPassword in some implementations, 
        // checking User.js it is comparePassword
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                monthlyBudget: user.monthlyBudget,
                currency: user.currency,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
    try {
        // Middleware should have attached user to req
        // But we need to verify token here if middleware is not used globally
        // For now assuming we implement an auth middleware

        // Quick auth check since middleware file might be separate
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ error: 'Not authorized' });
    }
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', forgotPassword);

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', resetPassword);

// @desc    Export user data
// @route   GET /api/auth/export
// @access  Private
router.get('/export', async (req, res, next) => {
    // Middleware logic
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Or decoded.userId depending on how it was signed
        // Checking controller login: jwt.sign({ userId: user._id }...
        // Checking controller signup: jwt.sign({ userId: user._id }...
        // Wait, looking at lines 39 in authRoutes.js: token: generateToken(user._id)
        // And generateToken function: jwt.sign({ id }, ...

        // Wait, inconsistency found!
        // In authController.js (signup/login) it signs { userId: user._id }
        // In authRoutes.js (signup/login) it uses generateToken which signs { id }
        // The codebase seems to have mixed implementations or I am misreading. 
        // Let's check authController.js again in history.
        // authController.js lines 11 & 32: jwt.sign({ userId: user._id }
        // authRoutes.js line 9: jwt.sign({ id }

        // The authRoutes.js signup/login handlers seem to be custom implementations inside the route file?
        // Lines 17-47 and 52-77 of authRoutes.js contain logic that duplicates or substitutes authController?
        // Ah, authRoutes.js IMPORTS signup/login from authController but DOES NOT USE THEM in the route definitions shown in previous `view_file`.
        // Wait, `view_file` of authRoutes.js showed implementation INLINE for /signup and /login.
        // BUT `authController.js` HAD `signup` and `login` functions exported.
        // This suggests the codebase has duplicate logic or unused controller functions.
        // However, I must follow the pattern of the file I am editing.
        // For /me route (lines 82-109), it does standard JWT verification.
        // line 98: const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // line 99: const user = await User.findById(decoded.id)... 

        // So for the current routes in this file, the payload is { id }.
        // However, `authController.js` logic expects `req.userId`.
        // If I use `authController.exportData`, it uses `req.userId`.
        // So I need to set `req.userId = decoded.id`.

        // BUT, if I am calling `exportData` from `authController`, I should check what IT expects.
        // `exportData` in `authController.js`: `const user = await User.findById(req.userId)...`

        // So I need to ensure `req.userId` is set.
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Not authorized' });
    }
}, exportData);

// @desc    Delete user account
// @route   DELETE /api/auth/me
// @access  Private
router.delete('/me', async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: 'Not authorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Not authorized' });
    }
}, deleteAccount);

module.exports = router;
