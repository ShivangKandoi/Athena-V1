import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Health profile interface
export interface HealthProfile {
  _id?: string;
  user: string;
  calorieGoal: number;
  waterGoal: number;
  weightGoal: number | null;
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
  waterEntries: WaterEntry[];
  weightEntries: WeightEntry[];
  createdAt?: Date | string;
}

// Food entry interface
export interface FoodEntry {
  _id?: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  description?: string;
  time?: string;
  date: Date | string;
  aiGenerated?: boolean;
}

// Exercise entry interface
export interface ExerciseEntry {
  _id?: string;
  name: string;
  duration: number;
  calories: number;
  intensity: 'low' | 'moderate' | 'high';
  description?: string;
  time?: string;
  date: Date | string;
  aiGenerated?: boolean;
}

// Water entry interface
export interface WaterEntry {
  _id?: string;
  amount: number;
  time?: string;
  date: Date | string;
}

// Weight entry interface
export interface WeightEntry {
  _id?: string;
  weight: number;
  date: Date | string;
}

// Get health profile
export const getHealthProfile = async (): Promise<HealthProfile> => {
  try {
    const response = await axios.get(`${API_URL}/health`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching health profile:', error);
    throw error;
  }
};

// Update health goals
export const updateHealthGoals = async (goals: { 
  calorieGoal?: number; 
  waterGoal?: number; 
  weightGoal?: number | null;
}): Promise<HealthProfile> => {
  try {
    const response = await axios.put(`${API_URL}/health/goals`, goals, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error updating health goals:', error);
    throw error;
  }
};

// Add food entry
export const addFoodEntry = async (entry: Omit<FoodEntry, '_id'>): Promise<FoodEntry> => {
  try {
    const response = await axios.post(`${API_URL}/health/food`, entry, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error adding food entry:', error);
    throw error;
  }
};

// Delete food entry
export const deleteFoodEntry = async (id: string): Promise<{ msg: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/health/food/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting food entry:', error);
    throw error;
  }
};

// Add exercise entry
export const addExerciseEntry = async (entry: Omit<ExerciseEntry, '_id'>): Promise<ExerciseEntry> => {
  try {
    const response = await axios.post(`${API_URL}/health/exercise`, entry, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error adding exercise entry:', error);
    throw error;
  }
};

// Delete exercise entry
export const deleteExerciseEntry = async (id: string): Promise<{ msg: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/health/exercise/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting exercise entry:', error);
    throw error;
  }
};

// Add water entry
export const addWaterEntry = async (entry: Omit<WaterEntry, '_id'>): Promise<WaterEntry> => {
  try {
    const response = await axios.post(`${API_URL}/health/water`, entry, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error adding water entry:', error);
    throw error;
  }
};

// Delete water entry
export const deleteWaterEntry = async (id: string): Promise<{ msg: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/health/water/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting water entry:', error);
    throw error;
  }
};

// Add weight entry
export const addWeightEntry = async (entry: Omit<WeightEntry, '_id'>): Promise<WeightEntry> => {
  try {
    const response = await axios.post(`${API_URL}/health/weight`, entry, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error adding weight entry:', error);
    throw error;
  }
};

// Delete weight entry
export const deleteWeightEntry = async (id: string): Promise<{ msg: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/health/weight/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    throw error;
  }
}; 