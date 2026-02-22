const api = require('../utils/api');
const { formatCurrency, formatDate } = require('../utils/formatters');

/**
 * /list command - Recent expenses
 * @param {TelegramBot} bot - Bot instance
 */
module.exports = (bot) => {
    bot.onText(/\/list/, async (msg) => {
        const chatId = msg.chat.id;

        try {
            const isLinked = await api.checkLinked(chatId);
            if (!isLinked) {
                return bot.sendMessage(chatId, `⚠️ Please link your account first using /start`);
            }

            const expenses = await api.getRecentExpenses(chatId, 10);

            if (!expenses || expenses.length === 0) {
                return bot.sendMessage(chatId,
                    `📝 No expenses yet this month.\n\n` +
                    `Add your first expense with:\n` +
                    `/add <amount> <description>`
                );
            }

            let message = `📝 Recent Expenses (Last ${expenses.length})\n\n`;

            let total = 0;
            expenses.forEach((exp, index) => {
                const date = formatDate(exp.date);
                message += `${index + 1}. ${formatCurrency(exp.amount)} - ${exp.description}\n`;
                message += `   📅 ${date}\n\n`;
                total += exp.amount;
            });

            message += `━━━━━━━━━━━━━━━━\n`;
            message += `Total: ${formatCurrency(total)}`;

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('Error in /list command:', error);
            bot.sendMessage(chatId, `❌ Error fetching expenses. Please try again.`);
        }
    });
};
