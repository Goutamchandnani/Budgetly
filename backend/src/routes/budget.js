const express = require('express');
const { getBudget, updateBudget } = require('../controllers/budgetController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', getBudget);
router.put('/', updateBudget);

module.exports = router;
