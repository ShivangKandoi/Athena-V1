"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Building,
  Cloud,
  CreditCard,
  Download,
  Edit,
  Lock,
  Mail,
  MessageSquare,
  Moon,
  Save,
  Settings,
  Shield,
  Sun,
  User,
  Wallet,
  Droplets,
  Sparkles,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  checkNotificationPermission, 
  requestNotificationPermission, 
  scheduleWaterReminders, 
  scheduleMorningMotivation,
  scheduleHealthCheckReminder,
  toggleNotification,
  getScheduledNotifications
} from "@/lib/notification-service";

export default function SettingsPage() {
  const { user, updateUser, loading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [healthReminders, setHealthReminders] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // New notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [waterReminders, setWaterReminders] = useState(true);
  const [waterReminderInterval, setWaterReminderInterval] = useState("45");
  const [waterStartTime, setWaterStartTime] = useState("07:00");
  const [waterEndTime, setWaterEndTime] = useState("21:00");
  const [morningMotivation, setMorningMotivation] = useState(true);
  const [motivationTime, setMotivationTime] = useState("07:30");
  const [healthCheckReminder, setHealthCheckReminder] = useState(true);
  const [healthCheckTime, setHealthCheckTime] = useState("19:00");
  const [healthCheckDays, setHealthCheckDays] = useState([0, 3, 6]); // Sunday, Wednesday, Saturday

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.settings?.notifications) {
        setTaskReminders(user.settings.notifications.tasks);
        setHealthReminders(user.settings.notifications.health);
        setBudgetAlerts(user.settings.notifications.finance);
      }
    }
  }, [user]);

  // Add a new useEffect to check notification permissions
  useEffect(() => {
    const checkNotifications = async () => {
      const hasPermission = await checkNotificationPermission();
      setNotificationsEnabled(hasPermission);
      
      if (hasPermission) {
        // Load saved notification settings from local storage if available
        const savedInterval = localStorage.getItem('water-reminder-interval');
        if (savedInterval) setWaterReminderInterval(savedInterval);
        
        const savedStartTime = localStorage.getItem('water-reminder-start');
        if (savedStartTime) setWaterStartTime(savedStartTime);
        
        const savedEndTime = localStorage.getItem('water-reminder-end');
        if (savedEndTime) setWaterEndTime(savedEndTime);
        
        const savedMotivationTime = localStorage.getItem('motivation-time');
        if (savedMotivationTime) setMotivationTime(savedMotivationTime);
        
        const savedHealthTime = localStorage.getItem('health-check-time');
        if (savedHealthTime) setHealthCheckTime(savedHealthTime);
      }
    };
    
    checkNotifications();
  }, []);

  // Handle notification permission request
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted) {
      toast.success("Notifications enabled successfully");
      
      // Enable default notifications
      if (waterReminders) {
        scheduleWaterReminders(parseInt(waterReminderInterval), waterStartTime, waterEndTime);
      }
      
      if (morningMotivation) {
        scheduleMorningMotivation(motivationTime);
      }
      
      if (healthCheckReminder) {
        scheduleHealthCheckReminder(healthCheckTime, healthCheckDays);
      }
    } else {
      toast.error("Notification permission denied");
    }
  };
  
  // Handle water reminder settings change
  const handleWaterReminderChange = (checked: boolean) => {
    setWaterReminders(checked);
    
    if (checked && notificationsEnabled) {
      scheduleWaterReminders(parseInt(waterReminderInterval), waterStartTime, waterEndTime);
      toast.success("Water reminders enabled");
    } else {
      toggleNotification('water-reminder', false);
      toast.info("Water reminders disabled");
    }
  };
  
  // Handle water reminder interval change
  const handleIntervalChange = (value: string) => {
    setWaterReminderInterval(value);
    localStorage.setItem('water-reminder-interval', value);
    
    if (waterReminders && notificationsEnabled) {
      scheduleWaterReminders(parseInt(value), waterStartTime, waterEndTime);
      toast.success(`Water reminder interval set to ${value} minutes`);
    }
  };
  
  // Handle water reminder time range change
  const handleWaterTimeChange = (start: string, end: string) => {
    setWaterStartTime(start);
    setWaterEndTime(end);
    localStorage.setItem('water-reminder-start', start);
    localStorage.setItem('water-reminder-end', end);
    
    if (waterReminders && notificationsEnabled) {
      scheduleWaterReminders(parseInt(waterReminderInterval), start, end);
      toast.success(`Water reminder time range updated`);
    }
  };
  
  // Handle morning motivation change
  const handleMorningMotivationChange = (checked: boolean) => {
    setMorningMotivation(checked);
    
    if (checked && notificationsEnabled) {
      scheduleMorningMotivation(motivationTime);
      toast.success("Morning motivation enabled");
    } else {
      toggleNotification('morning-motivation', false);
      toast.info("Morning motivation disabled");
    }
  };
  
  // Handle motivation time change
  const handleMotivationTimeChange = (time: string) => {
    setMotivationTime(time);
    localStorage.setItem('motivation-time', time);
    
    if (morningMotivation && notificationsEnabled) {
      scheduleMorningMotivation(time);
      toast.success(`Morning motivation time set to ${time}`);
    }
  };
  
  // Handle health check reminder change
  const handleHealthCheckChange = (checked: boolean) => {
    setHealthCheckReminder(checked);
    
    if (checked && notificationsEnabled) {
      scheduleHealthCheckReminder(healthCheckTime, healthCheckDays);
      toast.success("Health check reminders enabled");
    } else {
      toggleNotification('health-check', false);
      toast.info("Health check reminders disabled");
    }
  };
  
  // Handle health check time change
  const handleHealthCheckTimeChange = (time: string) => {
    setHealthCheckTime(time);
    localStorage.setItem('health-check-time', time);
    
    if (healthCheckReminder && notificationsEnabled) {
      scheduleHealthCheckReminder(time, healthCheckDays);
      toast.success(`Health check reminder time set to ${time}`);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await updateUser({ 
        name, 
        email,
        settings: {
          theme: user?.settings?.theme || 'system',
          notifications: {
            tasks: taskReminders,
            health: healthReminders,
            finance: budgetAlerts
          }
        }
      });
      
      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-24 w-24 mb-4"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        <PageHeader
          heading="Settings"
          description="Manage your account preferences and application settings."
        />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="mr-2 h-4 w-4" />
              Privacy & Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="w-full md:w-auto">
                    <Edit className="mr-2 h-4 w-4" />
                    Change Avatar
                  </Button>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      defaultValue={user.name}
                      placeholder="Enter your full name"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                      placeholder="Enter your email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account and subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="account-type">Account Type</Label>
                  <Select defaultValue="premium">
                    <SelectTrigger id="account-type">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="font-medium">Payment Method</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visa ending in 4242 • Expires 04/25
                  </p>
                </div>

                <div className="rounded-md border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div className="font-medium">Billing Address</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    123 Main Street, Apt 4B, New York, NY 10001, USA
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Methods</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-notifications" className="flex-1">
                        Email Notifications
                      </Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="push-notifications" className="flex-1">
                        Push Notifications
                      </Label>
                      <span className="text-xs text-muted-foreground mr-2">
                        {notificationsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {notificationsEnabled ? (
                      <Switch
                        id="push-notifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    ) : (
                      <Button size="sm" variant="outline" onClick={handleEnableNotifications}>
                        Enable
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  
                  {/* Water Reminder Settings */}
                  <div className="space-y-4 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <Label htmlFor="water-reminders" className="flex-1">
                          Water Reminders
                        </Label>
                      </div>
                      <Switch
                        id="water-reminders"
                        checked={waterReminders}
                        onCheckedChange={handleWaterReminderChange}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                    
                    {waterReminders && (
                      <div className="pl-6 space-y-3">
                        <div className="grid gap-2">
                          <Label htmlFor="interval" className="text-sm">Reminder Interval</Label>
                          <Select 
                            value={waterReminderInterval} 
                            onValueChange={handleIntervalChange}
                            disabled={!notificationsEnabled}
                          >
                            <SelectTrigger id="interval" className="w-full">
                              <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">Every 30 minutes</SelectItem>
                              <SelectItem value="45">Every 45 minutes</SelectItem>
                              <SelectItem value="60">Every hour</SelectItem>
                              <SelectItem value="90">Every 1.5 hours</SelectItem>
                              <SelectItem value="120">Every 2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="start-time" className="text-sm">Start Time</Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={waterStartTime}
                              onChange={(e) => handleWaterTimeChange(e.target.value, waterEndTime)}
                              disabled={!notificationsEnabled}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="end-time" className="text-sm">End Time</Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={waterEndTime}
                              onChange={(e) => handleWaterTimeChange(waterStartTime, e.target.value)}
                              disabled={!notificationsEnabled}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Morning Motivation Settings */}
                  <div className="space-y-4 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <Label htmlFor="morning-motivation" className="flex-1">
                          Morning Motivation
                        </Label>
                      </div>
                      <Switch
                        id="morning-motivation"
                        checked={morningMotivation}
                        onCheckedChange={handleMorningMotivationChange}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                    
                    {morningMotivation && (
                      <div className="pl-6 space-y-3">
                        <div className="grid gap-2">
                          <Label htmlFor="motivation-time" className="text-sm">Time</Label>
                          <Input
                            id="motivation-time"
                            type="time"
                            value={motivationTime}
                            onChange={(e) => handleMotivationTimeChange(e.target.value)}
                            disabled={!notificationsEnabled}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Health Check Settings */}
                  <div className="space-y-4 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-violet-500" />
                        <Label htmlFor="health-check" className="flex-1">
                          Health Check Reminders
                        </Label>
                      </div>
                      <Switch
                        id="health-check"
                        checked={healthCheckReminder}
                        onCheckedChange={handleHealthCheckChange}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                    
                    {healthCheckReminder && (
                      <div className="pl-6 space-y-3">
                        <div className="grid gap-2">
                          <Label htmlFor="health-check-time" className="text-sm">Time</Label>
                          <Input
                            id="health-check-time"
                            type="time"
                            value={healthCheckTime}
                            onChange={(e) => handleHealthCheckTimeChange(e.target.value)}
                            disabled={!notificationsEnabled}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-sm">Days</Label>
                          <div className="flex flex-wrap gap-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                              <Button
                                key={day}
                                variant={healthCheckDays.includes(index) ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "w-10 p-0",
                                  healthCheckDays.includes(index) && "bg-violet-600"
                                )}
                                onClick={() => {
                                  const newDays = healthCheckDays.includes(index)
                                    ? healthCheckDays.filter(d => d !== index)
                                    : [...healthCheckDays, index].sort();
                                  setHealthCheckDays(newDays);
                                  if (healthCheckReminder && notificationsEnabled) {
                                    scheduleHealthCheckReminder(healthCheckTime, newDays);
                                  }
                                }}
                                disabled={!notificationsEnabled}
                              >
                                {day.charAt(0)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Keep existing notification types */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="task-reminders" className="flex-1">
                      Task Reminders
                    </Label>
                    <Switch
                      id="task-reminders"
                      checked={taskReminders}
                      onCheckedChange={setTaskReminders}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="budget-alerts" className="flex-1">
                      Budget Alerts
                    </Label>
                    <Switch
                      id="budget-alerts"
                      checked={budgetAlerts}
                      onCheckedChange={setBudgetAlerts}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekly-reports" className="flex-1">
                      Weekly Summary Reports
                    </Label>
                    <Switch
                      id="weekly-reports"
                      checked={weeklyReports}
                      onCheckedChange={setWeeklyReports}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai-suggestions" className="flex-1">
                      AI Suggestions & Insights
                    </Label>
                    <Switch
                      id="ai-suggestions"
                      checked={aiSuggestions}
                      onCheckedChange={setAiSuggestions}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Quiet Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Set a time period when notifications will be silenced
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        defaultValue="22:00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quiet-end">End Time</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        defaultValue="07:00"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interface Preferences</CardTitle>
                <CardDescription>
                  Customize the application appearance and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Select light or dark mode
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>

                  <Separator />

                  <div className="grid gap-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select defaultValue="12h">
                      <SelectTrigger id="time-format">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select defaultValue="mdy">
                      <SelectTrigger id="date-format">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Interface Settings</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module Preferences</CardTitle>
                <CardDescription>
                  Configure default settings for each module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-view">Default Dashboard View</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="default-view">
                        <SelectValue placeholder="Select default view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Overview</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                        <SelectItem value="health">Health Focus</SelectItem>
                        <SelectItem value="finance">Finance Focus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="jpy">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight-unit">Weight Unit</Label>
                    <Select defaultValue="kg">
                      <SelectTrigger id="weight-unit">
                        <SelectValue placeholder="Select weight unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="lb">Pounds (lb)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance-unit">Distance Unit</Label>
                    <Select defaultValue="km">
                      <SelectTrigger id="distance-unit">
                        <SelectValue placeholder="Select distance unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">Kilometers (km)</SelectItem>
                        <SelectItem value="mi">Miles (mi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Module Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-sharing" className="text-base">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anonymous data to be used for improving AI recommendations
                      </p>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={dataSharing}
                      onCheckedChange={setDataSharing}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base">Export Your Data</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Download all your personal data as a JSON or CSV file
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export as JSON
                      </Button>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base">Data Retention</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Control how long we store your data
                    </p>
                    <Select defaultValue="1year">
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 months</SelectItem>
                        <SelectItem value="6months">6 months</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="forever">Indefinitely</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Privacy Settings</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Change Password</Label>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password" className="text-sm">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password" className="text-sm">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password" className="text-sm">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button className="w-full md:w-auto">Update Password</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline">
                        <Lock className="mr-2 h-4 w-4" />
                        Enable 2FA
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-base">Active Sessions</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Manage devices logged into your account
                    </p>
                    <div className="rounded-md border divide-y">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Chrome on Windows</p>
                            <p className="text-xs text-muted-foreground">
                              Current session • Last active now
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-xs">Current</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Safari on iPhone</p>
                            <p className="text-xs text-muted-foreground">
                              New York, USA • Last active 2 hours ago
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            Logout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
