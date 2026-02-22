const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            console.log('Using default local MongoDB URL');
        }
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/budgettracker');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
