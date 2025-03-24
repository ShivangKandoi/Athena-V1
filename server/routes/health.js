const express = require('express');
const router = express.Router();
const Health = require('../models/Health');
const { protect } = require('../middleware/auth');

// @route   GET /api/health
// @desc    Get health profile for the authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let health = await Health.findOne({ user: req.user.id });
    
    // If no health profile exists, create one
    if (!health) {
      health = await Health.create({
        user: req.user.id,
        calorieGoal: 2000,
        waterGoal: 2500,
        foodEntries: [],
        exerciseEntries: [],
        waterEntries: [],
        weightEntries: []
      });
    }
    
    res.json(health);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/health/goals
// @desc    Update health goals
// @access  Private
router.put('/goals', protect, async (req, res) => {
  const { calorieGoal, waterGoal, weightGoal } = req.body;
  
  try {
    let health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      health = new Health({
        user: req.user.id,
        calorieGoal: calorieGoal || 2000,
        waterGoal: waterGoal || 2500,
        weightGoal: weightGoal || null,
        foodEntries: [],
        exerciseEntries: [],
        waterEntries: [],
        weightEntries: []
      });
    } else {
      if (calorieGoal) health.calorieGoal = calorieGoal;
      if (waterGoal) health.waterGoal = waterGoal;
      if (weightGoal !== undefined) health.weightGoal = weightGoal;
    }
    
    await health.save();
    res.json(health);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/health/food
// @desc    Add food entry
// @access  Private
router.post('/food', protect, async (req, res) => {
  const { name, mealType, calories, description, time, date, aiGenerated } = req.body;
  
  try {
    let health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      health = new Health({
        user: req.user.id,
        foodEntries: [],
        exerciseEntries: [],
        waterEntries: [],
        weightEntries: []
      });
    }
    
    const newFoodEntry = {
      name,
      mealType: mealType || 'snack',
      calories,
      description,
      time,
      date: date || Date.now(),
      aiGenerated: aiGenerated || false
    };
    
    health.foodEntries.push(newFoodEntry);
    await health.save();
    
    res.json(health.foodEntries[health.foodEntries.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/health/food/:id
// @desc    Delete food entry
// @access  Private
router.delete('/food/:id', protect, async (req, res) => {
  try {
    const health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      return res.status(404).json({ msg: 'Health profile not found' });
    }
    
    const foodIndex = health.foodEntries.findIndex(entry => entry._id.toString() === req.params.id);
    
    if (foodIndex === -1) {
      return res.status(404).json({ msg: 'Food entry not found' });
    }
    
    health.foodEntries.splice(foodIndex, 1);
    await health.save();
    
    res.json({ msg: 'Food entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/health/exercise
// @desc    Add exercise entry
// @access  Private
router.post('/exercise', protect, async (req, res) => {
  const { name, duration, calories, intensity, description, time, date, aiGenerated } = req.body;
  
  try {
    let health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      health = new Health({
        user: req.user.id,
        foodEntries: [],
        exerciseEntries: [],
        waterEntries: [],
        weightEntries: []
      });
    }
    
    const newExerciseEntry = {
      name,
      duration,
      calories,
      intensity: intensity || 'moderate',
      description,
      time,
      date: date || Date.now(),
      aiGenerated: aiGenerated || false
    };
    
    health.exerciseEntries.push(newExerciseEntry);
    await health.save();
    
    res.json(health.exerciseEntries[health.exerciseEntries.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/health/exercise/:id
// @desc    Delete exercise entry
// @access  Private
router.delete('/exercise/:id', protect, async (req, res) => {
  try {
    const health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      return res.status(404).json({ msg: 'Health profile not found' });
    }
    
    const exerciseIndex = health.exerciseEntries.findIndex(entry => entry._id.toString() === req.params.id);
    
    if (exerciseIndex === -1) {
      return res.status(404).json({ msg: 'Exercise entry not found' });
    }
    
    health.exerciseEntries.splice(exerciseIndex, 1);
    await health.save();
    
    res.json({ msg: 'Exercise entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/health/water
// @desc    Add water entry
// @access  Private
router.post('/water', protect, async (req, res) => {
  const { amount, time, date } = req.body;
  
  try {
    let health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      health = new Health({
        user: req.user.id,
        foodEntries: [],
        exerciseEntries: [],
        waterEntries: [],
        weightEntries: []
      });
    }
    
    const newWaterEntry = {
      amount,
      time,
      date: date || Date.now()
    };
    
    health.waterEntries.push(newWaterEntry);
    await health.save();
    
    res.json(health.waterEntries[health.waterEntries.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/health/water/:id
// @desc    Delete water entry
// @access  Private
router.delete('/water/:id', protect, async (req, res) => {
  try {
    const health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      return res.status(404).json({ msg: 'Health profile not found' });
    }
    
    const waterIndex = health.waterEntries.findIndex(entry => entry._id.toString() === req.params.id);
    
    if (waterIndex === -1) {
      return res.status(404).json({ msg: 'Water entry not found' });
    }
    
    health.waterEntries.splice(waterIndex, 1);
    await health.save();
    
    res.json({ msg: 'Water entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/health/weight
// @desc    Add weight entry
// @access  Private
router.post('/weight', protect, async (req, res) => {
  const { weight, date } = req.body;
  
  try {
    let health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      health = new Health({
        user: req.user.id,
        foodEntries: [],
        exerciseEntries: [],
        waterEntries: [],
        weightEntries: []
      });
    }
    
    const newWeightEntry = {
      weight,
      date: date || Date.now()
    };
    
    health.weightEntries.push(newWeightEntry);
    await health.save();
    
    res.json(health.weightEntries[health.weightEntries.length - 1]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/health/weight/:id
// @desc    Delete weight entry
// @access  Private
router.delete('/weight/:id', protect, async (req, res) => {
  try {
    const health = await Health.findOne({ user: req.user.id });
    
    if (!health) {
      return res.status(404).json({ msg: 'Health profile not found' });
    }
    
    const weightIndex = health.weightEntries.findIndex(entry => entry._id.toString() === req.params.id);
    
    if (weightIndex === -1) {
      return res.status(404).json({ msg: 'Weight entry not found' });
    }
    
    health.weightEntries.splice(weightIndex, 1);
    await health.save();
    
    res.json({ msg: 'Weight entry removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 