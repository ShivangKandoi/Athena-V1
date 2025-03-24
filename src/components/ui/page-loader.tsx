"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
  absolute?: boolean;
}

export function PageLoader({
  fullScreen = false,
  message = "Loading...",
  className,
  absolute = true,
}: PageLoaderProps) {
  const [progress, setProgress] = useState(0);
  
  // Simulated progress for visual feedback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 90) {
        setProgress(prev => {
          // Gradually slow down the progress to simulate realistic loading
          const increment = Math.max(1, 15 * (1 - prev / 100));
          return Math.min(90, prev + increment);
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-background",
        fullScreen && absolute ? "absolute inset-0 z-50" : "",
        fullScreen && !absolute ? "h-screen w-full z-50" : "",
        !fullScreen ? "w-full py-12" : "",
        className
      )}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Athena Logo/Name */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
            ATHENA
          </h2>
          <p className="text-sm text-muted-foreground mt-2">{message}</p>
        </div>

        {/* Animated Loader */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-t-2 border-violet-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-violet-600 animate-pulse" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-violet-600 to-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
