const mongoose = require('mongoose');

// Food entry schema
const FoodEntrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a food name'],
    trim: true,
    maxlength: [100, 'Food name cannot exceed 100 characters']
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'snack'
  },
  calories: {
    type: Number,
    required: [true, 'Please add calorie information']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  time: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  aiGenerated: {
    type: Boolean,
    default: false
  }
});

// Exercise entry schema
const ExerciseEntrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an exercise name'],
    trim: true,
    maxlength: [100, 'Exercise name cannot exceed 100 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Please add exercise duration in minutes']
  },
  calories: {
    type: Number,
    required: [true, 'Please add calories burned information']
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  time: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  aiGenerated: {
    type: Boolean,
    default: false
  }
});

// Water entry schema
const WaterEntrySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please add water amount in ml']
  },
  time: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Weight entry schema
const WeightEntrySchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: [true, 'Please add weight information in kg']
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Please add date for the weight entry']
  }
});

// Health profile schema
const HealthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  calorieGoal: {
    type: Number,
    default: 2000
  },
  waterGoal: {
    type: Number,
    default: 2500
  },
  weightGoal: {
    type: Number,
    default: null
  },
  foodEntries: [FoodEntrySchema],
  exerciseEntries: [ExerciseEntrySchema],
  waterEntries: [WaterEntrySchema],
  weightEntries: [WeightEntrySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
HealthSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Health', HealthSchema); 