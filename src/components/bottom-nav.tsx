"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarCheck,
  Activity,
  Wallet,
  MessageSquare,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Ensure hydration completes before rendering animated elements
  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/"
    },
    {
      href: "/planner",
      label: "Planner",
      icon: CalendarCheck,
      active: pathname === "/planner"
    },
    {
      href: "/health",
      label: "Health",
      icon: Activity,
      active: pathname === "/health"
    },
    {
      href: "/finance",
      label: "Finance",
      icon: Wallet,
      active: pathname === "/finance"
    },
    {
      href: "/assistant",
      label: "Assistant",
      icon: MessageSquare,
      active: pathname === "/assistant"
    }
  ];

  // Find the active route for animation purposes
  const activeIndex = routes.findIndex(route => route.active);

  if (!mounted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-slate-200/80 dark:border-slate-800/80 bg-background/90 backdrop-blur-xl"></div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background with glass morphism effect */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"></div>
      
      {/* Main nav container */}
      <div className="relative h-16 bg-background shadow-lg dark:shadow-slate-900/30 border-x-0 border-b-0 border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        {/* Active indicator that slides */}
        {activeIndex >= 0 && (
          <div 
            className="absolute h-1 w-12 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full top-0 mx-auto transition-all duration-300 ease-spring"
            style={{ 
              left: `calc(${(activeIndex * 20) + 10}% - 24px)`,
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }}
          />
        )}

        {/* The pill-shaped highlight for the active tab */}
        {activeIndex >= 0 && (
          <div 
            className="absolute bottom-1.5 rounded-full transition-all duration-300 ease-spring h-12 border border-slate-200/50 dark:border-slate-700/50 bg-slate-100/80 dark:bg-slate-800/80"
            style={{ 
              width: '72px',
              left: `calc(${(activeIndex * 20) + 10}% - 36px)`,
              opacity: 0.8
            }}
          />
        )}
        
        <nav className="flex items-center justify-around h-full px-1">
          {routes.map((route, index) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-16 z-10 transition-all duration-200",
                route.active ? "transform-gpu" : "text-muted-foreground"
              )}
              aria-current={route.active ? "page" : undefined}
            >
              <div className={cn(
                "flex items-center justify-center transition-all duration-200 ease-out",
                route.active && "transform-gpu scale-105"
              )}>
                <route.icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  route.active 
                    ? "text-primary filter drop-shadow-md" 
                    : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "mt-1 text-[10px] transition-all",
                route.active 
                  ? "font-semibold text-primary" 
                  : "font-medium text-muted-foreground"
              )}>
                {route.label}
              </span>
            </Link>
          ))}
        </nav>
        
        {/* Center action button (optional) */}
        {/* Uncomment to add a center floating action button
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-20">
          <button 
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transform transition-transform duration-200 hover:scale-110 active:scale-95"
            onClick={() => {/* Add your action here *//*}}
          >
            <PlusCircle className="h-6 w-6" />
          </button>
        </div>
        */}
      </div>
    </div>
  );
}

// Add this to your tailwind.config.js under extend.keyframes:
// spring: {
//   '0%': { transform: 'translateX(0) scale(1)' },
//   '25%': { transform: 'translateX(0) scale(1.05)' },
//   '50%': { transform: 'translateX(0) scale(0.95)' },
//   '75%': { transform: 'translateX(0) scale(1.02)' },
//   '100%': { transform: 'translateX(0) scale(1)' },
// }
// 
// And under extend.animation:
// 'ease-spring': 'spring 0.5s ease-out',
