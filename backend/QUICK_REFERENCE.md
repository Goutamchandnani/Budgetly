# Budgetly Database - Quick Reference

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Test database connection
node test-db.js

# Seed test data
npm run seed

# Start development server
npm run dev
```

## 📊 Database Models

### User Model
```javascript
const User = require('./models/User');

// Create user
const user = await User.create({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  monthlyBudget: 150,
  currency: 'GBP'
});

// Find user
const user = await User.findOne({ email: 'user@example.com' });

// Generate linking code
const code = user.generateLinkingCode();
await user.save();

// Verify password
const isValid = await user.comparePassword('password123');
```

### Expense Model
```javascript
const Expense = require('./models/Expense');

// Create expense
const expense = await Expense.create({
  userId: user._id,
  description: 'Groceries',
  amount: 45.50,
  category: 'Food',
  date: new Date(),
  addedVia: 'web'
});

// Get monthly total
const stats = await Expense.getMonthlyTotal(userId, 2024, 2);
// Returns: { total: 156.75, count: 12, average: 13.06 }

// Get category breakdown
const breakdown = await Expense.getCategoryBreakdown(userId, 2024, 2);
// Returns: [{ _id: 'Food', total: 65.50, count: 5 }, ...]
```

## 🔍 Common Queries

### Get User's Expenses (Current Month)
```javascript
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

const expenses = await Expense.find({
  userId: user._id,
  date: { $gte: startOfMonth, $lt: endOfMonth }
}).sort({ date: -1 });
```

### Get Expenses by Category
```javascript
const foodExpenses = await Expense.find({
  userId: user._id,
  category: 'Food'
}).sort({ date: -1 });
```

### Update User Budget
```javascript
await User.findByIdAndUpdate(userId, {
  monthlyBudget: 200,
  currency: 'USD'
}, { new: true });
```

### Delete Expense
```javascript
await Expense.findByIdAndDelete(expenseId);
```

## 📋 Categories

- **Food** - Groceries, restaurants, coffee
- **Transport** - Bus, train, taxi, fuel
- **Entertainment** - Movies, concerts, games
- **Shopping** - Clothes, electronics, books
- **Bills** - Rent, utilities, phone
- **Other** - Miscellaneous

## 🔐 Environment Variables

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/budgettracker
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
TELEGRAM_BOT_TOKEN=your-bot-token
NODE_ENV=development
```

## 🧪 Test Credentials

After running `npm run seed`:

- **Email:** test@budgetly.com
- **Password:** password123

## 📦 NPM Scripts

- `npm start` - Production server
- `npm run dev` - Development server (nodemon)
- `npm run seed` - Seed test data

## 🔗 Indexes

### Users
- `email` (unique)
- `telegramChatId` (unique, sparse)

### Expenses
- `userId`
- `date`
- `{ userId, date }` (compound)

## 💾 Backup Commands

### Backup
```bash
mongodump --uri="mongodb://localhost:27017/budgettracker" --out=/backup
```

### Restore
```bash
mongorestore --uri="mongodb://localhost:27017/budgettracker" /backup
```

## 🌐 MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string
6. Update `.env`:
   ```
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/budgettracker
   ```

## 🐛 Troubleshooting

### Connection Error
- Check MongoDB is running
- Verify DATABASE_URL in .env
- Check network/firewall

### Validation Error
- Check required fields
- Verify data types
- Check enum values

### Authentication Error
- Verify database credentials
- Check user permissions

## 📚 Documentation

- [Full Schema Docs](docs/database-schema.md)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
