const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
require('dotenv').config();

// Import utils
const HealthCheck = require('./utils/healthCheck');
const { validateEnvVariables } = require('./utils/secrets');
const bot = require('./bot');

// Validate environment
try {
    validateEnvVariables();
} catch (error) {
    console.error('❌ Environment Validation Error:', error.message);
    process.exit(1);
}

const app = express();

// =========================================
// Middleware
// =========================================

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
app.disable('x-powered-by');

// CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// =========================================
// Database Connection
// =========================================
mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// =========================================
// Routes
// =========================================

// Health Check
app.get('/api/health', async (req, res) => {
    const status = await HealthCheck.getFullHealthStatus(bot);
    const code = status.status === 'healthy' ? 200 : 503;
    res.status(code).json(status);
});

// Telegram Webhook
if (process.env.NODE_ENV === 'production' && bot) {
    app.post('/api/telegram/webhook', (req, res) => {
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/telegram', require('./routes/telegram'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// =========================================
// Server Startup
// =========================================
const PORT = process.env.PORT || 3000;

// Connect to DB then start server
// Connect to DB then start server
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

            // Initialize Bot
            if (process.env.NODE_ENV !== 'production' && bot) {
                console.log('🤖 Starting Telegram Bot in polling mode...');
                bot.startPolling().catch(err => {
                    console.error('❌ Bot Polling Error:', err.message);
                });
            }
        });
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    // Close server & exit process
    // server.close(() => process.exit(1));
});

module.exports = app;
