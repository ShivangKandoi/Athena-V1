"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarDaysIcon,
  ActivityIcon,
  WalletIcon,
  MessagesSquareIcon,
  Settings
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function MainNav() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: HomeIcon,
      active: pathname === "/"
    },
    {
      href: "/planner",
      label: "Daily Planner",
      icon: CalendarDaysIcon,
      active: pathname === "/planner"
    },
    {
      href: "/health",
      label: "Health & Fitness",
      icon: ActivityIcon,
      active: pathname === "/health"
    },
    {
      href: "/finance",
      label: "Finance",
      icon: WalletIcon,
      active: pathname === "/finance"
    },
    {
      href: "/assistant",
      label: "AI Assistant",
      icon: MessagesSquareIcon,
      active: pathname === "/assistant"
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings"
    }
  ];

  return (
    <div className="flex h-16 items-center border-b px-4">
      <div className="flex gap-6 md:gap-10">
        <Link href="/" className="hidden items-center space-x-2 md:flex">
          <span className="font-bold text-xl text-primary">ATHENA</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <route.icon className="mr-2 h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
      </div>
    </div>
  );
}
