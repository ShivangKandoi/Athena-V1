const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');
const { protect } = require('../middleware/auth');

// @route   GET /api/finance
// @desc    Get finance profile for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let finance = await Finance.findOne({ user: req.user.id });
    
    // If no finance profile exists, create one
    if (!finance) {
      finance = await Finance.create({
        user: req.user.id,
        incomeGoal: 3500,
        expenseLimit: 2500,
        savingsGoal: 800,
        expenseEntries: [],
        incomeEntries: []
      });
    }
    
    res.json(finance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/finance/goals
// @desc    Update finance goals
// @access  Private
router.put('/goals', protect, async (req, res) => {
  const { incomeGoal, expenseLimit, savingsGoal } = req.body;
  
  try {
    let finance = await Finance.findOne({ user: req.user.id });
    
    if (!finance) {
      finance = new Finance({
        user: req.user.id,
        incomeGoal: incomeGoal || 3500,
        expenseLimit: expenseLimit || 2500,
        savingsGoal: savingsGoal || 800,
        expenseEntries: [],
        incomeEntries: []
      });
    } else {
      if (incomeGoal) finance.incomeGoal = incomeGoal;
      if (expenseLimit) finance.expenseLimit = expenseLimit;
      if (savingsGoal) finance.savingsGoal = savingsGoal;
    }
    
    await finance.save();
    res.json(finance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/finance/expense
// @desc    Add expense entry
// @access  Private
router.post('/expense', protect, async (req, res) => {
  const { category, amount, description, date } = req.body;
  
  try {
    let finance = await Finance.findOne({ user: req.user.id });
    
    if (!finance) {
      finance = new Finance({
        user: req.user.id,
        expenseEntries: [],
        incomeEntries: []
      });
    }
    
    const newExpenseEntry = {
      category,
      amount,
      description,
      date: date || Date.now()
    };
    
    finance.expenseEntries.push(newExpenseEntry);
    await finance.save();
    
    res.json(finance.expenseEntries[finance.expenseEntries.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/finance/expense/:id
// @desc    Delete expense entry
// @access  Private
router.delete('/expense/:id', protect, async (req, res) => {
  try {
    const finance = await Finance.findOne({ user: req.user.id });
    
    if (!finance) {
      return res.status(404).json({ msg: 'Finance profile not found' });
    }
    
    const expenseIndex = finance.expenseEntries.findIndex(entry => entry._id.toString() === req.params.id);
    
    if (expenseIndex === -1) {
      return res.status(404).json({ msg: 'Expense entry not found' });
    }
    
    finance.expenseEntries.splice(expenseIndex, 1);
    await finance.save();
    
    res.json({ msg: 'Expense entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/finance/income
// @desc    Add income entry
// @access  Private
router.post('/income', protect, async (req, res) => {
  const { source, amount, description, date } = req.body;
  
  try {
    let finance = await Finance.findOne({ user: req.user.id });
    
    if (!finance) {
      finance = new Finance({
        user: req.user.id,
        expenseEntries: [],
        incomeEntries: []
      });
    }
    
    const newIncomeEntry = {
      source,
      amount,
      description,
      date: date || Date.now()
    };
    
    finance.incomeEntries.push(newIncomeEntry);
    await finance.save();
    
    res.json(finance.incomeEntries[finance.incomeEntries.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/finance/income/:id
// @desc    Delete income entry
// @access  Private
router.delete('/income/:id', protect, async (req, res) => {
  try {
    const finance = await Finance.findOne({ user: req.user.id });
    
    if (!finance) {
      return res.status(404).json({ msg: 'Finance profile not found' });
    }
    
    const incomeIndex = finance.incomeEntries.findIndex(entry => entry._id.toString() === req.params.id);
    
    if (incomeIndex === -1) {
      return res.status(404).json({ msg: 'Income entry not found' });
    }
    
    finance.incomeEntries.splice(incomeIndex, 1);
    await finance.save();
    
    res.json({ msg: 'Income entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 