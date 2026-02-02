"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { setAccessToken } from "@/lib/api";

const publicPaths = ["/", "/auth/login", "/auth/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, accessToken, user, clearAuth } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate auth state from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync accessToken with api module
  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
  }, [accessToken]);

  // Route protection and redirection
  useEffect(() => {
    if (!isHydrated) return;

    const isPublicPath = publicPaths.includes(pathname);

    // If not authenticated and not on a public path, redirect to login
    if (!isAuthenticated && !isPublicPath) {
      router.push("/auth/login");
      return;
    }

    // If authenticated and on login/register, redirect to dashboard
    if (
      isAuthenticated &&
      user &&
      ["/auth/login", "/auth/register"].includes(pathname)
    ) {
      router.replace("/host/dashboard");
      return;
    }

    // All authenticated users can access all routes
  }, [isAuthenticated, pathname, router, isHydrated, user]);

  // Show nothing while hydrating to prevent flash
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
