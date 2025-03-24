import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Task interface matching the backend model
export interface Task {
  _id?: string;
  title: string;
  description?: string;
  date: Date | string;
  time?: string;
  category: 'work' | 'personal' | 'health' | 'shopping' | 'other';
  completed: boolean;
  createdAt?: Date | string;
}

// Get all tasks
export const getAllTasks = async () => {
  try {
    const response = await axios.get(`${API_URL}/tasks`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData: Omit<Task, '_id' | 'createdAt' | 'completed'>) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (id: string, taskData: Partial<Task>) => {
  try {
    const response = await axios.put(`${API_URL}/tasks/${id}`, taskData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/tasks/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Toggle task completion status
export const toggleTaskCompletion = async (id: string, completed: boolean) => {
  try {
    const response = await axios.put(
      `${API_URL}/tasks/${id}`,
      { completed },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling task completion:', error);
    throw error;
  }
}; 