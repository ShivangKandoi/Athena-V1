"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarCheck,
  Activity,
  Wallet,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 dark:border-slate-800/80 bg-background/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_-1px_8px_rgba(0,0,0,0.08)]">
      <nav className="flex items-center justify-between px-1.5">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-1.5 px-1 text-xs font-medium transition-colors relative",
              route.active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center rounded-full w-8 h-8 mb-0.5 transition-all duration-200",
              route.active 
                ? "bg-primary/10 text-primary scale-110" 
                : "text-muted-foreground hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
            )}>
              <route.icon className={cn(
                "h-4 w-4",
                route.active ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className={cn(
              "text-[9px] transition-colors",
              route.active ? "font-semibold" : "font-medium"
            )}>
              {route.label}
            </span>
            {route.active && (
              <div className="absolute -bottom-[1px] w-8 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-t-md" />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
