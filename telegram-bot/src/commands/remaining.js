const api = require('../utils/api');
const { formatCurrency, getDaysLeftInMonth } = require('../utils/formatters');

/**
 * /remaining command - Remaining budget
 * @param {TelegramBot} bot - Bot instance
 */
module.exports = (bot) => {
    bot.onText(/\/remaining/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const isLinked = await api.checkLinked(chatId);
            if (!isLinked) {
                return bot.sendMessage(chatId, `⚠️ Please link your account first using /start`);
            }

            const data = await api.getBudgetStatus(chatId);

            const remaining = data.budget - data.spent;
            const daysLeft = getDaysLeftInMonth();
            const dailyBudget = remaining / daysLeft;

            let message = `💰 Budget Remaining\n\n` +
                `${formatCurrency(remaining)} left for this month\n\n` +
                `📅 ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining\n`;

            if (remaining > 0) {
                message += `📊 Daily budget: ${formatCurrency(dailyBudget)}/day\n\n`;

                if (dailyBudget < 5) {
                    message += `⚠️ That's quite tight! Be careful with spending.`;
                } else if (dailyBudget < 10) {
                    message += `💡 You have ${formatCurrency(dailyBudget)} per day - plan wisely!`;
                } else {
                    message += `✨ You're doing great! ${formatCurrency(dailyBudget)} per day.`;
                }
            } else {
                message += `\n🚨 You've exceeded your budget by ${formatCurrency(Math.abs(remaining))}!\n`;
                message += `Consider reviewing your expenses or adjusting your budget.`;
            }

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('Error in /remaining command:', error);
            bot.sendMessage(chatId, `❌ Error fetching remaining budget. Please try again.`);
        }
    });
};
