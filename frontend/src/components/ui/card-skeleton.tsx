import { Card, CardContent, CardHeader } from "./card";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  className?: string;
  showHeader?: boolean;
  linesCount?: number;
}

export function CardSkeleton({
  className,
  showHeader = true,
  linesCount = 3,
}: CardSkeletonProps) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
      )}
      <CardContent className={cn("space-y-3", !showHeader && "pt-6")}>
        {Array.from({ length: linesCount }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", i === linesCount - 1 ? "w-2/3" : "w-full")}
          />
        ))}
      </CardContent>
    </Card>
  );
}
