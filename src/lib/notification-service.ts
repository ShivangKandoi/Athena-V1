import { getHealthProfile } from "./health-service";

type NotificationType = 
  | 'water' 
  | 'motivation' 
  | 'exercise' 
  | 'meal' 
  | 'task' 
  | 'finance'
  | 'health';

// Define a type for notification data payload
interface NotificationData {
  type?: NotificationType;
  url?: string;
  id?: string;
  [key: string]: unknown;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: NotificationData;
  timestamp?: number;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationSchedule {
  id: string;
  type: NotificationType;
  options: NotificationOptions;
  frequency: 'once' | 'daily' | 'interval';
  time?: string; // for daily notifications, format: "HH:MM"
  intervalMs?: number; // for interval notifications
  startTime?: string; // format: "HH:MM"
  endTime?: string; // format: "HH:MM"
  daysOfWeek?: number[]; // 0-6, Sunday is 0
  enabled: boolean;
}

// In-memory store for scheduled notifications
let scheduledNotifications: NotificationSchedule[] = [];

// Water reminder quotes for variety
const waterReminderMessages = [
  "Stay hydrated! Time for a glass of water 💧",
  "Water break! Your body will thank you later 💦",
  "Hydration check! Grab your water bottle 🚰",
  "It's water o'clock! Take a refreshing sip 🌊",
  "Friendly reminder: Drink some water now 💧",
  "Water is life! Take a moment to hydrate 💦",
  "Your plants get water, how about you? 🌱💧",
  "Hydration leads to success! Drink up 🏆",
  "Water break! Keep your energy levels up 💪",
  "Your brain is 75% water, keep it topped up! 🧠"
];

// Motivational morning quotes
const morningMotivationQuotes = [
  "Good morning! Today is a new beginning full of endless possibilities.",
  "Rise and shine! Your positive attitude determines your altitude today.",
  "Start your day with gratitude and watch how your perspective shifts.",
  "Today is your opportunity to build the tomorrow you want.",
  "Good morning! Remember that every accomplishment starts with the decision to try.",
  "Embrace the day with enthusiasm - your energy sets the tone for your success.",
  "Morning! The only limit to your potential today is the one you set in your mind.",
  "Begin today with a grateful heart and watch good things flow to you.",
  "Your future is created by what you do today, not tomorrow. Make it count!",
  "Good morning! Small daily improvements lead to stunning results over time."
];

// Check if notifications are supported and enabled
export async function checkNotificationPermission(): Promise<boolean> {
  // Check if the browser supports notifications
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser');
    return false;
  }

  // Check permission status
  let permission = Notification.permission;
  
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  
  return permission === 'granted';
}

// Request permission for notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Register service worker for background notifications
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// Send a notification immediately
export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  const hasPermission = await checkNotificationPermission();
  
  if (!hasPermission) {
    console.log('Notification permission not granted');
    return false;
  }

  try {
    // If we have a service worker, use it for the notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Send message to service worker to show notification
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        options
      });
      return true;
    } else {
      // Fallback to regular notification
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-96x96.png',
        tag: options.tag,
        data: options.data
      });
      return true;
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Schedule water reminders
export function scheduleWaterReminders(intervalMinutes: number = 45, startTime: string = "07:00", endTime: string = "21:00"): void {
  const waterReminderId = 'water-reminder';
  
  // Remove any existing water reminders
  scheduledNotifications = scheduledNotifications.filter(n => n.id !== waterReminderId);
  
  // Schedule new water reminder
  scheduledNotifications.push({
    id: waterReminderId,
    type: 'water',
    options: {
      title: 'Hydration Reminder',
      body: getRandomWaterMessage(),
      icon: '/icons/water-reminder.png',
      badge: '/icons/badge-96x96.png',
      tag: 'water-reminder',
      data: { type: 'water' }
    },
    frequency: 'interval',
    intervalMs: intervalMinutes * 60 * 1000,
    startTime,
    endTime,
    enabled: true
  });

  // Start the scheduler if it's not already running
  startNotificationScheduler();
}

// Schedule morning motivation notification
export function scheduleMorningMotivation(time: string = "07:30"): void {
  const motivationId = 'morning-motivation';
  
  // Remove any existing motivation reminders
  scheduledNotifications = scheduledNotifications.filter(n => n.id !== motivationId);
  
  // Schedule new motivation reminder
  scheduledNotifications.push({
    id: motivationId,
    type: 'motivation',
    options: {
      title: 'Good Morning!',
      body: getRandomMotivationQuote(),
      icon: '/icons/motivation.png',
      badge: '/icons/badge-96x96.png',
      tag: 'motivation',
      data: { type: 'motivation' }
    },
    frequency: 'daily',
    time,
    enabled: true
  });

  // Start the scheduler if it's not already running
  startNotificationScheduler();
}

// Schedule health check reminder
export function scheduleHealthCheckReminder(time: string = "19:00", daysOfWeek: number[] = [0, 3, 6]): void {
  const healthReminderId = 'health-check';
  
  // Remove any existing health reminders
  scheduledNotifications = scheduledNotifications.filter(n => n.id !== healthReminderId);
  
  // Schedule new health reminder
  scheduledNotifications.push({
    id: healthReminderId,
    type: 'exercise',
    options: {
      title: 'Health Check',
      body: 'Time to log your health metrics for the day! How are you feeling?',
      icon: '/icons/health-reminder.png',
      badge: '/icons/badge-96x96.png',
      tag: 'health-check',
      data: { type: 'health' },
      actions: [
        {
          action: 'open-health',
          title: 'Open Health'
        }
      ]
    },
    frequency: 'daily',
    time,
    daysOfWeek,
    enabled: true
  });

  // Start the scheduler if it's not already running
  startNotificationScheduler();
}

// Get a random water reminder message
function getRandomWaterMessage(): string {
  const randomIndex = Math.floor(Math.random() * waterReminderMessages.length);
  return waterReminderMessages[randomIndex];
}

// Get a random motivation quote
function getRandomMotivationQuote(): string {
  const randomIndex = Math.floor(Math.random() * morningMotivationQuotes.length);
  return morningMotivationQuotes[randomIndex];
}

// Check if a notification should be sent now based on schedule
function shouldSendNotification(schedule: NotificationSchedule): boolean {
  if (!schedule.enabled) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();
  
  // Check if it's within the day of week constraints (if any)
  if (schedule.daysOfWeek && !schedule.daysOfWeek.includes(currentDay)) {
    return false;
  }
  
  // Check time constraints for interval-based notifications
  if (schedule.frequency === 'interval' && (schedule.startTime || schedule.endTime)) {
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    if (schedule.startTime) {
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      if (currentTimeMinutes < startTimeMinutes) return false;
    }
    
    if (schedule.endTime) {
      const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
      const endTimeMinutes = endHour * 60 + endMinute;
      if (currentTimeMinutes > endTimeMinutes) return false;
    }
  }
  
  // For daily notifications, check if it's the right time
  if (schedule.frequency === 'daily' && schedule.time) {
    const [scheduledHour, scheduledMinute] = schedule.time.split(':').map(Number);
    
    // Check if the current time matches the scheduled time (within a 1-minute window)
    if (currentHour === scheduledHour && currentMinute === scheduledMinute) {
      return true;
    }
    
    return false;
  }
  
  return true;
}

// Initialize notification scheduler
let schedulerInterval: NodeJS.Timeout | null = null;

// Start scheduler to check for notifications that need to be sent
function startNotificationScheduler() {
  if (schedulerInterval) return; // Already running
  
  // Check for notifications every minute
  schedulerInterval = setInterval(() => {
    const now = Date.now();
    
    scheduledNotifications.forEach(schedule => {
      // For interval-based notifications, check the last sent time
      if (schedule.frequency === 'interval') {
        const lastSent = schedule.options.timestamp || 0;
        const intervalMs = schedule.intervalMs || 3600000; // Default 1 hour
        
        // If enough time has passed and it's within the time constraints
        if (now - lastSent >= intervalMs && shouldSendNotification(schedule)) {
          // Update the timestamp
          schedule.options.timestamp = now;
          
          // Send the notification
          sendNotification(schedule.options);
        }
      } 
      // For daily notifications, check if it's the right time
      else if (schedule.frequency === 'daily' && shouldSendNotification(schedule)) {
        // Send the notification
        sendNotification(schedule.options);
      }
    });
  }, 60000); // Check every minute
}

// Stop the notification scheduler
export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

// Enable or disable a specific notification
export function toggleNotification(id: string, enabled: boolean): boolean {
  const notificationIndex = scheduledNotifications.findIndex(n => n.id === id);
  
  if (notificationIndex >= 0) {
    scheduledNotifications[notificationIndex].enabled = enabled;
    return true;
  }
  
  return false;
}

// Get all scheduled notifications
export function getScheduledNotifications(): NotificationSchedule[] {
  return [...scheduledNotifications];
}

// Initialize default notifications
export function initializeDefaultNotifications(): void {
  // Water reminders (every 45 minutes from 7 AM to 9 PM)
  scheduleWaterReminders(45, "07:00", "21:00");
  
  // Morning motivation (daily at 7:30 AM)
  scheduleMorningMotivation("07:30");
  
  // Health check reminder (at 7 PM on Sunday, Wednesday, Saturday)
  scheduleHealthCheckReminder("19:00", [0, 3, 6]);
}

// Clear all notifications
export function clearAllNotifications(): void {
  scheduledNotifications = [];
  stopNotificationScheduler();
}

// Handle notification interactions
export function setupNotificationHandlers(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event.data;
      
      if (data && data.type === 'NOTIFICATION_CLICKED') {
        // Handle notification click based on the notification type
        const notificationType = data.notificationData?.type;
        
        switch (notificationType) {
          case 'water':
            // Open water tracking interface
            window.location.href = '/health?tab=water';
            break;
          case 'motivation':
            // Open home page
            window.location.href = '/';
            break;
          case 'health':
            // Open health page
            window.location.href = '/health';
            break;
          default:
            // Just go to home
            window.location.href = '/';
        }
      }
    });
  }
} 