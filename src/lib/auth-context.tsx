"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from 'axios';

// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  settings: {
    theme: "light" | "dark" | "system";
    notifications: {
      tasks: boolean;
      health: boolean;
      finance: boolean;
    };
  };
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => Promise<{ success: boolean; message?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function for API calls
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        console.log("Checking if user is logged in...");
        const res = await fetchWithTimeout(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.log("Not logged in, status:", res.status);
          return;
        }

        const data = await res.json();
        console.log("Auth response:", data);

        if (data.success) {
          setUser(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("Registering user:", { name, email });
      const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      console.log("Register response:", data);

      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || "Registration failed" 
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { 
        success: false, 
        message: "Network error. Please check your connection and try again." 
      };
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      console.log("Logging in user:", email);
      const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || "Invalid credentials" 
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: "Network error. Please check your connection and try again." 
      };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      console.log("Logging out user");
      await fetchWithTimeout(`${API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update user
  const updateUser = async (updatedUser: Partial<User>) => {
    try {
      console.log("Updating user with data:", JSON.stringify(updatedUser));
      const res = await fetchWithTimeout(`${API_URL}/auth/update`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await res.json();
      console.log("Update response from server:", data);

      if (res.ok && data.success) {
        console.log("Setting user state with:", data.data);
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ...data.data,
            avatar: data.data.avatar || prev.avatar,
          };
        });
        return { success: true };
      } else {
        console.error("Update failed:", data.message);
        return { 
          success: false, 
          message: data.message || "Update failed" 
        };
      }
    } catch (error) {
      console.error("Update user error:", error);
      return { 
        success: false, 
        message: "Network error. Please check your connection and try again." 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 