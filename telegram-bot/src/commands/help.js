/**
 * /help command - Show all available commands
 * @param {TelegramBot} bot - Bot instance
 */
module.exports = (bot) => {
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;

        bot.sendMessage(chatId,
            `🎓 *Budgetly Help*\n\n` +
            `📝 *Commands:*\n\n` +
            `*Expense Tracking:*\n` +
            `/add <amount> <description> - Add expense\n` +
            `  _Example: /add 15.50 lunch_\n\n` +
            `*Budget Info:*\n` +
            `/budget - View budget overview\n` +
            `/total - See monthly total\n` +
            `/remaining - Check remaining budget\n` +
            `/list - List recent expenses\n\n` +
            `*Settings:*\n` +
            `/setbudget <amount> - Update budget\n` +
            `  _Example: /setbudget 200_\n\n` +
            `*Account:*\n` +
            `/start - Link your account\n` +
            `/help - Show this message\n\n` +
            `💡 *Quick Tips:*\n` +
            `• Add expenses as soon as you spend\n` +
            `• Check /remaining daily to stay on track\n` +
            `• Use the web app for detailed analytics\n\n` +
            `Need help? Contact support or check the web app!`,
            { parse_mode: 'Markdown' }
        );
    });
};
