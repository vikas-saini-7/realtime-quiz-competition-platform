"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconBrain,
  IconUser,
  IconLogout,
  IconLayoutDashboard,
  IconHistory,
  IconChevronDown,
  IconPlus,
  IconHash,
  IconMoon,
  IconSun,
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
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const isOnDashboard = pathname?.startsWith("/host");

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

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
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-background/80 dark:backdrop-blur-xl  mb-2">
      <div className="container flex h-16 items-center justify-between px-6 max-w-[1600px] mx-auto">
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

        {isAuthenticated && (
          <div className="ml-8 hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 transition-all hover:text-primary text-muted-foreground text-sm font-medium">
                  <IconHash className="h-4 w-4" />
                  <span>Join with Code</span>
                  <IconChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2">
                <DropdownMenuItem asChild>
                  <Link href="/join" className="cursor-pointer rounded-lg">
                    <IconHash className="mr-2 h-4 w-4" />
                    Join with Code
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/host/dashboard"
                    className="cursor-pointer rounded-lg"
                  >
                    <IconLayoutDashboard className="mr-2 h-4 w-4" />
                    Host Quiz Competition
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {isAuthenticated && user ? (
            <>
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
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
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
                      href="/user/history"
                      className="cursor-pointer rounded-lg"
                    >
                      <IconHistory className="mr-2 h-4 w-4" />
                      My History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={toggleTheme}
                    className="cursor-pointer rounded-lg"
                  >
                    {theme === "light" ? (
                      <IconMoon className="mr-2 h-4 w-4" />
                    ) : (
                      <IconSun className="mr-2 h-4 w-4" />
                    )}
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/host/dashboard"
                      className="cursor-pointer rounded-lg"
                    >
                      <IconLayoutDashboard className="mr-2 h-4 w-4" />
                      Host Quiz Competition
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
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="rounded-xl">
                <Link href="/join">
                  <IconHash className="h-4 w-4 mr-2" />
                  Join Quiz
                </Link>
              </Button>
              <Button variant="ghost" asChild className="rounded-xl">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link href="/auth/register">Create Quiz</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
