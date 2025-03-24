import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Finance profile interface
export interface FinanceProfile {
  _id?: string;
  user: string;
  incomeGoal: number;
  expenseLimit: number;
  savingsGoal: number;
  expenseEntries: ExpenseEntry[];
  incomeEntries: IncomeEntry[];
  createdAt?: Date | string;
}

// Expense entry interface
export interface ExpenseEntry {
  _id?: string;
  category: 'housing' | 'food' | 'transportation' | 'utilities' | 'entertainment' | 'shopping' | 'healthcare' | 'other';
  amount: number;
  description?: string;
  date: Date | string;
}

// Income entry interface
export interface IncomeEntry {
  _id?: string;
  source: 'salary' | 'freelance' | 'investment' | 'gift' | 'other';
  amount: number;
  description?: string;
  date: Date | string;
}

// Get finance profile
export const getFinanceProfile = async (): Promise<FinanceProfile> => {
  try {
    const response = await axios.get(`${API_URL}/finance`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching finance profile:', error);
    throw error;
  }
};

// Update finance goals
export const updateFinanceGoals = async (goals: { 
  incomeGoal?: number; 
  expenseLimit?: number; 
  savingsGoal?: number;
}): Promise<FinanceProfile> => {
  try {
    const response = await axios.put(`${API_URL}/finance/goals`, goals, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error updating finance goals:', error);
    throw error;
  }
};

// Add expense entry
export const addExpenseEntry = async (entry: Omit<ExpenseEntry, '_id'>): Promise<ExpenseEntry> => {
  try {
    const response = await axios.post(`${API_URL}/finance/expense`, entry, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error adding expense entry:', error);
    throw error;
  }
};

// Delete expense entry
export const deleteExpenseEntry = async (id: string): Promise<{ msg: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/finance/expense/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting expense entry:', error);
    throw error;
  }
};

// Add income entry
export const addIncomeEntry = async (entry: Omit<IncomeEntry, '_id'>): Promise<IncomeEntry> => {
  try {
    const response = await axios.post(`${API_URL}/finance/income`, entry, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error adding income entry:', error);
    throw error;
  }
};

// Delete income entry
export const deleteIncomeEntry = async (id: string): Promise<{ msg: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/finance/income/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting income entry:', error);
    throw error;
  }
}; 