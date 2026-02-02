"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconSettings,
  IconChartBar,
  IconUser,
  IconHistory,
  IconDeviceGamepad2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/host/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/host/analytics",
    icon: IconChartBar,
  },
  {
    title: "Browse Quizzes",
    href: "/play/browse",
    icon: IconDeviceGamepad2,
  },
  {
    title: "Quiz History",
    href: "/user/history",
    icon: IconHistory,
  },
  {
    title: "Profile",
    href: "/user/profile",
    icon: IconUser,
  },
  {
    title: "Settings",
    href: "/host/settings",
    icon: IconSettings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col">
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
