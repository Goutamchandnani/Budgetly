const User = require('../models/User');

const getBudget = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.json({ monthlyBudget: user.monthlyBudget, currency: user.currency });
    } catch (error) {
        next(error);
    }
};

const updateBudget = async (req, res, next) => {
    try {
        const { monthlyBudget } = req.body;
        const user = await User.findByIdAndUpdate(req.userId, { monthlyBudget }, { new: true });
        res.json({ monthlyBudget: user.monthlyBudget, currency: user.currency });
    } catch (error) {
        next(error);
    }
};

module.exports = { getBudget, updateBudget };
