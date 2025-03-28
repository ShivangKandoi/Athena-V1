"use client";

import * as React from "react";
import { BottomNav } from "@/components/bottom-nav";
import { UserProfile } from "@/components/user-profile";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-16">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-background/90 backdrop-blur-xl shadow-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent text-xl font-extrabold tracking-tight animate-gradient">ATHENA</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-full h-9 w-9 transition-all duration-200 ease-in-out"
              >
                <Bell className="h-[18px] w-[18px]" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-[10px] ring-2 ring-background animate-pulse">3</Badge>
              </Button>
            </div>
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>
      </header>
      <main className={cn("flex-1 px-4 py-4", className)}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
