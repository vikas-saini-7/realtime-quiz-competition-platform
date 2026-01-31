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
      if (user.role === "HOST") {
        router.replace("/host/dashboard");
      } else {
        router.replace("/play/browse");
      }
      return;
    }

    // Role-based access control
    if (isAuthenticated && user) {
      if (pathname.startsWith("/host") && user.role !== "HOST") {
        router.replace("/play/browse");
        return;
      }
      // Optionally, restrict /play to USERs only (if needed)
      // if (pathname.startsWith("/play") && user.role !== "USER") {
      //   router.replace("/host/dashboard");
      //   return;
      // }
    }
  }, [isAuthenticated, pathname, router, isHydrated, user]);

  // Show nothing while hydrating to prevent flash
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
