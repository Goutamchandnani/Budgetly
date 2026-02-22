const User = require('../models/User');
const Expense = require('../models/Expense');

// Helper to convert number words to digits
const wordToNumber = (text) => {
    const small = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
        'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
        'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40,
        'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80,
        'ninety': 90
    };

    const magnitude = {
        'hundred': 100,
        'thousand': 1000,
        'million': 1000000
    };

    let words = text.toLowerCase().split(' ');
    let result = text;

    // Simple replacement for standalone small numbers
    // "add five pounds" -> "add 5 pounds"
    Object.keys(small).forEach(word => {
        // Replace whole word only
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        result = result.replace(regex, small[word]);
    });

    return result;
};

/**
 * Handle incoming Telegram messages
 * @param {Object} bot - Bot instance
 * @param {Object} msg - Message object
 */
const handleMessage = async (bot, msg) => {
    const chatId = msg.chat.id.toString();
    console.log(`📩 Message from ${chatId}: "${msg.text}"`);
    let text = msg.text;

    if (!text) return;

    // Pre-process voice text/natural language
    // "Add 10 pounds for coffee" -> "10 coffee"
    // "What is my budget" -> "/budget"
    let lowerText = text.toLowerCase();

    // 1. Convert words to numbers ("five" -> "5")
    lowerText = wordToNumber(lowerText);
    text = wordToNumber(text); // Update original text too for fallback regex

    // Command Mappings
    if (!text.startsWith('/')) {
        if (lowerText.includes('budget') || lowerText.includes('how much left')) {
            text = '/budget';
        } else if (lowerText.includes('today') || lowerText.includes('spent today')) {
            text = '/today';
        } else if (lowerText.startsWith('add ')) {
            // Remove "Add", "pounds", "lb", "for"
            // "Add 10 lb for coffee" -> "10 coffee"
            let cleaned = lowerText.substring(4); // Remove "add "

            // Remove common currency words/symbols
            cleaned = cleaned.replace(/\b(pounds?|gbp|dollars?|euros?|lb|lbs)\b/gi, '');
            // Remove filler "for"
            cleaned = cleaned.replace(/\bfor\b/gi, '');
            // Clean up extra spaces
            cleaned = cleaned.replace(/\s+/g, ' ').trim();

            text = cleaned;
        }
    }

    try {
        // 1. /start
        if (text.startsWith('/start')) {
            await handleStart(bot, chatId);
        }
        // ... rest of the code ...
        // 2. /link <code>
        else if (text.startsWith('/link')) {
            const code = text.split(' ')[1];
            await handleLink(bot, chatId, code);
        }
        // 3. /add <amount> <description>
        else if (text.startsWith('/add')) {
            await handleAddExpense(bot, chatId, text);
        }
        // 4. /budget
        else if (text.startsWith('/budget')) {
            await handleBudget(bot, chatId);
        }
        // 5. /today
        else if (text.startsWith('/today')) {
            await handleToday(bot, chatId);
        }
        // 6. /help
        else if (text.startsWith('/help')) {
            await handleHelp(bot, chatId);
        }
        // Default: Check if it looks like an expense "50 Coffee"
        else if (/^\d+(\.\d+)?\s+.+/.test(text)) {
            // Treat as /add
            await handleAddExpense(bot, chatId, `/add ${text}`);
        } else {
            await bot.sendMessage(chatId, 'Type /help for available commands.');
        }
    } catch (error) {
        console.error('Bot Error:', error);
        await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
    }
};

// Command Handlers

const handleStart = async (bot, chatId) => {
    const user = await User.findOne({ telegramChatId: chatId });

    if (user) {
        await bot.sendMessage(chatId, `Welcome back, ${user.name}! 🚀\n\nType /add <amount> <desc> to track an expense.\nType /budget to see your status.`);
    } else {
        await bot.sendMessage(chatId,
            'Welcome to Budgetly! 👋\n\n' +
            'To start tracking expenses, please link your account:\n' +
            '1. Log in to the Web App\n' +
            '2. Go to Profile -> Link Telegram\n' +
            '3. Get your 6-digit code\n' +
            '4. Type here: /link <your-code>'
        );
    }
};

const handleLink = async (bot, chatId, code) => {
    if (!code) {
        return bot.sendMessage(chatId, 'Please provide the code. Example: /link ABC123');
    }

    // Find user with this code
    const user = await User.findOne({
        linkingCode: code.toUpperCase(),
        linkingCodeExpiry: { $gt: new Date() }
    });

    if (!user) {
        return bot.sendMessage(chatId, '❌ Invalid or expired code. Please generate a new one on the web app.');
    }

    // Check if this Telegram account is already linked to another user
    const existingLink = await User.findOne({ telegramChatId: chatId });
    if (existingLink) {
        return bot.sendMessage(chatId, '⚠️ This Telegram account is already linked to a user.');
    }

    // Link account
    user.telegramChatId = chatId;
    user.telegramUsername = 'User'; // We could fetch actual username if needed
    user.linkingCode = null;
    user.linkingCodeExpiry = null;
    await user.save();

    await bot.sendMessage(chatId, `✅ Successfully linked to ${user.name}! You can now start tracking expenses.`);
};

// Helper to detect category from description
const detectCategory = (description) => {
    const lowerDesc = description.toLowerCase();

    const mappings = {
        'Food': ['coffee', 'tea', 'latte', 'cappuccino', 'espresso', 'lunch', 'dinner', 'breakfast', 'snack', 'drink', 'food', 'meal', 'burger', 'pizza', 'sandwich', 'restaurant', 'groceries', 'market', 'sushi', 'chicken', 'salad'],
        'Transport': ['bus', 'train', 'taxi', 'uber', 'cab', 'bolt', 'flight', 'ticket', 'fuel', 'petrol', 'gas', 'transport', 'subway', 'metro', 'parking'],
        'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'party', 'event', 'fun', 'subscription', 'club', 'bowling'],
        'Shopping': ['clothes', 'shoes', 'shirt', 'pants', 'dress', 'bag', 'amazon', 'gift', 'shopping', 'buy', 'electronics'],
        'Bills': ['rent', 'bill', 'electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'mobile', 'tax', 'insurance', 'utility']
    };

    for (const [category, keywords] of Object.entries(mappings)) {
        if (keywords.some(keyword => lowerDesc.includes(keyword))) {
            return category;
        }
    }

    return 'Other';
};

const handleAddExpense = async (bot, chatId, text) => {
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) {
        return bot.sendMessage(chatId, '⚠️ account not linked. Please use /link first.');
    }

    // Parse: /add 50 Coffee
    // Remove /add
    const args = text.replace('/add', '').trim().split(/\s+(.*)/s); // Split by first whitespace

    if (args.length < 2) {
        return bot.sendMessage(chatId, '⚠️ Format: /add <amount> <description>\nExample: /add 5 coffee');
    }

    const amount = parseFloat(args[0]);
    const description = args[1];

    if (isNaN(amount) || amount <= 0) {
        return bot.sendMessage(chatId, '⚠️ Invalid amount. Must be greater than 0.');
    }

    if (!description || description.trim().length === 0) {
        return bot.sendMessage(chatId, '⚠️ Description cannot be empty.');
    }

    if (description.length > 200) {
        return bot.sendMessage(chatId, '⚠️ Description too long (max 200 characters).');
    }

    // Auto-detect category
    const category = detectCategory(description);

    await Expense.create({
        userId: user._id,
        amount,
        description,
        category,
        addedVia: 'telegram'
    });

    await bot.sendMessage(chatId, `✅ Added: ${amount} ${user.currency || 'GBP'} for "${description}"\n📂 Category: ${category}`);
};

const handleBudget = async (bot, chatId) => {
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) return bot.sendMessage(chatId, '⚠️ Not linked.');

    // Calculate generic budget stats (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
        userId: user._id,
        date: { $gte: startOfMonth }
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = (user.monthlyBudget || 0) - totalSpent;
    const currency = user.currency || 'GBP';

    await bot.sendMessage(chatId,
        `📊 <b>Monthly Budget</b>\n\n` +
        `Limit: ${currency} ${user.monthlyBudget}\n` +
        `Spent: ${currency} ${totalSpent.toFixed(2)}\n` +
        `Remaining: ${currency} ${remaining.toFixed(2)}`,
        { parse_mode: 'HTML' }
    );
};

const handleToday = async (bot, chatId) => {
    const user = await User.findOne({ telegramChatId: chatId });
    if (!user) return bot.sendMessage(chatId, '⚠️ Not linked.');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
        userId: user._id,
        date: { $gte: startOfDay }
    });

    if (expenses.length === 0) {
        return bot.sendMessage(chatId, 'No expenses tracked today.');
    }

    let msg = '📅 <b>Today\'s Expenses</b>\n\n';
    let total = 0;
    expenses.forEach(e => {
        msg += `• ${e.amount} - ${e.description}\n`;
        total += e.amount;
    });
    msg += `\nTotal: ${user.currency || 'GBP'} ${total.toFixed(2)}`;

    await bot.sendMessage(chatId, msg, { parse_mode: 'HTML' });
};

const handleHelp = async (bot, chatId) => {
    await bot.sendMessage(chatId,
        '🤖 <b>Budgetly Bot Commands</b>\n\n' +
        '/add &lt;amount&gt; &lt;desc&gt; - Add expense\n' +
        '/budget - Check status\n' +
        '/today - View today\n' +
        '/link &lt;code&gt; - Link account\n',
        { parse_mode: 'HTML' }
    );
};

module.exports = { handleMessage };
