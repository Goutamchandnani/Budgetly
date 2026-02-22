const express = require('express');
const { body } = require('express-validator');
const { signup, login, getCurrentUser, forgotPassword, resetPassword, exportData, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');

const router = express.Router();

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again after 15 minutes' }
});

router.post('/signup', authLimiter, [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    handleValidationErrors
], signup);

router.post('/login', authLimiter, login);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/export', authMiddleware, exportData);
router.delete('/me', authMiddleware, deleteAccount);

module.exports = router;
