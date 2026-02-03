"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { IconCheck, IconX, IconTrophy } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CountdownTimer,
  ScoreDisplay,
  LeaderboardTable,
  WaitingScreen,
  ParticipantCounter,
} from "@/components/quiz";
import { useSocket, useParticipantActions } from "@/hooks/use-socket";
import { useQuizStore, useAuthStore } from "@/store";
import { useQuizByCode } from "@/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OptionLetter } from "@/types";

export default function PlayQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizCode = params.code as string;

  const { data: quiz, isLoading: isLoadingQuiz } = useQuizByCode(quizCode);
  const { isConnected } = useSocket();
  const { join, submitAnswer } = useParticipantActions();
  const { user } = useAuthStore();

  const {
    status,
    quizId,
    quizTitle,
    currentQuestion,
    questionIndex,
    totalQuestions,
    questionEndTime,
    selectedOption,
    hasAnswered,
    lastAnswerResult,
    correctOption,
    totalScore,
    leaderboard,
    participantCount,
  } = useQuizStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Auto-rejoin if status is idle but we have the quiz
  useEffect(() => {
    if (!quiz?.id || !isConnected || status !== "idle" || isJoining) return;

    const autoJoin = async () => {
      setIsJoining(true);
      try {
        await join(quiz.id);
        console.log("[PlayQuiz] Auto-joined quiz successfully");
      } catch (error) {
        console.error("[PlayQuiz] Auto-join failed:", error);
        // Only redirect to join page if auto-join fails
        router.push(`/join/${quizCode}`);
      } finally {
        setIsJoining(false);
      }
    };

    autoJoin();
  }, [quiz?.id, isConnected, status, isJoining, join, quizCode, router]);

  const handleSelectOption = async (option: OptionLetter) => {
    if (hasAnswered || !currentQuestion || isSubmitting || !quiz?.id) return;

    console.log("[PlayQuiz] Submitting answer:", {
      option,
      questionId: currentQuestion.id,
      quizId: quiz.id,
      hasAnswered,
    });

    setIsSubmitting(true);
    try {
      const result = await submitAnswer(quiz.id, currentQuestion.id, option);
      console.log("[PlayQuiz] Answer submitted successfully:", result);
    } catch (error) {
      console.error("[PlayQuiz] Failed to submit answer:", error);
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionResult = (option: OptionLetter): boolean | null => {
    if (!correctOption) return null;
    if (option === correctOption) return true;
    if (option === selectedOption && option !== correctOption) return false;
    return null;
  };

  if (isLoadingQuiz || isJoining) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <WaitingScreen message={isJoining ? "Joining quiz..." : "Loading..."} />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Quiz not found</p>
          <Button asChild>
            <Link href="/join">Enter Quiz Code</Link>
          </Button>
        </div>
      </div>
    );
  }

  // LOBBY: Waiting for quiz to start
  if (status === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">Waiting for host to start</p>
          </div>

          <Card>
            <CardContent className="py-12">
              <WaitingScreen
                message="Get ready..."
                subMessage="The quiz will begin shortly"
              />
              <div className="mt-8 flex justify-center">
                <ParticipantCounter count={participantCount} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // BETWEEN QUESTIONS: Show results
  if (status === "between_questions") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold">
              {quizTitle || quiz.title}
            </h1>
            <div className="space-y-2">
              <Progress
                value={((questionIndex + 1) / totalQuestions) * 100}
                className="h-3"
              />
              <p className="text-sm text-muted-foreground">
                Question {questionIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                {lastAnswerResult?.isCorrect ? (
                  <IconCheck className="h-8 w-8 text-green-500" />
                ) : (
                  <IconX className="h-8 w-8 text-red-500" />
                )}
                <span className="text-2xl">
                  {lastAnswerResult?.isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <ScoreDisplay score={totalScore} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={leaderboard}
                currentUserId={user?.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // FINISHED: Show final results
  if (status === "finished") {
    const userRank =
      leaderboard.findIndex((entry) => entry.userId === user?.id) + 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-8">
                <IconTrophy className="h-20 w-20 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Quiz Complete!
              </h1>
              <p className="text-xl text-muted-foreground">{quiz.title}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-5xl font-bold text-primary">
                    {totalScore}
                  </p>
                  <p className="text-muted-foreground">Total Score</p>
                </div>
                {userRank > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-semibold">Rank #{userRank}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-2">
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-3xl font-bold">{totalQuestions}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-3xl font-bold">{participantCount}</p>
                    <p className="text-xs text-muted-foreground">Players</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Final Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={leaderboard}
                currentUserId={user?.id}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/join">Join Another Quiz</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE: Show current question
  if (status === "active" && currentQuestion) {
    const progress = ((questionIndex + 1) / totalQuestions) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {quizTitle || quiz.title}
                </h1>
                <Badge variant="secondary" className="text-sm">
                  Live
                </Badge>
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-3 rounded-full" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Question {questionIndex + 1} of {totalQuestions}
                  </span>
                  <ScoreDisplay score={totalScore} />
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="space-y-8">
              {/* Question Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <CountdownTimer endTime={questionEndTime || Date.now()} />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed px-4">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Options */}
              <div className="grid gap-4 max-w-3xl mx-auto">
                {["A", "B", "C", "D"].map((option) => {
                  const optionLetter = option as OptionLetter;
                  const result = getOptionResult(optionLetter);
                  const isSelected = selectedOption === optionLetter;
                  const optionKey =
                    `option${option}` as keyof typeof currentQuestion;

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(optionLetter)}
                      disabled={hasAnswered || isSubmitting}
                      className={cn(
                        "group relative w-full p-6 md:p-8 rounded-2xl border-2 text-left transition-all",
                        "hover:scale-[1.02] active:scale-[0.98]",
                        !hasAnswered &&
                          "hover:border-primary hover:bg-primary/5 hover:shadow-lg",
                        isSelected &&
                          !hasAnswered &&
                          "border-primary bg-primary/10 shadow-lg",
                        result === true &&
                          "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-lg",
                        result === false &&
                          "border-red-500 bg-red-50 dark:bg-red-950/30 shadow-lg",
                        hasAnswered && result === null && "opacity-60",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg shrink-0 transition-colors",
                            !hasAnswered &&
                              "bg-secondary text-secondary-foreground",
                            result === true && "bg-green-500 text-white",
                            result === false && "bg-red-500 text-white",
                            hasAnswered &&
                              result === null &&
                              "bg-secondary/50 text-secondary-foreground/50",
                          )}
                        >
                          {option}
                        </div>
                        <span className="flex-1 text-lg md:text-xl font-medium">
                          {String(currentQuestion[optionKey] || "")}
                        </span>
                        {result === true && (
                          <IconCheck className="h-8 w-8 text-green-600 shrink-0" />
                        )}
                        {result === false && (
                          <IconX className="h-8 w-8 text-red-600 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasAnswered && (
                <p className="text-center text-muted-foreground">
                  Waiting for next question...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT: Waiting state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <WaitingScreen
        message="Get ready..."
        subMessage="Next question coming up"
      />
    </div>
  );
}
