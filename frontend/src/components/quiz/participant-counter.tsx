"use client";

import { IconUsers } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ParticipantCounterProps {
  count: number;
  className?: string;
}

export function ParticipantCounter({ count, className }: ParticipantCounterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary",
        className
      )}
    >
      <IconUsers className="h-5 w-5 text-muted-foreground" />
      <span className="font-semibold tabular-nums">{count}</span>
      <span className="text-sm text-muted-foreground">
        {count === 1 ? "participant" : "participants"}
      </span>
    </div>
  );
}
