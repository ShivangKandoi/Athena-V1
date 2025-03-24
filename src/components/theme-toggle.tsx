"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-full h-9 w-9 transition-all duration-200 ease-in-out"
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="p-1.5 rounded-xl shadow-lg border-slate-200/80 dark:border-slate-800/80 w-36"
        sideOffset={8}
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`py-2 px-3 cursor-pointer rounded-lg flex items-center ${theme === 'light' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
        >
          <Sun className="h-4 w-4 mr-2.5 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`py-2 px-3 cursor-pointer rounded-lg flex items-center ${theme === 'dark' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
        >
          <Moon className="h-4 w-4 mr-2.5 text-indigo-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`py-2 px-3 cursor-pointer rounded-lg flex items-center ${theme === 'system' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
        >
          <Laptop className="h-4 w-4 mr-2.5 text-slate-500" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
