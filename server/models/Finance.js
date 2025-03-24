const mongoose = require('mongoose');

// Expense entry schema
const ExpenseEntrySchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please select an expense category'],
    enum: ['housing', 'food', 'transportation', 'utilities', 'entertainment', 'shopping', 'healthcare', 'other'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add expense amount'],
    min: [0, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Income entry schema
const IncomeEntrySchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Please select an income source'],
    enum: ['salary', 'freelance', 'investment', 'gift', 'other'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add income amount'],
    min: [0, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Finance profile schema
const FinanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  incomeGoal: {
    type: Number,
    default: 3500
  },
  expenseLimit: {
    type: Number,
    default: 2500
  },
  savingsGoal: {
    type: Number,
    default: 800
  },
  expenseEntries: [ExpenseEntrySchema],
  incomeEntries: [IncomeEntrySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
FinanceSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Finance', FinanceSchema); 