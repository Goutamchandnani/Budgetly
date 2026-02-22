require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Validate environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set in .env file');
    process.exit(1);
}

// Create bot instance
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Budgetly Telegram Bot starting...');

// Import and register all commands
try {
    require('./commands/start')(bot);
    require('./commands/add')(bot);
    require('./commands/budget')(bot);
    require('./commands/total')(bot);
    require('./commands/remaining')(bot);
    require('./commands/list')(bot);
    require('./commands/setbudget')(bot);
    require('./commands/help')(bot);

    console.log('✅ All commands registered successfully');
} catch (error) {
    console.error('❌ Error registering commands:', error);
    process.exit(1);
}

// Log when bot is ready
bot.getMe().then((botInfo) => {
    console.log(`✨ Bot is running as @${botInfo.username}`);
    console.log(`📱 Ready to receive messages!`);
    console.log(`🔗 Backend API: ${process.env.BACKEND_API_URL || 'http://localhost:3000/api'}`);
}).catch((error) => {
    console.error('❌ Error getting bot info:', error.message);
    console.error('Please check your TELEGRAM_BOT_TOKEN');
    process.exit(1);
});

// Error handling
bot.on('polling_error', (error) => {
    console.error('⚠️ Polling error:', error.message);
    // Don't exit on polling errors, just log them
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
});
