const Expense = require('../models/Expense');
const User = require('../models/User');

const getExpenses = async (req, res, next) => {
    try {
        const { month } = req.query;
        // Simple filter logic for now
        const filter = { userId: req.userId };
        if (month) {
            // Assuming YYYY-MM
            const date = new Date(month);
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            filter.date = { $gte: start, $lt: end };
        }

        const expenses = await Expense.find(filter).sort({ date: -1 });
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const user = await User.findById(req.userId);

        res.json({ expenses, total, budget: user.monthlyBudget, remaining: user.monthlyBudget - total });
    } catch (error) {
        next(error);
    }
};

const createExpense = async (req, res, next) => {
    try {
        const { description, amount, category, date } = req.body;

        // Input validation
        if (!description || typeof description !== 'string' || description.length > 200) {
            return res.status(400).json({ error: 'Invalid description' });
        }

        if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 1000000) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Sanitize description
        const sanitizedDescription = description.replace(/<[^>]*>/g, '').trim();

        const expense = await Expense.create({
            description: sanitizedDescription,
            amount,
            category: category || 'Other',
            date: date || Date.now(),
            userId: req.userId
        });
        res.status(201).json({ expense });
    } catch (error) {
        next(error);
    }
};

const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!expense) return res.status(404).json({ error: 'Expense not found' });
        res.json({ message: 'Deleted' });
    } catch (error) {
        next(error);
    }
};

const getStats = async (req, res, next) => {
    // Simplified stats
    try {
        const expenses = await Expense.find({ userId: req.userId });
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        res.json({ monthlyTotal: total, count: expenses.length });
    } catch (error) {
        next(error);
    }
};

module.exports = { getExpenses, createExpense, deleteExpense, getStats };
