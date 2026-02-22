const express = require('express');
const { getExpenses, createExpense, deleteExpense, getStats } = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);
router.get('/stats', getStats);

module.exports = router;
