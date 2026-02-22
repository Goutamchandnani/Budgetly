const axios = require('axios');

const API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api';

/**
 * API Client for Backend Integration
 */
const api = {
    /**
     * Link Telegram account with user account
     * @param {string} code - Linking code from web app
     * @param {number} chatId - Telegram chat ID
     * @param {string} username - Telegram username
     * @returns {Promise<Object>} Response with success status
     */
    linkAccount: async (code, chatId, username) => {
        try {
            const response = await axios.post(`${API_URL}/telegram/link`, {
                code,
                chatId,
                username
            });
            return response.data;
        } catch (error) {
            console.error('Error linking account:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Check if Telegram user is linked to an account
     * @param {number} chatId - Telegram chat ID
     * @returns {Promise<boolean>} True if linked
     */
    checkLinked: async (chatId) => {
        try {
            const response = await axios.get(`${API_URL}/telegram/check/${chatId}`);
            return response.data.linked;
        } catch (error) {
            console.error('Error checking link status:', error.message);
            return false;
        }
    },

    /**
     * Add expense via Telegram
     * @param {number} chatId - Telegram chat ID
     * @param {Object} expense - Expense details
     * @returns {Promise<Object>} Updated budget data
     */
    addExpense: async (chatId, expense) => {
        try {
            const response = await axios.post(`${API_URL}/telegram/expense`, {
                chatId,
                description: expense.description,
                amount: expense.amount,
                date: expense.date
            });
            return response.data;
        } catch (error) {
            console.error('Error adding expense:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get budget status for user
     * @param {number} chatId - Telegram chat ID
     * @returns {Promise<Object>} Budget status data
     */
    getBudgetStatus: async (chatId) => {
        try {
            const response = await axios.get(`${API_URL}/telegram/budget/${chatId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching budget status:', error.message);
            throw error;
        }
    },

    /**
     * Get recent expenses
     * @param {number} chatId - Telegram chat ID
     * @param {number} limit - Number of expenses to fetch
     * @returns {Promise<Array>} List of expenses
     */
    getRecentExpenses: async (chatId, limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}/telegram/expenses/${chatId}?limit=${limit}`);
            return response.data.expenses;
        } catch (error) {
            console.error('Error fetching expenses:', error.message);
            throw error;
        }
    },

    /**
     * Update monthly budget
     * @param {number} chatId - Telegram chat ID
     * @param {number} amount - New budget amount
     * @returns {Promise<Object>} Updated budget data
     */
    updateBudget: async (chatId, amount) => {
        try {
            const response = await axios.put(`${API_URL}/telegram/budget/${chatId}`, {
                monthlyBudget: amount
            });
            return response.data;
        } catch (error) {
            console.error('Error updating budget:', error.message);
            throw error;
        }
    }
};

module.exports = api;
