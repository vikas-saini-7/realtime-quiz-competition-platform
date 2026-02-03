"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
      <LoadingSpinner size="xl" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">{message}</h2>
        {subMessage && <p className="text-muted-foreground">{subMessage}</p>}
      </div>
    </div>
  );
}
