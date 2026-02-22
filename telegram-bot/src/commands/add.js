const api = require('../utils/api');
const { formatCurrency, getBudgetEmoji } = require('../utils/formatters');

/**
 * /add command - Add expense (MOST IMPORTANT COMMAND)
 * @param {TelegramBot} bot - Bot instance
 */
module.exports = (bot) => {
    bot.onText(/\/add (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const input = match[1]; // Everything after /add

        try {
            // Check if user is linked
            const isLinked = await api.checkLinked(chatId);
            if (!isLinked) {
                return bot.sendMessage(chatId,
                    `⚠️ Please link your account first using /start`
                );
            }

            // Parse input: "15.50 lunch at cafe"
            const parts = input.split(' ');
            const amount = parseFloat(parts[0].replace('£', ''));
            const description = parts.slice(1).join(' ');

            // Validate amount
            if (isNaN(amount) || amount <= 0) {
                return bot.sendMessage(chatId,
                    `❌ Invalid amount. Use: /add <amount> <description>\n\n` +
                    `Examples:\n` +
                    `• /add 15.50 lunch\n` +
                    `• /add 3.99 coffee\n` +
                    `• /add 45 groceries`
                );
            }

            // Validate description
            if (!description || description.trim().length === 0) {
                return bot.sendMessage(chatId,
                    `❌ Please add a description.\n\n` +
                    `Example: /add 15.50 lunch at cafe`
                );
            }

            if (description.length > 200) {
                return bot.sendMessage(chatId,
                    `❌ Description too long (max 200 characters).`
                );
            }

            // Send to backend
            const result = await api.addExpense(chatId, {
                amount,
                description: description.trim(),
                date: new Date()
            });

            // Format response
            const remaining = result.remaining || (result.budget - result.spent);
            const emoji = getBudgetEmoji(remaining, result.budget);

            bot.sendMessage(chatId,
                `✅ Added ${formatCurrency(amount)} for "${description}"\n\n` +
                `📊 Monthly total: ${formatCurrency(result.spent)}\n` +
                `💰 Remaining: ${formatCurrency(remaining)}\n` +
                `${emoji}`
            );

        } catch (error) {
            console.error('Error in /add command:', error);
            bot.sendMessage(chatId,
                `❌ Failed to add expense. Please try again.\n\n` +
                `Make sure you're using the format:\n` +
                `/add <amount> <description>`
            );
        }
    });

    // Handle /add without arguments
    bot.onText(/^\/add$/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId,
            `📝 How to add an expense:\n\n` +
            `/add <amount> <description>\n\n` +
            `Examples:\n` +
            `• /add 15.50 lunch at cafe\n` +
            `• /add 3.99 coffee\n` +
            `• /add 45 groceries from Tesco\n` +
            `• /add 12 movie ticket`
        );
    });
};
