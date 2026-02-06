"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconTrophy } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Separator } from "@/components/ui/separator";
import { LeaderboardTable, QuizStatusBadge } from "@/components/quiz";
import { useQuiz, useLeaderboard, useAttemptsByQuiz } from "@/hooks";

export default function QuizResultsPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const { data: quiz, isLoading: quizLoading } = useQuiz(quizId);
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard(
    quizId,
    50,
  );
  const { data: attempts, isLoading: attemptsLoading } =
    useAttemptsByQuiz(quizId);

  const isLoading = quizLoading || leaderboardLoading || attemptsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton className="h-10 w-64" showHeader={false} linesCount={1} />
        <div className="grid gap-6 lg:grid-cols-3">
          <CardSkeleton className="h-32" />
          <CardSkeleton className="h-32" />
          <CardSkeleton className="h-32" />
        </div>
        <CardSkeleton className="h-96" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Quiz not found</p>
        <Button asChild>
          <Link href="/host/quizzes">Back to Quizzes</Link>
        </Button>
      </div>
    );
  }

  const totalParticipants = attempts?.length || 0;
  const averageScore =
    attempts && attempts.length > 0
      ? Math.round(
          attempts.reduce((acc, a) => acc + a.totalScore, 0) / attempts.length,
        )
      : 0;
  const topScore = leaderboard?.[0]?.score || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/host/quizzes">
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <QuizStatusBadge status={quiz.status} />
          </div>
          <p className="text-muted-foreground">Quiz Results</p>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalParticipants}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageScore}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IconTrophy className="h-6 w-6 text-yellow-500" />
              <p className="text-3xl font-bold">{topScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Final Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={leaderboard || []} />
        </CardContent>
      </Card>
    </div>
  );
}
