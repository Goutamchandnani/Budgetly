const api = require('../utils/api');
const { formatCurrency, getCurrentMonth } = require('../utils/formatters');

/**
 * /total command - Monthly total expenses
 * @param {TelegramBot} bot - Bot instance
 */
module.exports = (bot) => {
    bot.onText(/\/total/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const isLinked = await api.checkLinked(chatId);
            if (!isLinked) {
                return bot.sendMessage(chatId, `⚠️ Please link your account first using /start`);
            }

            const data = await api.getBudgetStatus(chatId);

            const average = data.count > 0 ? data.spent / data.count : 0;

            bot.sendMessage(chatId,
                `📊 ${getCurrentMonth()} Expenses\n\n` +
                `Total spent: ${formatCurrency(data.spent)}\n` +
                `Number of expenses: ${data.count || 0}\n` +
                `Average expense: ${formatCurrency(average)}\n\n` +
                `${data.count === 0 ? '💡 No expenses yet this month!' : '✅ Keep tracking!'}`
            );
        } catch (error) {
            console.error('Error in /total command:', error);
            bot.sendMessage(chatId, `❌ Error fetching total. Please try again.`);
        }
    });
};
