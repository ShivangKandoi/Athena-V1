"use client";

import { useEffect, useState } from 'react';
import { checkNotificationPermission, requestNotificationPermission, registerServiceWorker, initializeDefaultNotifications, setupNotificationHandlers } from '@/lib/notification-service';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NotificationsInit() {
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const initNotifications = async () => {
      // Check if we've already asked for permission
      const alreadyAsked = localStorage.getItem('notification-permission-asked');
      
      // Get current permission status
      const hasPermission = await checkNotificationPermission();
      setPermissionStatus(Notification.permission);
      
      if (hasPermission) {
        // Initialize notifications if permission is granted
        await setupServiceWorker();
        initializeDefaultNotifications();
        setupNotificationHandlers();
        
        toast({
          title: "Notifications enabled",
          description: "You'll receive water reminders every 45 minutes and other helpful alerts",
          duration: 5000,
        });
      } else if (!alreadyAsked && Notification.permission === 'default') {
        // Show our custom prompt if we haven't asked before
        setShowPrompt(true);
      }
    };
    
    initNotifications();
    
    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, [toast]);
  
  const setupServiceWorker = async () => {
    try {
      const registration = await registerServiceWorker();
      return !!registration;
    } catch (error) {
      console.error('Failed to register service worker:', error);
      return false;
    }
  };
  
  const handleEnableNotifications = async () => {
    localStorage.setItem('notification-permission-asked', 'true');
    
    // Request browser permission
    const granted = await requestNotificationPermission();
    setPermissionStatus(Notification.permission);
    
    if (granted) {
      // Register service worker and initialize notifications
      await setupServiceWorker();
      initializeDefaultNotifications();
      setupNotificationHandlers();
      
      toast({
        title: "Notifications enabled",
        description: "You'll receive water reminders every 45 minutes and other helpful alerts",
        duration: 5000,
      });
    } else {
      toast({
        title: "Notifications disabled",
        description: "You won't receive reminders and alerts. You can enable them later in settings.",
        variant: "destructive",
        duration: 5000,
      });
    }
    
    setShowPrompt(false);
  };
  
  const handleDismiss = () => {
    localStorage.setItem('notification-permission-asked', 'true');
    setShowPrompt(false);
    
    toast({
      title: "Notifications disabled",
      description: "You won't receive reminders and alerts. You can enable them later in settings.",
      variant: "destructive",
      duration: 5000,
    });
  };
  
  // No need to render anything if not showing the prompt
  if (!showPrompt) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 right-4 left-4 md:left-auto md:w-80 bg-card shadow-lg rounded-lg p-4 border border-border z-50 animate-in fade-in slide-in-from-bottom-10">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-violet-100 dark:bg-violet-900/50 p-2 rounded-full">
            <Bell className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">Enable notifications</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Get water reminders, morning motivational quotes, and health check reminders to stay on track with your goals.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <BellOff className="h-4 w-4 mr-1" />
            <span>No thanks</span>
          </Button>
          <Button size="sm" onClick={handleEnableNotifications}>
            <Bell className="h-4 w-4 mr-1" />
            <span>Enable</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 