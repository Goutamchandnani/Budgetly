/**
 * Utility functions for formatting data
 */

/**
 * Get current month name and year
 * @returns {string} Formatted month and year (e.g., "February 2026")
 */
const getCurrentMonth = () => {
    return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

/**
 * Get number of days remaining in current month
 * @returns {number} Days left in month
 */
const getDaysLeftInMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate() + 1;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: GBP)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'GBP') => {
    const symbol = currency === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Create a progress bar for budget visualization
 * @param {number} percentage - Percentage (0-100)
 * @returns {string} Progress bar string
 */
const createProgressBar = (percentage) => {
    const filled = Math.round(Math.min(percentage, 100) / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
};

/**
 * Get budget status emoji based on remaining amount
 * @param {number} remaining - Remaining budget
 * @param {number} budget - Total budget
 * @returns {string} Status message with emoji
 */
const getBudgetEmoji = (remaining, budget) => {
    const percentage = (remaining / budget) * 100;
    if (percentage > 30) return '✨ Looking good!';
    if (percentage > 10) return '⚠️ Getting low!';
    if (percentage > 0) return '🚨 Budget almost gone!';
    return '💥 Over budget!';
};

/**
 * Parse expense message with natural language support
 * @param {string} text - Input text
 * @returns {Object|null} Parsed expense or null if invalid
 */
const parseExpenseMessage = (text) => {
    // Support formats like:
    // "15.50 coffee"
    // "£15.50 for coffee"
    // "15.5 coffee at Starbucks"

    const patterns = [
        /^£?(\d+\.?\d*)\s+(.+)$/,  // "15.50 coffee"
        /^£?(\d+\.?\d*)\s+for\s+(.+)$/,  // "15.50 for coffee"
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return {
                amount: parseFloat(match[1]),
                description: match[2].trim()
            };
        }
    }

    return null;
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

module.exports = {
    getCurrentMonth,
    getDaysLeftInMonth,
    formatCurrency,
    createProgressBar,
    getBudgetEmoji,
    parseExpenseMessage,
    formatDate
};
