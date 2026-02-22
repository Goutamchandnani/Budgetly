# Deployment Guide

Production deployment guide for the Budgetly Telegram Bot.

## Deployment Options

1. **VPS/Cloud Server** (Recommended)
2. **Heroku**
3. **Docker Container**
4. **Serverless** (AWS Lambda, Google Cloud Functions)

---

## Option 1: VPS/Cloud Server (Recommended)

### Prerequisites
- Ubuntu 20.04+ or similar Linux server
- Node.js 18+ installed
- PM2 for process management
- Domain name (optional)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2: Deploy Bot Code

```bash
# Create app directory
sudo mkdir -p /var/www/budgetly-bot
sudo chown $USER:$USER /var/www/budgetly-bot

# Clone or upload your code
cd /var/www/budgetly-bot
# Upload via git, scp, or ftp

# Install dependencies
npm ci --only=production
```

### Step 3: Configure Environment

```bash
# Create production .env file
nano .env
```

Add:
```env
TELEGRAM_BOT_TOKEN=your_production_bot_token
BACKEND_API_URL=https://api.budgetly.com/api
NODE_ENV=production
```

### Step 4: Start with PM2

```bash
# Start bot
pm2 start src/index.js --name budgetly-bot

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions shown

# Check status
pm2 status
pm2 logs budgetly-bot
```

### Step 5: Configure Firewall

```bash
# Allow SSH (if not already)
sudo ufw allow 22

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 6: Set Up Monitoring

```bash
# Install PM2 monitoring (optional)
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Useful PM2 Commands

```bash
pm2 status              # Check status
pm2 logs budgetly-bot   # View logs
pm2 restart budgetly-bot # Restart bot
pm2 stop budgetly-bot   # Stop bot
pm2 delete budgetly-bot # Remove from PM2
pm2 monit               # Monitor resources
```

---

## Option 2: Heroku Deployment

### Step 1: Prepare for Heroku

Create `Procfile`:
```
worker: node src/index.js
```

### Step 2: Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create budgetly-bot

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set BACKEND_API_URL=https://your-backend.com/api
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Scale worker
heroku ps:scale worker=1

# View logs
heroku logs --tail
```

### Step 3: Keep Dyno Awake

Heroku free dynos sleep after 30 minutes. Use a service like:
- UptimeRobot (ping your bot every 25 minutes)
- Or upgrade to paid dyno

---

## Option 3: Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Run as non-root user
USER node

# Start bot
CMD ["node", "src/index.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  bot:
    build: .
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - NODE_ENV=production
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Step 3: Deploy

```bash
# Build image
docker build -t budgetly-bot .

# Run container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Option 4: AWS Lambda (Serverless)

### Note
Telegram bots work best with long polling or webhooks. Lambda is better suited for webhook mode.

### Step 1: Switch to Webhook Mode

Modify `src/index.js`:

```javascript
// Instead of polling
const bot = new TelegramBot(token, { polling: true });

// Use webhook
const bot = new TelegramBot(token);
bot.setWebHook(`${process.env.WEBHOOK_URL}/bot${token}`);

// Handle webhook
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  await bot.processUpdate(body);
  return { statusCode: 200, body: 'OK' };
};
```

### Step 2: Deploy to Lambda

Use Serverless Framework or AWS SAM for deployment.

---

## Environment Variables

### Production Environment Variables

```env
# Required
TELEGRAM_BOT_TOKEN=your_production_token
BACKEND_API_URL=https://api.budgetly.com/api
NODE_ENV=production

# Optional
LOG_LEVEL=info
MAX_RETRIES=3
TIMEOUT_MS=10000
```

### Security Best Practices

1. **Never commit .env to Git**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use different tokens for dev/prod**
   - Development: `budgetly_dev_bot`
   - Production: `budgetly_bot`

3. **Rotate tokens periodically**
   - Use BotFather `/token` command
   - Update environment variables
   - Restart bot

4. **Restrict API access**
   - Use HTTPS for backend API
   - Implement rate limiting
   - Validate all inputs

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs budgetly-bot --lines 100

# Error logs only
pm2 logs budgetly-bot --err

# JSON logs
pm2 logs budgetly-bot --json
```

### Custom Logging

Add to `src/index.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### External Monitoring Services

Consider using:
- **Sentry** - Error tracking
- **LogDNA** - Log management
- **Datadog** - Full monitoring
- **UptimeRobot** - Uptime monitoring

---

## Backup & Recovery

### Database Backups

Ensure backend has regular backups:
```bash
# Example MongoDB backup
mongodump --uri="mongodb://..." --out=/backups/$(date +%Y%m%d)
```

### Bot Configuration Backup

```bash
# Backup .env and configs
tar -czf bot-config-backup.tar.gz .env package.json src/
```

### Disaster Recovery Plan

1. Keep bot token secure and backed up
2. Document all environment variables
3. Have deployment scripts ready
4. Test recovery process regularly

---

## Scaling

### Vertical Scaling

Increase server resources:
- More CPU for faster processing
- More RAM for handling more users
- Better network for faster responses

### Horizontal Scaling

For very high traffic:
- Use webhook mode instead of polling
- Deploy multiple instances behind load balancer
- Use Redis for shared state

---

## Health Checks

### Create Health Check Endpoint

Add to `src/index.js`:

```javascript
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(process.env.PORT || 3001);
```

### Monitor Health

```bash
# Check health
curl http://localhost:3001/health

# Set up monitoring
# Use UptimeRobot, Pingdom, or similar
```

---

## SSL/TLS Configuration

If using webhooks, you need HTTPS:

### Using Let's Encrypt

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d bot.budgetly.com

# Certificate will be at:
# /etc/letsencrypt/live/bot.budgetly.com/fullchain.pem
# /etc/letsencrypt/live/bot.budgetly.com/privkey.pem
```

---

## Updating the Bot

### Zero-Downtime Updates

```bash
# Pull latest code
cd /var/www/budgetly-bot
git pull

# Install dependencies
npm ci --only=production

# Reload with PM2 (zero downtime)
pm2 reload budgetly-bot

# Or restart
pm2 restart budgetly-bot
```

### Rollback

```bash
# If update fails, rollback
git reset --hard HEAD~1
npm ci --only=production
pm2 restart budgetly-bot
```

---

## Performance Optimization

### 1. Enable Caching

Cache frequently accessed data:
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// Cache budget status
const cachedBudget = cache.get(`budget_${chatId}`);
if (cachedBudget) return cachedBudget;
```

### 2. Connection Pooling

For database connections:
```javascript
// Use connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2
});
```

### 3. Rate Limiting

Prevent abuse:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30 // 30 requests per minute
});
```

---

## Troubleshooting Production Issues

### Bot Not Responding

```bash
# Check if bot is running
pm2 status

# Check logs
pm2 logs budgetly-bot --lines 50

# Check backend API
curl https://api.budgetly.com/health

# Restart bot
pm2 restart budgetly-bot
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart if needed
pm2 restart budgetly-bot

# Check for memory leaks
node --inspect src/index.js
```

### Slow Responses

```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.budgetly.com/api/telegram/budget/123

# Check network latency
ping api.budgetly.com

# Optimize database queries
# Add indexes, use caching
```

---

## Security Checklist

- [ ] Bot token is secret and not in Git
- [ ] Using HTTPS for backend API
- [ ] Environment variables are secure
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] Error messages don't leak sensitive data
- [ ] Logs don't contain sensitive data
- [ ] Server firewall is configured
- [ ] Regular security updates applied
- [ ] Backups are encrypted

---

## Deployment Checklist

Before going live:

- [ ] Bot tested thoroughly (see TESTING.md)
- [ ] Production bot created in BotFather
- [ ] Production environment variables set
- [ ] Backend API is deployed and accessible
- [ ] Database is set up and backed up
- [ ] Monitoring is configured
- [ ] Logging is working
- [ ] Health checks are set up
- [ ] SSL/TLS configured (if using webhooks)
- [ ] Documentation is complete
- [ ] Team knows how to access logs
- [ ] Rollback plan is ready
- [ ] Support contact is available

---

## Post-Deployment

### Monitor First 24 Hours

- Check logs frequently
- Monitor error rates
- Watch response times
- Verify user reports
- Be ready to rollback

### Gradual Rollout

Consider:
1. Deploy to staging first
2. Test with small group of users
3. Monitor for issues
4. Gradually increase user base
5. Full rollout after confidence

---

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Check error logs
- Monitor uptime

**Weekly:**
- Review performance metrics
- Check disk space
- Update dependencies (if needed)

**Monthly:**
- Security updates
- Backup verification
- Performance optimization
- User feedback review

---

## Contact

For deployment issues:
- Check logs first
- Review this guide
- Contact DevOps team
- Escalate if critical

---

## Additional Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Docker Documentation](https://docs.docker.com/)
