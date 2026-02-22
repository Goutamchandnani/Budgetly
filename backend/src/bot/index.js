const TelegramBot = require('node-telegram-bot-api');
const { handleMessage } = require('./commands');
const { transcribeVoice, downloadVoiceFile, cleanupVoiceFile } = require('./voiceHandler');
require('dotenv').config();

let bot = null;

if (process.env.TELEGRAM_BOT_TOKEN) {
    // Create bot instance
    // If production, we don't start polling here, we use webhook in server.js
    // If development, we use polling (handled in server.js or here)

    // Note: We create the bot without polling initially
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

    // Attach event handlers
    bot.on('message', (msg) => {
        handleMessage(bot, msg);
    });

    // Handle voice messages
    bot.on('voice', async (msg) => {
        const chatId = msg.chat.id;
        let filePath = null;

        try {
            // Send "processing" message
            await bot.sendMessage(chatId, '🎤 Processing voice message...');

            // Download voice file
            filePath = await downloadVoiceFile(bot, msg.voice.file_id);

            // Transcribe using Wit.ai
            const transcribedText = await transcribeVoice(filePath);

            // Send transcription confirmation
            await bot.sendMessage(chatId, `📝 Heard: "${transcribedText}"`);

            // Process as text command
            await handleMessage(bot, { ...msg, text: transcribedText });

        } catch (error) {
            console.error('❌ Voice processing error:', error.message);
            await bot.sendMessage(chatId,
                '❌ Sorry, I couldn\'t process your voice message. ' +
                'Please make sure WIT_AI_TOKEN is configured in .env file.'
            );
        } finally {
            // Clean up temp file
            if (filePath) {
                cleanupVoiceFile(filePath);
            }
        }
    });

    // Handle polling errors
    bot.on('polling_error', (error) => {
        console.error('❌ Telegram Polling Error:', error.code, error.message);
    });

    console.log('✅ Telegram Bot initialized with voice support');
} else {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN not found. Bot will not start.');
}

module.exports = bot;
