const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters']
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0']
        },
        category: {
            type: String,
            trim: true,
            default: 'Other',
            enum: {
                values: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'],
                message: '{VALUE} is not a valid category'
            }
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
        },
        addedVia: {
            type: String,
            enum: ['web', 'telegram'],
            default: 'web'
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient queries by user and date
expenseSchema.index({ userId: 1, date: -1 });

// Static method to get monthly total for a user
expenseSchema.statics.getMonthlyTotal = async function (userId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 },
                average: { $avg: '$amount' }
            }
        }
    ]);

    return result.length > 0 ? result[0] : { total: 0, count: 0, average: 0 };
};

// Static method to get expenses by category for a user in a given month
expenseSchema.statics.getCategoryBreakdown = async function (userId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { total: -1 }
        }
    ]);

    return result;
};

module.exports = mongoose.model('Expense', expenseSchema);
