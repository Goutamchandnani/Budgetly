const api = require('../utils/api');

// User states for tracking conversation flow
const userStates = {};

/**
 * Clear user state after timeout
 * @param {number} chatId - Telegram chat ID
 */
const clearUserState = (chatId) => {
    setTimeout(() => {
        delete userStates[chatId];
    }, 5 * 60 * 1000); // 5 minutes
};

/**
 * /start command - Account linking
 * @param {TelegramBot} bot - Bot instance
 */
module.exports = (bot) => {
    // Handle /start command
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from.username || msg.from.first_name;

        try {
            // Check if already linked
            const isLinked = await api.checkLinked(chatId);

            if (isLinked) {
                bot.sendMessage(chatId,
                    `Welcome back, ${username}! 👋\n\n` +
                    `Your account is linked. Use /add to track expenses.\n` +
                    `Type /help to see all commands.`
                );
            } else {
                bot.sendMessage(chatId,
                    `Welcome to Budgetly! 🎓💰\n\n` +
                    `To get started, please:\n` +
                    `1. Go to the Budgetly web app\n` +
                    `2. Navigate to Settings\n` +
                    `3. Get your linking code\n` +
                    `4. Send the code here to connect your account\n\n` +
                    `Waiting for your linking code...`
                );

                // Set state to wait for linking code
                userStates[chatId] = 'awaiting_code';
                clearUserState(chatId);
            }
        } catch (error) {
            bot.sendMessage(chatId,
                `❌ Error checking account status. Please try again later.`
            );
        }
    });

    // Handle linking code
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        // Skip if it's a command
        if (text && text.startsWith('/')) return;

        if (userStates[chatId] === 'awaiting_code') {
            try {
                // Verify code with backend
                const result = await api.linkAccount(text, chatId, msg.from.username || msg.from.first_name);

                if (result.success) {
                    bot.sendMessage(chatId,
                        `✅ Account linked successfully!\n\n` +
                        `You can now add expenses with:\n` +
                        `/add <amount> <description>\n\n` +
                        `Example: /add 15.50 lunch at cafe\n\n` +
                        `Type /help to see all available commands.`
                    );
                    delete userStates[chatId];
                }
            } catch (error) {
                bot.sendMessage(chatId,
                    `❌ Invalid or expired code.\n\n` +
                    `Please get a new code from the web app and try again.\n` +
                    `Or use /start to restart the linking process.`
                );
            }
        }
    });
};
