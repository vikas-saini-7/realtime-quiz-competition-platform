"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { IconHistory, IconTrophy, IconExternalLink } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyAttempts } from "@/hooks";

export default function HistoryPage() {
  const { data: attempts, isLoading, error } = useMyAttempts();

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Failed to load history</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-gray-500/10 p-4 px-8 rounded-lg">
      <div>
        <h1 className="text-2xl font-bold">Quiz History</h1>
        <p className="text-muted-foreground">
          View your past quiz attempts and scores
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconHistory className="h-5 w-5" />
            Past Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : attempts && attempts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">
                      Quiz #{attempt.quizId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconTrophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">
                          {attempt.totalScore.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={attempt.completedAt ? "default" : "secondary"}
                      >
                        {attempt.completedAt ? "Completed" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(attempt.joinedAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/play/result/${attempt.quizId}`}>
                          <IconExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <IconHistory className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No quiz history</h2>
              <p className="text-muted-foreground text-center max-w-md">
                You haven&apos;t participated in any quizzes yet. Browse live
                quizzes to get started!
              </p>
              <Button asChild>
                <Link href="/play/browse">Browse Quizzes</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
