const mongoose = require('mongoose');

/**
 * Health check utility for monitoring system status
 */
class HealthCheck {
    /**
     * Check database connection status
     * @returns {Object} Database health status
     */
    static async checkDatabase() {
        try {
            const state = mongoose.connection.readyState;
            const states = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };

            return {
                status: state === 1 ? 'healthy' : 'unhealthy',
                state: states[state],
                connected: state === 1
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                state: 'error',
                connected: false,
                error: error.message
            };
        }
    }

    /**
     * Check Telegram bot status
     * @param {Object} bot - Telegram bot instance
     * @returns {Object} Bot health status
     */
    static async checkTelegramBot(bot) {
        try {
            if (!bot) {
                return {
                    status: 'unhealthy',
                    configured: false,
                    error: 'Bot not initialized'
                };
            }

            // Try to get bot info
            const botInfo = await bot.getMe();

            return {
                status: 'healthy',
                configured: true,
                username: botInfo.username,
                id: botInfo.id
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                configured: false,
                error: error.message
            };
        }
    }

    /**
     * Get system memory usage
     * @returns {Object} Memory usage statistics
     */
    static getMemoryUsage() {
        const usage = process.memoryUsage();
        return {
            rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(usage.external / 1024 / 1024)}MB`
        };
    }

    /**
     * Get system uptime
     * @returns {Object} Uptime information
     */
    static getUptime() {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        return {
            seconds: uptime,
            formatted: `${hours}h ${minutes}m ${seconds}s`
        };
    }

    /**
     * Comprehensive health check
     * @param {Object} bot - Telegram bot instance
     * @returns {Object} Complete health status
     */
    static async getFullHealthStatus(bot) {
        const [database, telegramBot] = await Promise.all([
            this.checkDatabase(),
            this.checkTelegramBot(bot)
        ]);

        const isHealthy = database.connected && telegramBot.configured;

        return {
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: this.getUptime(),
            memory: this.getMemoryUsage(),
            services: {
                database,
                telegramBot
            },
            environment: process.env.NODE_ENV || 'development'
        };
    }
}

module.exports = HealthCheck;
