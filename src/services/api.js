import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Don't redirect if we're already on the login page
            // This prevents the page checking for session expiry during actual login attempts
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    signup: (userData) => api.post('/auth/signup', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    exportData: () => api.get('/auth/export'),
    deleteAccount: () => api.delete('/auth/me'),
};

export const budgetService = {
    getBudget: () => api.get('/budget'),
    updateBudget: (amount) => api.put('/budget', { monthlyBudget: amount }),
};

export const expenseService = {
    getExpenses: (month) => api.get(`/expenses?month=${month}`),
    addExpense: (expense) => {
        // Client-side validation
        if (!expense.description || expense.description.length > 200) {
            return Promise.reject(new Error('Description must be between 1-200 characters'));
        }
        if (!expense.amount || expense.amount <= 0 || expense.amount > 1000000) {
            return Promise.reject(new Error('Invalid amount'));
        }
        return api.post('/expenses', expense);
    },
    deleteExpense: (id) => api.delete(`/expenses/${id}`),
};

export const telegramService = {
    generateCode: () => api.post('/telegram/generate-code'),
    getStatus: () => api.get('/telegram/status'),
    disconnect: () => api.delete('/telegram/disconnect'),
};

export default api;
