"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, UserCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <Avatar className="h-8 w-8 ring-2 ring-primary/10 shadow-sm">
        <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
          <User className="h-4 w-4 text-slate-400" />
        </AvatarFallback>
      </Avatar>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="text-xs font-medium">
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button size="sm" asChild className="text-xs font-medium bg-gradient-to-r from-violet-600 to-indigo-600 border-0 shadow-sm">
          <Link href="/auth/register">Register</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-all hover:ring-primary/30 shadow-sm">
            <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900 dark:to-indigo-900 text-primary text-sm font-semibold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-60 p-1.5 rounded-xl shadow-lg border-slate-200/80 dark:border-slate-800/80" 
        align="end" 
        forceMount 
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal py-3 pb-4">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="h-1 w-12 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full mt-1"></div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200/60 dark:bg-slate-800/60" />
        <DropdownMenuItem asChild className="py-2 px-3 cursor-pointer rounded-lg mt-1">
          <Link href="/profile" className="flex w-full items-center">
            <UserCircle className="mr-2.5 h-4 w-4 text-violet-500 dark:text-violet-400" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-2 px-3 cursor-pointer rounded-lg">
          <Link href="/settings" className="flex w-full items-center">
            <Settings className="mr-2.5 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200/60 dark:bg-slate-800/60" />
        <DropdownMenuItem 
          className="text-red-600 dark:text-red-400 py-2 px-3 cursor-pointer rounded-lg mb-1"
          onClick={handleLogout}
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
