const api = require('../utils/api');
const { formatCurrency, getCurrentMonth, createProgressBar } = require('../utils/formatters');

/**
 * /budget command - View budget status
 * @param {TelegramBot} bot - Bot instance
 */
module.exports = (bot) => {
    bot.onText(/\/budget/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const isLinked = await api.checkLinked(chatId);
            if (!isLinked) {
                return bot.sendMessage(chatId, `⚠️ Please link your account first using /start`);
            }

            const data = await api.getBudgetStatus(chatId);

            const percentage = (data.spent / data.budget) * 100;
            const progressBar = createProgressBar(percentage);
            const remaining = data.budget - data.spent;

            let statusEmoji;
            if (percentage > 90) {
                statusEmoji = '🚨 Over 90% used!';
            } else if (percentage > 70) {
                statusEmoji = '⚠️ Getting close!';
            } else if (percentage > 50) {
                statusEmoji = '📊 Halfway there';
            } else {
                statusEmoji = '✨ On track!';
            }

            bot.sendMessage(chatId,
                `💰 Budget Overview (${getCurrentMonth()})\n\n` +
                `Budget: ${formatCurrency(data.budget)}\n` +
                `Spent: ${formatCurrency(data.spent)}\n` +
                `Remaining: ${formatCurrency(remaining)}\n\n` +
                `${progressBar} ${percentage.toFixed(0)}%\n\n` +
                `${statusEmoji}`
            );
        } catch (error) {
            console.error('Error in /budget command:', error);
            bot.sendMessage(chatId, `❌ Error fetching budget status. Please try again.`);
        }
    });
};
