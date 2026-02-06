"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: number;
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimer({
  endTime,
  onComplete,
  className,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      return remaining;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const isLow = timeLeft <= 5;
  const percentage = (timeLeft / 30) * 100; // Assuming 30 second questions

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-col items-center justify-center">
        <div
          className={cn(
            "relative flex items-center justify-center w-20 h-20 rounded-full transition-colors",
            isLow ? "bg-red-500/10" : "bg-primary/10",
          )}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${(percentage / 100) * 226} 226`}
              className={cn(
                "transition-all duration-100",
                isLow ? "text-red-500" : "text-primary",
              )}
            />
          </svg>
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              isLow && "text-red-500 animate-pulse",
            )}
          >
            {timeLeft}
          </span>
        </div>
        <span className="mt-2 text-sm text-muted-foreground">seconds</span>
      </div>
    </div>
  );
}
