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
  Settings,
  Menu
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

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
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <div className="px-7">
            <Link href="/" className="flex items-center pt-2 pb-6">
              <span className="font-bold text-2xl text-primary">ATHENA</span>
            </Link>
          </div>
          <nav className="flex flex-col gap-4 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-lg font-medium transition-colors hover:text-primary rounded-md",
                  route.active
                    ? "text-primary bg-muted"
                    : "text-muted-foreground hover:bg-transparent"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
