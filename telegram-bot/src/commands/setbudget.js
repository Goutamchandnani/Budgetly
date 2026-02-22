const api = require('../utils/api');
const { formatCurrency } = require('../utils/formatters');

/**
 * /setbudget command - Update monthly budget
 * @param {TelegramBot} bot - Bot instance
 */
module.exports = (bot) => {
    bot.onText(/\/setbudget (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const input = match[1].replace('£', '').trim();
        const amount = parseFloat(input);

        try {
            const isLinked = await api.checkLinked(chatId);
            if (!isLinked) {
                return bot.sendMessage(chatId, `⚠️ Please link your account first using /start`);
            }

            if (isNaN(amount) || amount <= 0) {
                return bot.sendMessage(chatId,
                    `❌ Invalid amount. Use: /setbudget <amount>\n\n` +
                    `Examples:\n` +
                    `• /setbudget 150\n` +
                    `• /setbudget 200\n` +
                    `• /setbudget 300`
                );
            }

            if (amount < 10) {
                return bot.sendMessage(chatId,
                    `⚠️ Budget seems too low (${formatCurrency(amount)}).\n\n` +
                    `Are you sure? Minimum recommended: £50/month`
                );
            }

            await api.updateBudget(chatId, amount);

            bot.sendMessage(chatId,
                `✅ Monthly budget updated to ${formatCurrency(amount)}\n\n` +
                `Use /budget to see your current status.`
            );
        } catch (error) {
            console.error('Error in /setbudget command:', error);
            bot.sendMessage(chatId, `❌ Error updating budget. Please try again.`);
        }
    });

    // Handle /setbudget without arguments
    bot.onText(/^\/setbudget$/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId,
            `💰 How to set your budget:\n\n` +
            `/setbudget <amount>\n\n` +
            `Examples:\n` +
            `• /setbudget 150 (for £150/month)\n` +
            `• /setbudget 200 (for £200/month)\n` +
            `• /setbudget 300 (for £300/month)`
        );
    });
};
