const crypto = require('crypto');

/**
 * Generate a secure random JWT secret
 * @returns {string} 64-character hexadecimal string
 */
function generateJWTSecret() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure random linking code for Telegram
 * @returns {string} 6-character alphanumeric code
 */
function generateLinkingCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 6;
    let code = '';
    // Use crypto.randomBytes for better randomness
    // We generate bytes and map them to our charset
    while (code.length < length) {
        const bytes = crypto.randomBytes(length * 2); // Generate extra bytes
        for (let i = 0; i < bytes.length && code.length < length; i++) {
            const byte = bytes[i];
            if (byte < 252) { // 36 * 7 = 252 (nearest multiple of 36 to 256 to avoid bias)
                code += chars[byte % 36];
            }
        }
    }
    return code;
}

/**
 * Validate environment variables
 * @throws {Error} if required variables are missing
 */
function validateEnvVariables() {
    const required = [
        'DATABASE_URL',
        'JWT_SECRET',
        'TELEGRAM_BOT_TOKEN'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file or Railway environment variables.'
        );
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET.length < 32) {
        console.warn(
            '⚠️  WARNING: JWT_SECRET is too short. Use at least 32 characters.\n' +
            'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }
}

module.exports = {
    generateJWTSecret,
    generateLinkingCode,
    validateEnvVariables
};
