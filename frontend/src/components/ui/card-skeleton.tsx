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
  linesCount = 2,
}: CardSkeletonProps) {
  return (
    <Card className={cn("rounded-2xl bg-muted/20 dark:bg-muted/10", className)}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
      )}
      <CardContent className={cn("space-y-2", !showHeader && "pt-6")}>
        {Array.from({ length: linesCount }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
