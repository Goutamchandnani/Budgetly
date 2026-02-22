const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Expense = require('../models/Expense');

const signup = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        const normalizedEmail = email ? email.toLowerCase().trim() : '';

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const user = await User.create({ email: normalizedEmail, password, name });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({ user, token });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Normalize email
        const normalizedEmail = email ? email.toLowerCase().trim() : '';

        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        // Generic error message to prevent enumeration
        const invalidCredentials = () => res.status(401).json({ error: 'Invalid credentials' });

        if (!user) {
            return invalidCredentials();
        }

        if (!(await user.comparePassword(password))) {
            return invalidCredentials();
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Remove password from response
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.json({ user });
    } catch (error) {
        next(error);
    }
};



const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ error: 'There is no user with that email' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Budgetly Password Reset Token',
                message: `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ error: 'Email could not be sent' });
        }
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ success: true, token, user });
    } catch (error) {
        next(error);
    }
};

const exportData = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('-password -__v');
        const expenses = await Expense.find({ userId: req.userId }).select('-__v');

        res.json({
            user,
            expenses,
            exportedAt: new Date()
        });
    } catch (error) {
        next(error);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        // Delete all user expenses
        await Expense.deleteMany({ userId: req.userId });

        // Delete user
        await User.findByIdAndDelete(req.userId);

        res.json({ success: true, message: 'Account and all data deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { signup, login, getCurrentUser, forgotPassword, resetPassword, exportData, deleteAccount };
