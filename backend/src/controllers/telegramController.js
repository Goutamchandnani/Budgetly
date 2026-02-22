const User = require('../models/User');
const Expense = require('../models/Expense');
const crypto = require('crypto');

const generateLinkCode = async (req, res, next) => {
    try {
        const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
        await User.findByIdAndUpdate(req.userId, {
            linkingCode: code,
            linkingCodeExpiry: new Date(Date.now() + 600000) // 10 mins
        });
        res.json({ linkingCode: code });
    } catch (error) {
        next(error);
    }
};

const getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.json({ connected: !!user.telegramChatId, telegramUsername: user.telegramUsername });
    } catch (error) {
        next(error);
    }
};

const disconnect = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.userId, { telegramChatId: null });
        res.json({ message: 'Disconnected' });
    } catch (error) {
        next(error);
    }
};

const webhook = async (req, res, next) => {
    try {
        // Verify Telegram Secret Token
        const secretToken = req.headers['x-telegram-bot-api-secret-token'];
        if (process.env.TELEGRAM_WEBHOOK_SECRET && secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { message } = req.body;

        // Scenario 1: Telegram Webhook Update
        if (message) {
            const chatId = message.chat.id;
            const text = message.text;
            const username = message.chat.username;

            // Command: /link <code>
            if (text && text.startsWith('/link ')) {
                const code = text.split(' ')[1];
                if (code && /^[0-9A-Z]{6}$/.test(code)) {
                    // Link logic handled by bot usually.
                }
            }
            return res.json({ ok: true });
        }

        // Scenario 2: Direct API Call (Legacy/Custom Bot)
        const { chatId, description, amount, linkingCode, username } = req.body;

        if (linkingCode) {
            // Validate code format
            if (typeof linkingCode !== 'string' || linkingCode.length > 20) {
                return res.status(400).json({ error: 'Invalid code format' });
            }

            const user = await User.findOne({ linkingCode, linkingCodeExpiry: { $gt: new Date() } });
            if (!user) return res.status(400).json({ error: 'Invalid or expired code' });

            user.telegramChatId = chatId;
            user.telegramUsername = username;
            user.linkingCode = null;
            user.linkingCodeExpiry = null;
            await user.save();
            return res.json({ success: true, message: 'Linked successfully' });
        }

        if (chatId) {
            const user = await User.findOne({ telegramChatId: chatId });
            if (!user) return res.status(404).json({ error: 'User not found' });

            if (description && amount) {
                // Validate inputs
                if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
                if (!description || typeof description !== 'string') return res.status(400).json({ error: 'Invalid description' });

                const expense = await Expense.create({
                    userId: user._id,
                    description: description.trim(),
                    amount,
                    addedVia: 'telegram'
                });
                return res.json({ success: true, expense });
            }
        }

        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
};

module.exports = { generateLinkCode, getStatus, disconnect, webhook };
