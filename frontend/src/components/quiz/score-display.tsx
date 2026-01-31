"use client";

import { cn } from "@/lib/utils";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface ScoreDisplayProps {
  score: number;
  lastChange?: number;
  className?: string;
}

export function ScoreDisplay({
  score,
  lastChange,
  className,
}: ScoreDisplayProps) {
  const showChange = lastChange !== undefined && lastChange !== 0;
  const isPositive = lastChange && lastChange > 0;

  return (
    <div className={cn("text-center", className)}>
      <p className="text-sm text-muted-foreground mb-1">Your Score</p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-4xl font-bold tabular-nums">
          {score.toLocaleString()}
        </span>
        {showChange && (
          <span
            className={cn(
              "flex items-center text-sm font-medium",
              isPositive ? "text-green-500" : "text-red-500",
            )}
          >
            {isPositive ? (
              <IconTrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <IconTrendingDown className="h-4 w-4 mr-1" />
            )}
            {isPositive ? "+" : ""}
            {lastChange}
          </span>
        )}
      </div>
    </div>
  );
}
