"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { clearServiceWorkerCaches, unregisterServiceWorkers } from "@/lib/notification-service";

export default function ResetAppPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  
  const handleReset = async () => {
    setIsResetting(true);
    try {
      // First unregister service workers
      await unregisterServiceWorkers();
      
      // Then clear caches
      await clearServiceWorkerCaches();
      
      // Mark as complete
      setResetComplete(true);
    } catch (error) {
      console.error("Error resetting app:", error);
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleRefresh = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Application</CardTitle>
          <CardDescription>
            Use this page to reset the application if you're experiencing issues or you're stuck on a loading screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will clear all cached data and unregister service workers. Your account data will not be affected.
          </p>
          
          {resetComplete ? (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 text-sm mb-4">
              Reset complete! You can now safely return to the application.
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {resetComplete ? (
            <Button onClick={handleRefresh}>
              Return to App
            </Button>
          ) : (
            <Button 
              onClick={handleReset} 
              disabled={isResetting}
              variant="destructive"
            >
              {isResetting ? "Resetting..." : "Reset Application"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 