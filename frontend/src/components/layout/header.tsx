"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconBrain,
  IconUser,
  IconLogout,
  IconLayoutDashboard,
  IconDeviceGamepad2,
  IconHistory,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store";
import { setAccessToken } from "@/lib/api";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    setAccessToken(null);
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <IconBrain className="h-6 w-6" />
          <span className="hidden sm:inline-block">QuizLive</span>
        </Link>

        <nav className="ml-8 hidden md:flex items-center gap-6 text-sm">
          {isAuthenticated && user?.role === "HOST" && (
            <Link
              href="/host/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/play/browse"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Browse Quizzes
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/user/profile" className="cursor-pointer">
                    <IconUser className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === "HOST" && (
                  <DropdownMenuItem asChild>
                    <Link href="/host/dashboard" className="cursor-pointer">
                      <IconLayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/play/browse" className="cursor-pointer">
                    <IconDeviceGamepad2 className="mr-2 h-4 w-4" />
                    Browse Quizzes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/user/history" className="cursor-pointer">
                    <IconHistory className="mr-2 h-4 w-4" />
                    Quiz History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <IconLogout className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
