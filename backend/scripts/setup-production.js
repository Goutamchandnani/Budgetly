#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * Generates secure secrets and validates configuration
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Budgetly Production Environment Setup\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('✅ Generated JWT_SECRET:');
console.log(`   ${jwtSecret}\n`);

// Generate example linking code
const linkingCode = Array.from({ length: 6 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
).join('');
console.log('📝 Example Telegram linking code format:');
console.log(`   ${linkingCode}\n`);

// Create production .env template
const envTemplate = `# Budgetly Production Environment Variables
# Generated on ${new Date().toISOString()}

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=production

# ============================================
# DATABASE (MongoDB Atlas)
# ============================================
# Get this from MongoDB Atlas:
# 1. Go to Database → Connect → Connect your application
# 2. Copy connection string
# 3. Replace <password> with your database user password
# 4. Add database name: budgettracker
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/budgettracker?retryWrites=true&w=majority

# ============================================
# AUTHENTICATION
# ============================================
# Use the generated secret below (already filled in)
JWT_SECRET=${jwtSecret}

# ============================================
# FRONTEND URL (for CORS)
# ============================================
# Update with your actual Vercel URL
FRONTEND_URL=https://budgetly.vercel.app

# ============================================
# TELEGRAM BOT
# ============================================
# Get this from @BotFather on Telegram:
# 1. Send /newbot to @BotFather
# 2. Follow the prompts
# 3. Copy the bot token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# ============================================
# RAILWAY (Auto-set by Railway)
# ============================================
# This is automatically set by Railway, no need to configure
# RAILWAY_PUBLIC_DOMAIN=your-app.up.railway.app

# ============================================
# OPTIONAL: ERROR TRACKING
# ============================================
# Uncomment if using Sentry for error tracking
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
`;

// Save to file
const envPath = path.join(__dirname, '..', '.env.production');
fs.writeFileSync(envPath, envTemplate);

console.log('📄 Created .env.production template\n');

// Create Railway environment variables script
const railwayVars = `# Copy these to Railway Dashboard → Variables

PORT=3000
NODE_ENV=production
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/budgettracker?retryWrites=true&w=majority
JWT_SECRET=${jwtSecret}
FRONTEND_URL=https://budgetly.vercel.app
TELEGRAM_BOT_TOKEN=your-bot-token-here
`;

const railwayPath = path.join(__dirname, '..', 'railway-env.txt');
fs.writeFileSync(railwayPath, railwayVars);

console.log('📋 Next Steps:\n');
console.log('1. Create MongoDB Atlas account and cluster');
console.log('   → https://mongodb.com/cloud/atlas\n');

console.log('2. Create Telegram bot with @BotFather');
console.log('   → Open Telegram, search for @BotFather');
console.log('   → Send /newbot and follow prompts\n');

console.log('3. Configure Railway environment variables');
console.log('   → Copy from: railway-env.txt');
console.log('   → Paste in Railway Dashboard → Variables\n');

console.log('4. Update the following in railway-env.txt:');
console.log('   ✏️  DATABASE_URL (from MongoDB Atlas)');
console.log('   ✏️  TELEGRAM_BOT_TOKEN (from BotFather)');
console.log('   ✏️  FRONTEND_URL (your Vercel URL)\n');

console.log('5. Deploy to Railway');
console.log('   → Push to GitHub');
console.log('   → Railway auto-deploys\n');

console.log('📚 For detailed instructions, see DEPLOYMENT.md\n');

console.log('⚠️  IMPORTANT: Never commit .env.production or railway-env.txt to Git!\n');

// Create .gitignore entry reminder
console.log('✅ Make sure these are in .gitignore:');
console.log('   - .env');
console.log('   - .env.production');
console.log('   - railway-env.txt\n');

console.log('🎉 Setup complete! Follow the next steps above.\n');
