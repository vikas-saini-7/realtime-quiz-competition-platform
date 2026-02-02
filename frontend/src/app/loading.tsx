import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border border-primary border-t-transparent" />
        <span className="text-lg font-medium">Loading...</span>
      </div>
      <div className="w-64 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
