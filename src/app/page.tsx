"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import {
  CheckCircle,
  Utensils,
  Droplets,
  PieChart,
  CalendarDays,
  Dumbbell,
  Clock,
  BellRing,
  LineChart,
  Wallet,
  BarChart3,
  Loader2
} from "lucide-react";
import { Task, getAllTasks } from "@/lib/task-service";
import { HealthProfile, FoodEntry, ExerciseEntry, WaterEntry, getHealthProfile } from "@/lib/health-service";
import { FinanceProfile, ExpenseEntry, IncomeEntry, getFinanceProfile } from "@/lib/finance-service";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const today = new Date();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [financeProfile, setFinanceProfile] = useState<FinanceProfile | null>(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel for better performance
        const [tasksData, healthData, financeData] = await Promise.all([
          getAllTasks(),
          getHealthProfile().catch(error => {
            console.error('Error fetching health profile:', error);
            return null;
          }),
          getFinanceProfile().catch(error => {
            console.error('Error fetching finance profile:', error);
            return null;
          })
        ]);
        
        setTasks(tasksData);
        setHealthProfile(healthData);
        setFinanceProfile(financeData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  // Get today's date to filter activities
  const todayString = format(today, 'yyyy-MM-dd');
  
  // Filter today's tasks
  const todaysTasks = tasks.filter(task => {
    const taskDate = typeof task.date === 'string' 
      ? task.date.substring(0, 10) 
      : format(task.date, 'yyyy-MM-dd');
    return taskDate === todayString;
  });
  
  // Calculate task completion stats
  const completedTasks = todaysTasks.filter(task => task.completed).length;
  const totalTasks = todaysTasks.length;
  const tasksRemaining = totalTasks - completedTasks;
  
  // Get today's food entries
  const todaysFoodEntries = healthProfile?.foodEntries.filter(entry => {
    const entryDate = typeof entry.date === 'string'
      ? entry.date.substring(0, 10)
      : format(entry.date, 'yyyy-MM-dd');
    return entryDate === todayString;
  }) || [];

  // Calculate total calories consumed today
  const caloriesConsumed = todaysFoodEntries.reduce((total, entry) => 
    total + (entry.calories || 0), 0);
  
  // Get today's water entries
  const todaysWaterEntries = healthProfile?.waterEntries.filter(entry => {
    const entryDate = typeof entry.date === 'string'
      ? entry.date.substring(0, 10)
      : format(entry.date, 'yyyy-MM-dd');
    return entryDate === todayString;
  }) || [];

  // Calculate total water intake
  const waterIntake = todaysWaterEntries.reduce((total, entry) => 
    total + entry.amount, 0);
  
  // Get today's expenses
  const todaysExpenses = financeProfile?.expenseEntries.filter(entry => {
    const entryDate = typeof entry.date === 'string'
      ? entry.date.substring(0, 10)
      : format(entry.date, 'yyyy-MM-dd');
    return entryDate === todayString;
  }) || [];

  // Calculate total expenses for today
  const totalExpenses = todaysExpenses.reduce((total, entry) => 
    total + entry.amount, 0);
  
  // Get most recent activities for display
  // Sort all activities by date (most recent first)
  const recentActivities = [
    // Include today's tasks
    ...todaysTasks.map(task => ({
      type: 'task',
      data: task,
      time: task.time || '9:00 AM', // Fallback time if not provided
      createdAt: task.createdAt || new Date()
    })),
    
    // Include today's food entries
    ...todaysFoodEntries.map(entry => ({
      type: 'food',
      data: entry,
      time: entry.time || '12:00 PM', // Fallback time
      createdAt: entry.date || new Date()
    })),
    
    // Include today's exercise entries
    ...(healthProfile?.exerciseEntries.filter(entry => {
      const entryDate = typeof entry.date === 'string'
        ? entry.date.substring(0, 10)
        : format(entry.date, 'yyyy-MM-dd');
      return entryDate === todayString;
    }) || []).map(entry => ({
      type: 'exercise',
      data: entry,
      time: entry.time || '5:00 PM', // Fallback time
      createdAt: entry.date || new Date()
    })),
    
    // Include today's expenses
    ...todaysExpenses.map(entry => ({
      type: 'expense',
      data: entry,
      time: '3:00 PM', // Fallback time as expenses might not have time
      createdAt: entry.date || new Date()
    }))
  ].sort((a, b) => {
    // Sort by time string for simplicity
    return a.time.localeCompare(b.time);
  }).slice(0, 5); // Get top 5 activities for display

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6 pb-24">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-violet-900 to-purple-800 dark:from-violet-950 dark:to-purple-900 rounded-xl p-5">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-violet-200 text-sm">
              Welcome back! Here's your personal overview.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <span className="ml-2 text-lg text-violet-600">Loading your data...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {/* Tasks Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-medium">Tasks Completed</div>
                    <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{completedTasks}/{totalTasks || 0}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {tasksRemaining} task{tasksRemaining !== 1 ? 's' : ''} remaining
                  </div>
                </CardContent>
              </Card>

              {/* Calories Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-medium">Calories</div>
                    <div className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 p-2 rounded-full">
                      <Utensils className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{caloriesConsumed}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Goal: {healthProfile?.calorieGoal || 2000} kcal
                  </div>
                </CardContent>
              </Card>

              {/* Water Intake Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-medium">Water Intake</div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full">
                      <Droplets className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{waterIntake}ml</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Goal: {healthProfile?.waterGoal || 2500}ml
                  </div>
                </CardContent>
              </Card>

              {/* Budget Card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-medium">Expenses Today</div>
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full">
                      <Wallet className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Limit: ${financeProfile?.expenseLimit || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-2">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {format(today, 'EEEE, MMMM d, yyyy')}
                </p>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    // Render different activity types with appropriate icons and details
                    if (activity.type === 'task') {
                      const task = activity.data as Task;
                      return (
                        <div key={`task-${index}`} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                          <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 p-2 rounded-full">
                            <CalendarDays className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {task.time || 'No time specified'} - {task.category}
                            </p>
                          </div>
                        </div>
                      );
                    } else if (activity.type === 'food') {
                      const food = activity.data as FoodEntry;
                      return (
                        <div key={`food-${index}`} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                          <div className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 p-2 rounded-full">
                            <Utensils className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{food.name || 'Meal'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {food.calories || 0} calories
                            </p>
                          </div>
                        </div>
                      );
                    } else if (activity.type === 'exercise') {
                      const exercise = activity.data as ExerciseEntry;
                      return (
                        <div key={`exercise-${index}`} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-full">
                            <Dumbbell className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{exercise.name || 'Workout'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {exercise.duration} minutes - {exercise.calories || 0} calories
                            </p>
                          </div>
                        </div>
                      );
                    } else if (activity.type === 'expense') {
                      const expense = activity.data as ExpenseEntry;
                      return (
                        <div key={`expense-${index}`} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full">
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{expense.category}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ${expense.amount.toFixed(2)} - {expense.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    return null; // Fallback
                  })
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    No activities recorded for today
                  </div>
                )}
                
                {recentActivities.length === 0 && (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-50">
                      <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 p-2 rounded-full">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">No recent activities</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Add tasks, meals, or exercise to see them here
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-2">
                <CardTitle className="text-base font-semibold">Daily Insights</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="rounded-lg bg-violet-50 dark:bg-violet-900/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-violet-100 dark:bg-violet-800/50 text-violet-600 dark:text-violet-400 p-2 rounded-full">
                      <BellRing className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-violet-800 dark:text-violet-300">Task Summary</h4>
                      <p className="text-sm text-violet-700/70 dark:text-violet-400/70 mt-1">
                        {totalTasks === 0 
                          ? "No tasks scheduled for today. Enjoy your free time!" 
                          : completedTasks === totalTasks 
                            ? "Great job! You've completed all tasks for today." 
                            : `You have ${tasksRemaining} task${tasksRemaining !== 1 ? 's' : ''} remaining for today.`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400 p-2 rounded-full">
                      <LineChart className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">Health Status</h4>
                      <p className="text-sm text-blue-700/70 dark:text-blue-400/70 mt-1">
                        {caloriesConsumed === 0 && waterIntake === 0
                          ? "No health data recorded today. Remember to log your meals and water intake."
                          : `You've consumed ${caloriesConsumed} calories (${Math.round((caloriesConsumed / (healthProfile?.calorieGoal || 2000)) * 100)}% of goal) and ${waterIntake}ml of water (${Math.round((waterIntake / (healthProfile?.waterGoal || 2500)) * 100)}% of goal).`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
