const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long'],
            match: [
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
            ],
            select: false
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        monthlyBudget: {
            type: Number,
            default: 100,
            min: [0, 'Budget cannot be negative']
        },
        currency: {
            type: String,
            default: 'GBP',
            uppercase: true,
            enum: {
                values: ['GBP', 'USD', 'EUR'],
                message: '{VALUE} is not a supported currency'
            }
        },
        telegramChatId: {
            type: String,
            unique: true,
            sparse: true // Allows multiple undefined values
        },
        telegramUsername: {
            type: String,
            default: null
        },
        linkingCode: {
            type: String,
            default: null
        },
        linkingCodeExpiry: {
            type: Date,
            default: null
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date
    },
    {
        timestamps: true
    }
);

// ... existing indexes ...

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
    const crypto = require('crypto');
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Indexes for performance removed as they are defined in schema

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user without password
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.linkingCode;
    delete user.linkingCodeExpiry;
    return user;
};

// Method to check if linking code is valid
userSchema.methods.isLinkingCodeValid = function () {
    return this.linkingCode && this.linkingCodeExpiry && this.linkingCodeExpiry > new Date();
};

// Method to generate a random linking code
userSchema.methods.generateLinkingCode = function () {
    const crypto = require('crypto');
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.linkingCode = code;
    this.linkingCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    return code;
};

// Method to clear linking code
userSchema.methods.clearLinkingCode = function () {
    this.linkingCode = null;
    this.linkingCodeExpiry = null;
};

module.exports = mongoose.model('User', userSchema);
