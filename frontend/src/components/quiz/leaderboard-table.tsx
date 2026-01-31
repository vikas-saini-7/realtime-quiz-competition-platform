"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconTrophy, IconMedal } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

export function LeaderboardTable({
  entries,
  currentUserId,
  className,
}: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <IconTrophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <IconMedal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <IconMedal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-medium">{rank}</span>;
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No participants yet
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right w-24">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.userId}
              className={cn(
                entry.userId === currentUserId && "bg-primary/5 font-medium"
              )}
            >
              <TableCell className="font-medium">
                <div className="flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{entry.userName}</span>
                  {entry.userId === currentUserId && (
                    <span className="text-xs text-primary">(You)</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums font-semibold">
                {entry.score.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
