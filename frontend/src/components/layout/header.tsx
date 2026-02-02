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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 mb-2">
      <div className="container flex h-16 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <IconBrain className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent font-bold">
            QuizLive
          </span>
        </Link>

        <nav className="ml-12 hidden md:flex items-center gap-8 text-sm font-medium">
          {isAuthenticated && (
            <Link
              href="/host/dashboard"
              className="transition-all hover:text-primary text-muted-foreground"
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/play/browse"
              className="transition-all hover:text-primary text-muted-foreground"
            >
              Browse Quizzes
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-10 px-3 rounded-xl"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-border">
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block max-w-[120px] truncate font-medium">
                    {user.name}
                  </span>
                  <IconChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-2 py-3 border-b mb-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link
                    href="/user/profile"
                    className="cursor-pointer rounded-lg"
                  >
                    <IconUser className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/host/dashboard"
                    className="cursor-pointer rounded-lg"
                  >
                    <IconLayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/play/browse"
                    className="cursor-pointer rounded-lg"
                  >
                    <IconDeviceGamepad2 className="mr-2 h-4 w-4" />
                    Browse Quizzes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/user/history"
                    className="cursor-pointer rounded-lg"
                  >
                    <IconHistory className="mr-2 h-4 w-4" />
                    Quiz History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive rounded-lg"
                >
                  <IconLogout className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="rounded-xl">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
