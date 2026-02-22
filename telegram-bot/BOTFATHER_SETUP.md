# BotFather Setup Guide

Complete step-by-step guide to create and configure your Budgetly Telegram bot.

## Step 1: Create the Bot

1. Open Telegram app
2. Search for `@BotFather` (official Telegram bot)
3. Start a conversation and send: `/newbot`

4. BotFather will ask for a **name** for your bot:
   ```
   Example: Budgetly Tracker
   ```

5. Then it will ask for a **username** (must end with 'bot'):
   ```
   Example: budgetly_tracker_bot
   ```

6. **Save the token!** You'll receive something like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
   
   ⚠️ **IMPORTANT**: Keep this token secret! It's like a password.

## Step 2: Configure Bot Commands

1. Send `/setcommands` to BotFather
2. Select your bot from the list
3. Copy and paste this exact text:

```
add - Add a new expense
budget - View current budget status
total - See total expenses this month
remaining - Check remaining budget
list - List recent expenses
setbudget - Update monthly budget
help - Show all commands
start - Link your account
```

4. BotFather will confirm: "Success! Command list updated."

## Step 3: Set Bot Description (Optional but Recommended)

### About Text
Send `/setabouttext` to BotFather, select your bot, then paste:

```
Budgetly helps students track expenses and manage budgets effortlessly. Add expenses via Telegram and view your budget status instantly!
```

### Description
Send `/setdescription` to BotFather, select your bot, then paste:

```
🎓 Student Budget Tracker

Track expenses instantly via Telegram!
• Add expenses in seconds
• Check budget status
• Get spending insights
• Sync with web app

Start with /start to link your account.
```

## Step 4: Set Bot Profile Picture (Optional)

1. Send `/setuserpic` to BotFather
2. Select your bot
3. Upload a square image (recommended: 512x512px)
   - Suggestion: Use a budget/money-related icon or the Budgetly logo

## Step 5: Configure Privacy Settings

### Allow Groups (Optional)
If you want users to add the bot to groups:
```
/setjoingroups - Enable
```

For personal use only:
```
/setjoingroups - Disable
```

### Privacy Mode
Send `/setprivacy` to BotFather:
- **Disable** - Bot can see all messages (needed for natural language parsing)
- **Enable** - Bot only sees commands (recommended for privacy)

**Recommendation**: Enable privacy mode since we only use commands.

## Step 6: Add Bot Token to Environment

1. Copy your bot token from Step 1
2. Open `telegram-bot/.env` file
3. Add the token:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

## Step 7: Test Your Bot

1. Start the bot application:
   ```bash
   cd telegram-bot
   npm install
   npm start
   ```

2. Open Telegram and search for your bot username
3. Send `/start`
4. You should receive a welcome message!

## Useful BotFather Commands

| Command | Purpose |
|---------|---------|
| `/mybots` | List all your bots |
| `/setname` | Change bot name |
| `/setdescription` | Change bot description |
| `/setabouttext` | Change about text |
| `/setuserpic` | Change profile picture |
| `/setcommands` | Set command list |
| `/deletebot` | Delete a bot |
| `/token` | Regenerate bot token |
| `/setprivacy` | Configure privacy mode |
| `/setjoingroups` | Allow/disallow groups |

## Security Best Practices

1. ✅ **Never share your bot token**
2. ✅ Store token in `.env` file (not in code)
3. ✅ Add `.env` to `.gitignore`
4. ✅ Use different tokens for development and production
5. ✅ If token is leaked, use `/token` to regenerate

## Regenerating Token (If Compromised)

1. Send `/token` to BotFather
2. Select your bot
3. Confirm regeneration
4. Update `.env` with new token
5. Restart bot application

## Troubleshooting

### "Bot not found"
- Check username is correct
- Ensure username ends with 'bot'
- Try searching with @ prefix: `@your_bot_username`

### "Unauthorized" error
- Verify token in `.env` is correct
- Check for extra spaces in token
- Ensure token hasn't been regenerated

### Commands not showing
- Send `/setcommands` again
- Restart Telegram app
- Check BotFather confirmed command update

## Next Steps

After setup:
1. ✅ Bot is created and configured
2. ✅ Token is saved in `.env`
3. ✅ Commands are set
4. → Run `npm install` in telegram-bot directory
5. → Start bot with `npm start`
6. → Test with `/start` command
7. → Coordinate with backend team for API integration

## Production Deployment

For production:
1. Create a separate production bot (recommended)
2. Use a different username (e.g., `budgetly_bot` instead of `budgetly_test_bot`)
3. Store production token securely (use environment variables in hosting platform)
4. Never commit production tokens to Git

## Support

If you encounter issues:
- Check [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- Review BotFather messages carefully
- Ensure you're messaging the official @BotFather (verified account)
