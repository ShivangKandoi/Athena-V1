"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { format, addDays, isSameDay, parseISO, isToday, isTomorrow, isEqual } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Task as TaskType, getAllTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } from "@/lib/task-service";
import { useAuth } from "@/lib/auth-context";

// UI Components
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageLoader } from "@/components/ui/page-loader";

// Icons
import {
  Calendar,
  Clock,
  Plus,
  PlusCircle,
  Trash2,
  Tag,
  User2,
  Heart,
  ShoppingCart
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Category = {
  label: string;
  value: string;
  color: string;
};

const categoryOptions: Category[] = [
  { label: "Work", value: "work", color: "bg-blue-500" },
  { label: "Personal", value: "personal", color: "bg-green-500" },
  { label: "Health", value: "health", color: "bg-purple-500" },
  { label: "Shopping", value: "shopping", color: "bg-yellow-500" },
  { label: "Other", value: "other", color: "bg-gray-500" },
];

export default function PlannerPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Task form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    category: "other",
  });

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const taskData = await getAllTasks();
        setTasks(taskData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [toast]);

  // Filter today's tasks
  const todayTasks = tasks.filter((task) => {
    const taskDate = typeof task.date === 'string' ? parseISO(task.date) : task.date as Date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(taskDate);
    compareDate.setHours(0, 0, 0, 0);
    return isEqual(compareDate, today);
  });

  // Calculate task completion percentage
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  // Handle task form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTask = await createTask({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        category: formData.category as TaskType['category'],
      });
      
      setTasks([...tasks, newTask]);
      setShowTaskForm(false);
      setFormData({
        title: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "",
        category: "other",
      });
      
      toast({
        title: "Success",
        description: "Task added successfully",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle toggling task completion
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const updatedTask = await toggleTaskCompletion(taskId, !completed);
      setTasks(tasks.map(task => task._id === taskId ? updatedTask : task));
    } catch (error) {
      console.error("Error toggling task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      setShowTaskDetails(false);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle opening task details
  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  return (
    <MainLayout>
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6 mb-8">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white">Planner</h1>
              <p className="text-violet-200 text-sm">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-3 mb-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-violet-200">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
                <p className="text-sm text-violet-200">
                  {Math.round(completionPercentage)}%
                </p>
              </div>
              <Progress value={completionPercentage} className="h-2 bg-white/20" indicatorClassName="bg-white" />
            </div>

            <Sheet open={showTaskForm} onOpenChange={setShowTaskForm}>
              <SheetTrigger asChild>
                <Button
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-none"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-auto">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />

                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="text-xl font-bold">New Task</SheetTitle>
                  <SheetDescription>
                    Add a new task to your planner
                  </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="What needs to be done?"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time (Optional)</Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Add details about this task"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <SheetFooter className="mt-8">
                    <Button
                      type="submit"
                      className="w-full h-14 rounded-xl text-base bg-violet-600 hover:bg-violet-700"
                    >
                      Create Task
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Today's Tasks</h2>
            <div className="space-y-3 mb-8">
              {loading ? (
                <PageLoader message="Loading tasks..." />
              ) : todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <Card
                    key={task._id}
                    className={cn(
                      "border task-card overflow-hidden",
                      task.completed
                        ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800/60"
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800",
                      categoryOptions.find(c => c.value === task.category)?.color
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start gap-2 p-3">
                        <div className="flex-none pt-1">
                          <div>
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => handleToggleComplete(task._id!, task.completed)}
                              className={cn(
                                "h-5 w-5 rounded-md border-2 transition-colors",
                                task.completed
                                  ? "border-slate-200 dark:border-slate-700"
                                  : "border-slate-300 dark:border-slate-600"
                              )}
                            />
                          </div>
                        </div>
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <p className={cn(
                            "font-medium",
                            task.completed && "line-through text-slate-500 dark:text-slate-400"
                          )}>
                            {task.title}
                          </p>
                          {task.time && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              <span>{task.time}</span>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-1">
                            <Badge
                              className={cn(
                                "text-xs rounded-full px-2 py-0 h-4 border-0",
                                categoryOptions.find(c => c.value === task.category)?.color
                              )}
                            >
                              {categoryOptions.find(c => c.value === task.category)?.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center py-4 text-slate-500">No tasks for today</p>
              )}
            </div>
          </div>

          {/* Task Details Sheet */}
          <Sheet open={showTaskDetails && selectedTask !== null} onOpenChange={setShowTaskDetails}>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-auto">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
              
              {selectedTask && (
                <div className="space-y-6">
                  <SheetHeader className="text-left">
                    <div className="flex justify-between items-center mb-2">
                      <SheetTitle className="text-xl font-bold">{selectedTask.title}</SheetTitle>
                      <Checkbox
                        checked={selectedTask.completed}
                        onCheckedChange={() => handleToggleComplete(selectedTask._id!, selectedTask.completed)}
                        className={cn(
                          "h-5 w-5 rounded-md border-2 transition-colors",
                          selectedTask.completed
                            ? "border-slate-200 dark:border-slate-700"
                            : "border-slate-300 dark:border-slate-600"
                        )}
                      />
                    </div>
                    <SheetDescription>
                      Task details and actions
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                      <span>
                        {typeof selectedTask.date === 'string'
                          ? format(parseISO(selectedTask.date), "MMMM d, yyyy")
                          : format(selectedTask.date as Date, "MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    {selectedTask.time && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-slate-500" />
                        <span>{selectedTask.time}</span>
                      </div>
                    )}
                  </div>
                  
                  <Badge
                    className={cn(
                      "rounded-full px-3 py-1 border-0",
                      categoryOptions.find(c => c.value === selectedTask.category)?.color
                    )}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    <span className="ml-1 capitalize">{selectedTask.category}</span>
                  </Badge>
                  
                  {selectedTask.description && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-2">Description</h4>
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-6">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 dark:text-red-400"
                      onClick={() => handleDeleteTask(selectedTask._id!)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </MainLayout>
  );
}
