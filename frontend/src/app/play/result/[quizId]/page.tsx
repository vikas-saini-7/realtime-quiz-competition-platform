"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { IconTrophy, IconHome, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardTable, ScoreDisplay } from "@/components/quiz";
import { useQuizStore, useAuthStore } from "@/store";
import { useEffect } from "react";

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const { user } = useAuthStore();
  const { quizTitle, totalScore, leaderboard, status, reset } = useQuizStore();

  // Find user's rank
  const userEntry = leaderboard.find((entry) => entry.userId === user?.id);
  const userRank = userEntry?.rank || 0;

  // Handle cleanup
  const handlePlayAgain = () => {
    reset();
    router.push("/play/browse");
  };

  // Redirect if no quiz data
  useEffect(() => {
    if (status === "idle") {
      router.push("/play/browse");
    }
  }, [status, router]);

  const getRankMessage = () => {
    if (userRank === 1) return "🏆 Congratulations! You won!";
    if (userRank === 2) return "🥈 Great job! Second place!";
    if (userRank === 3) return "🥉 Well done! Third place!";
    if (userRank <= 10) return `Top 10! You ranked #${userRank}`;
    return `You ranked #${userRank}`;
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{quizTitle || "Quiz"}</h1>
        <p className="text-muted-foreground">Quiz Completed!</p>
      </div>

      {/* Rank Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-8 text-center space-y-4">
          <div className="flex justify-center">
            {userRank <= 3 ? (
              <IconTrophy
                className={`h-16 w-16 ${
                  userRank === 1
                    ? "text-yellow-500"
                    : userRank === 2
                    ? "text-gray-400"
                    : "text-amber-600"
                }`}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold">#{userRank}</span>
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold">{getRankMessage()}</h2>
          <ScoreDisplay score={totalScore} className="py-4" />
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Final Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handlePlayAgain} className="flex-1">
          <IconRefresh className="h-4 w-4 mr-2" />
          Play Another Quiz
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/user/history">
            <IconHome className="h-4 w-4 mr-2" />
            View History
          </Link>
        </Button>
      </div>
    </div>
  );
}
