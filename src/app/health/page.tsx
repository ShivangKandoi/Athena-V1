"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format, isSameDay, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  getHealthProfile,
  updateHealthGoals,
  addFoodEntry as addFoodEntryAPI,
  deleteFoodEntry,
  addExerciseEntry as addExerciseEntryAPI,
  deleteExerciseEntry,
  addWaterEntry as addWaterEntryAPI,
  deleteWaterEntry,
  addWeightEntry as addWeightEntryAPI,
  deleteWeightEntry,
  HealthProfile,
  FoodEntry,
  ExerciseEntry,
  WaterEntry,
  WeightEntry
} from "@/lib/health-service";
import { analyzeFoodEntry, analyzeExerciseEntry, generateHealthInsights } from "@/lib/gemini-service";
import {
  Activity,
  Apple,
  Dumbbell,
  Droplets,
  Plus,
  Scale,
  Utensils,
  LineChart,
  Calculator,
  BellRing,
  ArrowDown,
  ArrowUp,
  Loader2,
  Sparkles
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";

// Mock data for demonstration
const calorieGoal = 2000;
const waterGoal = 2500; // in ml

const mealEntries = [
  { id: "1", name: "Breakfast", time: "8:00 AM", calories: 450, description: "Oatmeal with fruits and nuts" },
  { id: "2", name: "Lunch", time: "12:30 PM", calories: 650, description: "Grilled chicken salad" },
  { id: "3", name: "Snack", time: "3:30 PM", calories: 150, description: "Greek yogurt with honey" },
  { id: "4", name: "Dinner", time: "7:00 PM", calories: 550, description: "Salmon with roasted vegetables" },
];

const exerciseEntries = [
  { id: "1", name: "Morning Run", time: "6:30 AM", calories: 320, duration: "30 min", description: "Moderate pace" },
  { id: "2", name: "Strength Training", time: "6:00 PM", calories: 280, duration: "45 min", description: "Upper body focus" },
];

const waterEntries = [
  { id: "1", time: "7:30 AM", amount: 250 },
  { id: "2", time: "10:00 AM", amount: 350 },
  { id: "3", time: "1:00 PM", amount: 500 },
  { id: "4", time: "4:30 PM", amount: 350 },
];

const weightEntries = [
  { date: "2023-03-01", weight: 78.5 },
  { date: "2023-03-08", weight: 78.2 },
  { date: "2023-03-15", weight: 77.8 },
  { date: "2023-03-22", weight: 77.3 },
  { date: "2023-03-29", weight: 76.9 },
  { date: "2023-04-05", weight: 76.5 },
  { date: "2023-04-12", weight: 76.1 },
];

export default function HealthPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthProfile | null>(null);
  
  // Define interface for insights
  interface HealthInsight {
    category: 'nutrition' | 'hydration' | 'activity';
    title: string;
    description: string;
  }
  
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);

  const [newFoodEntryOpen, setNewFoodEntryOpen] = useState(false);
  const [newExerciseEntryOpen, setNewExerciseEntryOpen] = useState(false);
  const [newWaterEntryOpen, setNewWaterEntryOpen] = useState(false);
  const [newWeightEntryOpen, setNewWeightEntryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("food");

  // Today's date at midnight for comparing dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Form states
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    description: '',
    calories: '',
    mealType: 'snack',
    time: format(new Date(), 'HH:mm'),
    aiDescription: '',
  });
  
  const [exerciseFormData, setExerciseFormData] = useState({
    name: '',
    duration: '',
    calories: '',
    intensity: 'moderate',
    description: '',
    time: format(new Date(), 'HH:mm'),
    aiDescription: '',
  });
  
  const [waterFormData, setWaterFormData] = useState({
    amount: '',
    time: format(new Date(), 'HH:mm'),
  });
  
  const [weightFormData, setWeightFormData] = useState({
    weight: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Function to check if a date is today
  const isToday = (date: Date) => {
    return isSameDay(date, today);
  };

  // Calculate total calories from real data
  const totalCaloriesIn = healthData?.foodEntries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return isToday(entryDate);
    })
    .reduce((sum, entry) => sum + entry.calories, 0) || 0;
    
  const totalCaloriesBurned = healthData?.exerciseEntries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return isToday(entryDate);
    })
    .reduce((sum, entry) => sum + entry.calories, 0) || 0;
    
  const netCalories = totalCaloriesIn - totalCaloriesBurned;
  const caloriePercentage = healthData?.calorieGoal 
    ? Math.min(100, Math.round((netCalories / healthData.calorieGoal) * 100)) 
    : 0;

  // Calculate total water intake
  const totalWaterIntake = healthData?.waterEntries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return isToday(entryDate);
    })
    .reduce((sum, entry) => sum + entry.amount, 0) || 0;
    
  const waterPercentage = healthData?.waterGoal 
    ? Math.min(100, Math.round((totalWaterIntake / healthData.waterGoal) * 100)) 
    : 0;

  // Get latest weight entry
  const latestWeightEntry = healthData?.weightEntries?.length 
    ? [...healthData.weightEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] 
    : null;
  
  // Get previous weight entry for comparison
  const previousWeightEntry = healthData?.weightEntries?.length && healthData.weightEntries.length > 1 
    ? [...healthData.weightEntries]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(1)[0] 
    : null;
  
  const weightDifference = latestWeightEntry && previousWeightEntry 
    ? latestWeightEntry.weight - previousWeightEntry.weight 
    : 0;

  // Fetch health data from API
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        const data = await getHealthProfile();
        setHealthData(data);
        
        // Generate AI insights
        try {
          const insights = await generateHealthInsights({
            calorieGoal: data.calorieGoal,
            waterGoal: data.waterGoal,
            totalCaloriesIn,
            totalWaterIntake,
            totalCaloriesBurned,
            latestWeight: latestWeightEntry?.weight
          });
          setInsights(insights);
        } catch (error) {
          console.error('Error generating insights:', error);
          // Fallback insights
          setInsights([
            {
              category: 'nutrition',
              title: 'Balance Your Diet',
              description: 'Aim for a balanced diet with plenty of fruits, vegetables, lean proteins, and whole grains.'
            },
            {
              category: 'hydration',
              title: 'Stay Hydrated',
              description: 'Remember to drink at least 8 glasses of water daily for optimal health.'
            },
            {
              category: 'activity',
              title: 'Move Regularly',
              description: 'Try to include at least 30 minutes of physical activity in your daily routine.'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching health data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load health data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchHealthData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, toast]);

  // Handle input changes
  const handleFoodInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFoodFormData({
      ...foodFormData,
      [name]: value,
    });
  };
  
  const handleExerciseInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setExerciseFormData({
      ...exerciseFormData,
      [name]: value,
    });
  };
  
  const handleWaterInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setWaterFormData({
      ...waterFormData,
      [name]: value,
    });
  };
  
  const handleWeightInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setWeightFormData({
      ...weightFormData,
      [name]: value,
    });
  };
  
  // Handle select changes
  const handleMealTypeChange = (value: string) => {
    setFoodFormData({
      ...foodFormData,
      mealType: value,
    });
  };
  
  const handleIntensityChange = (value: string) => {
    setExerciseFormData({
      ...exerciseFormData,
      intensity: value,
    });
  };

  // AI Analysis functions
  const handleAnalyzeFood = async () => {
    if (!foodFormData.aiDescription) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a description of your meal for AI analysis.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setAiProcessing(true);
      const analysis = await analyzeFoodEntry(foodFormData.aiDescription);
      
      // Ensure description doesn't exceed 200 characters
      const healthInsights = analysis.healthInsights && analysis.healthInsights.length > 200
        ? analysis.healthInsights.substring(0, 197) + '...'
        : analysis.healthInsights;
      
      setFoodFormData({
        ...foodFormData,
        name: analysis.name || foodFormData.name,
        calories: analysis.calories?.toString() || foodFormData.calories,
        mealType: analysis.mealType || foodFormData.mealType,
        description: healthInsights || foodFormData.description,
      });
      
      toast({
        title: 'AI Analysis Complete',
        description: 'Your meal has been analyzed. Please review and edit if needed.',
      });
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast({
        title: 'AI Analysis Failed',
        description: 'Failed to analyze your meal. Please enter details manually.',
        variant: 'destructive',
      });
    } finally {
      setAiProcessing(false);
    }
  };
  
  const handleAnalyzeExercise = async () => {
    if (!exerciseFormData.aiDescription) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a description of your exercise for AI analysis.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setAiProcessing(true);
      
      // If duration is not provided, use a default value for analysis
      const duration = exerciseFormData.duration ? 
        parseInt(exerciseFormData.duration) : 
        30; // Default 30 minutes
      
      const analysis = await analyzeExerciseEntry(
        exerciseFormData.aiDescription, 
        duration
      );
      
      // Ensure description doesn't exceed 200 characters
      const benefits = analysis.benefits && analysis.benefits.length > 200
        ? analysis.benefits.substring(0, 197) + '...'
        : analysis.benefits;
      
      setExerciseFormData({
        ...exerciseFormData,
        name: analysis.name || exerciseFormData.name,
        calories: analysis.calories?.toString() || exerciseFormData.calories,
        intensity: analysis.intensity || exerciseFormData.intensity,
        description: benefits || exerciseFormData.description,
        // Also set duration if it wasn't provided
        duration: exerciseFormData.duration || analysis.duration?.toString() || '30',
      });
      
      toast({
        title: 'AI Analysis Complete',
        description: 'Your exercise has been analyzed. Please review and edit if needed.',
      });
    } catch (error) {
      console.error('Error analyzing exercise:', error);
      toast({
        title: 'AI Analysis Failed',
        description: 'Failed to analyze your exercise. Please enter details manually.',
        variant: 'destructive',
      });
    } finally {
      setAiProcessing(false);
    }
  };

  // Add real entries to API
  const addFoodEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodFormData.name || !foodFormData.calories) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and calories for your meal.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate description length
    if (foodFormData.description && foodFormData.description.length > 200) {
      toast({
        title: 'Description Too Long',
        description: 'Description cannot exceed 200 characters.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const newEntry: Omit<FoodEntry, '_id'> = {
        name: foodFormData.name,
        mealType: foodFormData.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        calories: parseInt(foodFormData.calories),
        description: foodFormData.description,
        time: foodFormData.time,
        date: new Date().toISOString(),
        aiGenerated: !!foodFormData.aiDescription,
      };
      
      const addedEntry = await addFoodEntryAPI(newEntry);
      
      // Update local state
      if (healthData) {
        setHealthData({
          ...healthData,
          foodEntries: [...healthData.foodEntries, addedEntry],
        });
      }
      
      // Reset form
      setFoodFormData({
        name: '',
        description: '',
        calories: '',
        mealType: 'snack',
        time: format(new Date(), 'HH:mm'),
        aiDescription: '',
      });
      
    setNewFoodEntryOpen(false);
      
      toast({
        title: 'Success',
        description: 'Food entry added successfully.',
      });
    } catch (error) {
      console.error('Error adding food entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to add food entry. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const addExerciseEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!exerciseFormData.name || !exerciseFormData.duration || !exerciseFormData.calories) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name, duration, and calories for your exercise.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate description length
    if (exerciseFormData.description && exerciseFormData.description.length > 200) {
      toast({
        title: 'Description Too Long',
        description: 'Description cannot exceed 200 characters.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const newEntry: Omit<ExerciseEntry, '_id'> = {
        name: exerciseFormData.name,
        duration: parseInt(exerciseFormData.duration),
        calories: parseInt(exerciseFormData.calories),
        intensity: exerciseFormData.intensity as 'low' | 'moderate' | 'high',
        description: exerciseFormData.description,
        time: exerciseFormData.time,
        date: new Date().toISOString(),
        aiGenerated: !!exerciseFormData.aiDescription,
      };
      
      const addedEntry = await addExerciseEntryAPI(newEntry);
      
      // Update local state
      if (healthData) {
        setHealthData({
          ...healthData,
          exerciseEntries: [...healthData.exerciseEntries, addedEntry],
        });
      }
      
      // Reset form
      setExerciseFormData({
        name: '',
        duration: '',
        calories: '',
        intensity: 'moderate',
        description: '',
        time: format(new Date(), 'HH:mm'),
        aiDescription: '',
      });
      
    setNewExerciseEntryOpen(false);
      
      toast({
        title: 'Success',
        description: 'Exercise entry added successfully.',
      });
    } catch (error) {
      console.error('Error adding exercise entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to add exercise entry. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const addWaterEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!waterFormData.amount) {
      toast({
        title: 'Missing Information',
        description: 'Please provide an amount for your water intake.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const newEntry: Omit<WaterEntry, '_id'> = {
        amount: parseInt(waterFormData.amount),
        time: waterFormData.time,
        date: new Date().toISOString(),
      };
      
      const addedEntry = await addWaterEntryAPI(newEntry);
      
      // Update local state
      if (healthData) {
        setHealthData({
          ...healthData,
          waterEntries: [...healthData.waterEntries, addedEntry],
        });
      }
      
      // Reset form
      setWaterFormData({
        amount: '',
        time: format(new Date(), 'HH:mm'),
      });
      
    setNewWaterEntryOpen(false);
      
      toast({
        title: 'Success',
        description: 'Water entry added successfully.',
      });
    } catch (error) {
      console.error('Error adding water entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to add water entry. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const addWeightEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weightFormData.weight) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your weight.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const newEntry: Omit<WeightEntry, '_id'> = {
        weight: parseFloat(weightFormData.weight),
        date: new Date(weightFormData.date).toISOString(),
      };
      
      const addedEntry = await addWeightEntryAPI(newEntry);
      
      // Update local state
      if (healthData) {
        setHealthData({
          ...healthData,
          weightEntries: [...healthData.weightEntries, addedEntry],
        });
      }
      
      // Reset form
      setWeightFormData({
        weight: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      
    setNewWeightEntryOpen(false);
      
      toast({
        title: 'Success',
        description: 'Weight entry added successfully.',
      });
    } catch (error) {
      console.error('Error adding weight entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to add weight entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageLoader message="Loading your health data..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6 pb-24">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-violet-900 to-purple-800 dark:from-violet-950 dark:to-purple-900 rounded-xl p-5">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">Health & Fitness Tracker</h1>
            <p className="text-violet-200 text-sm">
              Monitor your nutrition, water intake, and physical activity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              onClick={() => setNewFoodEntryOpen(true)}
              className="bg-purple-700/40 hover:bg-purple-700/60 text-white border-none"
            >
              <Utensils className="h-4 w-4 mr-2" />
              Track Food
            </Button>

            <Button
              onClick={() => setNewExerciseEntryOpen(true)}
              className="bg-purple-700/40 hover:bg-purple-700/60 text-white border-none"
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Track Exercise
            </Button>
          </div>
        </div>

        {/* Daily Nutrition Overview Card */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-50">Daily Nutrition Overview</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="h-4 w-4 mr-2 text-violet-500" />
                  <span className="text-sm font-medium">Calorie Goal</span>
                </div>
                <div className="text-right text-sm">
                  <span className="font-medium">{netCalories}</span>
                  <span className="text-slate-400"> / {healthData?.calorieGoal || 2000}</span>
                </div>
              </div>
              <Progress value={caloriePercentage} className="h-2"
                style={{
                  "--tw-progress-color": "linear-gradient(to right, rgb(139, 92, 246), rgb(168, 85, 247))"
                } as React.CSSProperties}
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div>Consumed: {totalCaloriesIn}</div>
                <div>Burned: -{totalCaloriesBurned}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm font-medium">Water Intake</span>
                </div>
                <div className="text-right text-sm">
                  <span className="font-medium">{totalWaterIntake}ml</span>
                  <span className="text-slate-400"> / {healthData?.waterGoal || 2500}ml</span>
                </div>
              </div>
              <Progress value={waterPercentage} className="h-2 bg-blue-100 dark:bg-blue-900/30"
                style={{
                  "--tw-progress-color": "rgb(59, 130, 246)"
                } as React.CSSProperties}
              />
              <div className="text-xs text-slate-500">
                Add water throughout the day
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setNewWaterEntryOpen(true)}>
                <Droplets className="mr-2 h-4 w-4" />
                Add Water
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Scale className="h-4 w-4 mr-2 text-pink-500" />
                  <span className="text-sm font-medium">Weight Tracking</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{latestWeightEntry ? latestWeightEntry.weight : "--"} kg</div>
                {latestWeightEntry && previousWeightEntry && (
                  <div className={cn(
                    "text-sm font-medium", 
                    weightDifference > 0 ? "text-red-500" : weightDifference < 0 ? "text-green-500" : "text-gray-500"
                  )}>
                    {weightDifference > 0 ? "+" : weightDifference < 0 ? "-" : ""}
                    {Math.abs(weightDifference).toFixed(1)} kg
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500">
                Last updated: {latestWeightEntry 
                  ? format(new Date(latestWeightEntry.date), 'MMM d, yyyy') 
                  : "No data yet"}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setNewWeightEntryOpen(true)}>
                <Scale className="mr-2 h-4 w-4" />
                Update Weight
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Food and Exercise Tracking */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-2">
            <CardTitle className="text-base font-semibold">Nutrition Tracking</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your food intake and exercise for today
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Tabs defaultValue="food" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 h-10 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <TabsTrigger value="food" className="rounded-md">
                  <Utensils className="mr-2 h-4 w-4" />
                  Food
                </TabsTrigger>
                <TabsTrigger value="exercise" className="rounded-md">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Exercise
                </TabsTrigger>
              </TabsList>

              <TabsContent value="food" className="space-y-3">
                {healthData?.foodEntries
                  .filter(entry => isToday(new Date(entry.date)))
                  .length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center text-center">
                    <Utensils className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No food entries for today</p>
                    <Button
                      onClick={() => setNewFoodEntryOpen(true)}
                      variant="link"
                      className="mt-2"
                    >
                      Add your first meal
                    </Button>
                  </div>
                ) : (
                  healthData?.foodEntries
                    .filter(entry => isToday(new Date(entry.date)))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(meal => (
                      <div key={meal._id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-full">
                        <Utensils className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{meal.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-violet-600 dark:text-violet-400">{meal.calories} cal</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{meal.time || format(new Date(meal.date), 'h:mm a')}</div>
                    </div>
                  </div>
                    ))
                )}
              </TabsContent>

              <TabsContent value="exercise" className="space-y-3">
                {healthData?.exerciseEntries
                  .filter(entry => isToday(new Date(entry.date)))
                  .length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center text-center">
                    <Activity className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No exercise entries for today</p>
                    <Button
                      onClick={() => setNewExerciseEntryOpen(true)}
                      variant="link"
                      className="mt-2"
                    >
                      Add your first exercise
                    </Button>
                  </div>
                ) : (
                  healthData?.exerciseEntries
                    .filter(entry => isToday(new Date(entry.date)))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(exercise => (
                      <div key={exercise._id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-full">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{exercise.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600 dark:text-green-400">-{exercise.calories} cal</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {exercise.duration} min • {exercise.time || format(new Date(exercise.date), 'h:mm a')}
                          </div>
                    </div>
                  </div>
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* AI Health Insights */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-2">
            <CardTitle className="text-base font-semibold">AI Health Insights</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Personalized recommendations
            </p>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {insights.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <Sparkles className="mb-2 h-8 w-8 text-violet-500" />
                <p className="text-sm text-slate-500">
                  Add more data to get personalized AI health insights
                </p>
              </div>
            ) : (
              insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "rounded-lg p-4",
                    insight.category === 'hydration' ? "bg-blue-50 dark:bg-blue-900/20" :
                    insight.category === 'nutrition' ? "bg-green-50 dark:bg-green-900/20" :
                    "bg-violet-50 dark:bg-violet-900/20"
                  )}
                >
              <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 p-2 rounded-full",
                      insight.category === 'hydration' ? "bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400" :
                      insight.category === 'nutrition' ? "bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400" :
                      "bg-violet-100 dark:bg-violet-800/50 text-violet-600 dark:text-violet-400"
                    )}>
                      {insight.category === 'hydration' ? (
                        <Droplets className="h-4 w-4" />
                      ) : insight.category === 'nutrition' ? (
                  <Apple className="h-4 w-4" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                </div>
                <div>
                      <h4 className={cn(
                        "font-medium",
                        insight.category === 'hydration' ? "text-blue-800 dark:text-blue-300" :
                        insight.category === 'nutrition' ? "text-green-800 dark:text-green-300" :
                        "text-violet-800 dark:text-violet-300"
                      )}>{insight.title}</h4>
                      <p className={cn(
                        "text-sm mt-1",
                        insight.category === 'hydration' ? "text-blue-700/70 dark:text-blue-400/70" :
                        insight.category === 'nutrition' ? "text-green-700/70 dark:text-green-400/70" :
                        "text-violet-700/70 dark:text-violet-400/70"
                      )}>{insight.description}</p>
              </div>
            </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Food Entry Dialog */}
        <Sheet open={newFoodEntryOpen} onOpenChange={setNewFoodEntryOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-auto">
            <form onSubmit={addFoodEntry}>
              <SheetHeader className="text-left mb-6">
                <SheetTitle>Add Food Entry</SheetTitle>
                <SheetDescription>
                  Record what you've eaten to track your nutrition.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="aiDescription">Describe your meal (for AI analysis)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="aiDescription"
                      name="aiDescription"
                      placeholder="E.g., 'A large bowl of cereal with milk and banana'"
                      value={foodFormData.aiDescription}
                      onChange={handleFoodInputChange}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleAnalyzeFood} 
                      disabled={aiProcessing || !foodFormData.aiDescription}
                      className="shrink-0"
                    >
                      {aiProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Optional: Let AI analyze your meal and fill details automatically
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="food-name">Food Name</Label>
                  <Input 
                    id="food-name" 
                    name="name"
                    placeholder="e.g., Oatmeal with Fruit" 
                    value={foodFormData.name}
                    onChange={handleFoodInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input 
                      id="calories" 
                      name="calories"
                      type="number" 
                      placeholder="e.g., 350" 
                      value={foodFormData.calories}
                      onChange={handleFoodInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="meal-time">Time</Label>
                    <Input 
                      id="meal-time" 
                      name="time"
                      type="time" 
                      value={foodFormData.time}
                      onChange={handleFoodInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="meal-type">Meal Type</Label>
                  <Select value={foodFormData.mealType} onValueChange={handleMealTypeChange}>
                    <SelectTrigger id="meal-type">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="food-description">Description (Optional)</Label>
                  <Input 
                    id="food-description" 
                    name="description"
                    placeholder="Additional details" 
                    value={foodFormData.description}
                    onChange={handleFoodInputChange}
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-500">
                    {foodFormData.description.length}/200 characters
                  </p>
                </div>
              </div>
              <SheetFooter className="mt-8">
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Add Food Entry</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* Exercise Entry Dialog */}
        <Sheet open={newExerciseEntryOpen} onOpenChange={setNewExerciseEntryOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-auto">
            <form onSubmit={addExerciseEntry}>
              <SheetHeader className="text-left mb-6">
                <SheetTitle>Add Exercise Entry</SheetTitle>
                <SheetDescription>
                  Record your physical activity to track calories burned.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="exerciseAiDescription">Describe your exercise (for AI analysis)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="exerciseAiDescription"
                      name="aiDescription"
                      placeholder="E.g., 'Jogging in the park for 30 minutes at a moderate pace'"
                      value={exerciseFormData.aiDescription}
                      onChange={handleExerciseInputChange}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleAnalyzeExercise} 
                      disabled={aiProcessing || !exerciseFormData.aiDescription}
                      className="shrink-0"
                    >
                      {aiProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Optional: Let AI analyze your exercise and fill details automatically
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="exercise-name">Exercise Name</Label>
                  <Input 
                    id="exercise-name" 
                    name="name"
                    placeholder="e.g., Running, Yoga, Weights" 
                    value={exerciseFormData.name}
                    onChange={handleExerciseInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="exercise-duration">Duration (minutes)</Label>
                    <Input 
                      id="exercise-duration" 
                      name="duration"
                      type="number" 
                      placeholder="e.g., 30" 
                      value={exerciseFormData.duration}
                      onChange={handleExerciseInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="exercise-time">Time</Label>
                    <Input 
                      id="exercise-time" 
                      name="time"
                      type="time" 
                      value={exerciseFormData.time}
                      onChange={handleExerciseInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="calories-burned">Calories Burned (estimated)</Label>
                  <Input 
                    id="calories-burned" 
                    name="calories"
                    type="number" 
                    placeholder="e.g., 250" 
                    value={exerciseFormData.calories}
                    onChange={handleExerciseInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="exercise-intensity">Intensity</Label>
                  <Select value={exerciseFormData.intensity} onValueChange={handleIntensityChange}>
                    <SelectTrigger id="exercise-intensity">
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="exercise-description">Description (Optional)</Label>
                  <Input 
                    id="exercise-description" 
                    name="description"
                    placeholder="Additional details" 
                    value={exerciseFormData.description}
                    onChange={handleExerciseInputChange}
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-500">
                    {exerciseFormData.description.length}/200 characters
                  </p>
                </div>
              </div>
              <SheetFooter className="mt-8">
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Add Exercise Entry</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* Water Entry Dialog */}
        <Sheet open={newWaterEntryOpen} onOpenChange={setNewWaterEntryOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-auto">
            <form onSubmit={addWaterEntry}>
              <SheetHeader className="text-left mb-6">
                <SheetTitle>Add Water Intake</SheetTitle>
                <SheetDescription>
                  Record your water consumption to track hydration.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="water-amount">Amount (ml)</Label>
                  <Input 
                    id="water-amount" 
                    name="amount"
                    type="number" 
                    placeholder="e.g., 250" 
                    value={waterFormData.amount}
                    onChange={handleWaterInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="water-time">Time</Label>
                  <Input 
                    id="water-time" 
                    name="time"
                    type="time" 
                    value={waterFormData.time}
                    onChange={handleWaterInputChange}
                  />
                </div>
              </div>
              <SheetFooter className="mt-8">
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Add Water Entry</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* Weight Entry Dialog */}
        <Sheet open={newWeightEntryOpen} onOpenChange={setNewWeightEntryOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-auto">
            <form onSubmit={addWeightEntry}>
              <SheetHeader className="text-left mb-6">
                <SheetTitle>Update Weight</SheetTitle>
                <SheetDescription>
                  Record your current weight to track progress.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight-value">Weight (kg)</Label>
                  <Input 
                    id="weight-value" 
                    name="weight"
                    type="number" 
                    step="0.1" 
                    placeholder="e.g., 75.5" 
                    value={weightFormData.weight}
                    onChange={handleWeightInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight-date">Date</Label>
                  <Input 
                    id="weight-date" 
                    name="date"
                    type="date" 
                    value={weightFormData.date}
                    onChange={handleWeightInputChange}
                  />
                </div>
              </div>
              <SheetFooter className="mt-8">
                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Save Weight</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  );
}
