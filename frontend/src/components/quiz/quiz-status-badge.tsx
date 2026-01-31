"use client";

import { Badge } from "@/components/ui/badge";
import type { QuizStatus } from "@/types";
import { cn } from "@/lib/utils";

interface QuizStatusBadgeProps {
  status: QuizStatus;
  className?: string;
}

const statusConfig: Record<QuizStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  LIVE: {
    label: "Live",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export function QuizStatusBadge({ status, className }: QuizStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(config.className, "font-medium", className)}
    >
      {status === "LIVE" && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      )}
      {config.label}
    </Badge>
  );
}
