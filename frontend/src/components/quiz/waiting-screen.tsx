"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface WaitingScreenProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export function WaitingScreen({
  message = "Waiting for host to start...",
  subMessage,
  className,
}: WaitingScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] gap-6",
        className,
      )}
    >
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-secondary animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <IconLoader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">{message}</h2>
        {subMessage && <p className="text-muted-foreground">{subMessage}</p>}
      </div>
    </div>
  );
}
