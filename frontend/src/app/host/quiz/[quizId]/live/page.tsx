"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconPlayerStop,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ParticipantCounter,
  QRCodeDisplay,
  LeaderboardTable,
  QuizStatusBadge,
} from "@/components/quiz";
import { useQuizWithQuestions } from "@/hooks";
import { useSocket, useHostActions } from "@/hooks/use-socket";
import { useQuizStore } from "@/store";
import { toast } from "sonner";

export default function LiveQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const { data: quiz, isLoading } = useQuizWithQuestions(quizId);
  const { socket, isConnected } = useSocket();
  const { initializeQuiz, startQuiz, nextQuestion, endQuizEarly } =
    useHostActions();

  const {
    status,
    participantCount,
    participants,
    questionIndex,
    totalQuestions,
    leaderboard,
    currentQuestion,
    questionEndTime,
    questionScores,
    setStatus,
    setTotalQuestions,
    reset,
  } = useQuizStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerActive || timeRemaining === null || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  // Start timer when new question is displayed
  useEffect(() => {
    if (currentQuestion && questionEndTime) {
      const remaining = Math.max(
        0,
        Math.ceil((questionEndTime - Date.now()) / 1000),
      );
      setTimeRemaining(remaining);
      setIsTimerActive(true);
    }
  }, [currentQuestion, questionEndTime]);

  // Stop timer when question ends
  useEffect(() => {
    if (status === "between_questions") {
      setIsTimerActive(false);
      setTimeRemaining(null);
    }
  }, [status]);

  // Initialize quiz session on mount
  useEffect(() => {
    if (!isConnected || !quizId || status !== "idle") return;

    const init = async () => {
      setIsInitializing(true);
      try {
        const response = await initializeQuiz(quizId);
        setTotalQuestions(response.state.totalQuestions);
        setStatus("waiting");
        toast.success("Quiz session initialized");
      } catch (error) {
        toast.error("Failed to initialize quiz session");
        console.error(error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [
    isConnected,
    quizId,
    status,
    initializeQuiz,
    setStatus,
    setTotalQuestions,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Debug: Log participantCount changes
  useEffect(() => {
    console.log("[LiveQuizPage] Participant count updated:", participantCount);
  }, [participantCount]);

  // Fetch initial leaderboard when quiz starts
  useEffect(() => {
    if (status === "active" && socket && quizId) {
      console.log("[LiveQuizPage] Quiz started, fetching initial leaderboard");
      socket.emit(
        "leaderboard:get",
        { quizId, limit: 10 },
        (response: { success: boolean; leaderboard: any[] }) => {
          if (response.success && response.leaderboard) {
            console.log(
              "[LiveQuizPage] Initial leaderboard fetched:",
              response.leaderboard,
            );
            useQuizStore.getState().updateLeaderboard(response.leaderboard);
          }
        },
      );
    }
  }, [status, socket, quizId]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startQuiz(quizId);
      toast.success("Quiz started!");
    } catch {
      toast.error("Failed to start quiz");
    } finally {
      setIsStarting(false);
    }
  };

  const handleNextQuestion = async () => {
    setIsAdvancing(true);
    try {
      const result = await nextQuestion(quizId);
      if (result.finished) {
        toast.success("Quiz completed!");
      }
    } catch {
      toast.error("Failed to advance question");
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleEndQuiz = async () => {
    if (!confirm("Are you sure you want to end the quiz?")) return;

    setIsEnding(true);
    try {
      await endQuizEarly(quizId);
      toast.success("Quiz ended");
      router.push(`/host/quiz/${quizId}/results`);
    } catch {
      toast.error("Failed to end quiz");
    } finally {
      setIsEnding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton className="h-10 w-64" showHeader={false} linesCount={1} />
        <div className="grid gap-6 lg:grid-cols-3">
          <CardSkeleton className="h-64" />
          <CardSkeleton className="h-64" />
          <CardSkeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Quiz not found</p>
        <Button asChild>
          <Link href="/host/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/host/dashboard">
              <IconArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <QuizStatusBadge status={quiz.status} />
            </div>
            {status === "idle" && (
              <p className="text-muted-foreground">
                {isConnected ? "Connected" : "Connecting..."}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {status === "finished" ? (
            <Button asChild>
              <Link href={`/host/quiz/${quizId}/results`}>View Results</Link>
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleEndQuiz}
              disabled={isEnding || status === "idle"}
            >
              {isEnding && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <IconPlayerStop className="h-4 w-4 mr-2" />
              End Quiz
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInitializing ? (
                <div className="flex items-center justify-center py-8">
                  <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : status === "waiting" ? (
                <Button
                  onClick={handleStart}
                  disabled={isStarting || participantCount === 0}
                  className="w-full"
                  size="lg"
                >
                  {isStarting && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <IconPlayerPlay className="h-5 w-5 mr-2" />
                  Start Quiz
                </Button>
              ) : status === "active" || status === "between_questions" ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleNextQuestion}
                    disabled={isAdvancing || isTimerActive}
                    className="w-full"
                    size="lg"
                  >
                    {isAdvancing && (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <IconPlayerSkipForward className="h-5 w-5 mr-2" />
                    {questionIndex === -1
                      ? "Show First Question"
                      : status === "active" && isTimerActive
                        ? `Wait for (${timeRemaining}s)`
                        : "Next Question"}
                  </Button>
                  {isTimerActive && timeRemaining !== null && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {timeRemaining}s
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Time remaining
                      </div>
                    </div>
                  )}
                </div>
              ) : status === "finished" ? (
                <p className="text-center text-muted-foreground py-4">
                  Quiz has ended
                </p>
              ) : null}

              <div className="text-center text-sm text-muted-foreground">
                {questionIndex >= 0 ? (
                  <span>
                    Question {questionIndex + 1} of {totalQuestions}
                  </span>
                ) : (
                  <span>{totalQuestions} questions ready</span>
                )}
              </div>
            </CardContent>
          </Card>

          <ParticipantCounter count={participantCount} />

          {status === "waiting" && quiz?.code && (
            <QRCodeDisplay quizCode={quiz.code} />
          )}
        </div>

        {/* Center: Question Scores */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {currentQuestion
                  ? "Current Question Scores"
                  : "Current Question"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion ? (
                <div className="space-y-4">
                  {/* Question Text */}
                  <div className="pb-4 border-b">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Question {questionIndex + 1}:
                    </p>
                    <p className="text-base font-medium">
                      {currentQuestion.questionText}
                    </p>
                  </div>

                  {/* Real-time Scores */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {questionScores.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Waiting for participants to answer...
                      </p>
                    ) : (
                      questionScores
                        .sort((a, b) => {
                          // Sort by score (descending), then by time (ascending)
                          if (b.score !== a.score) return b.score - a.score;
                          return a.timeTaken - b.timeTaken;
                        })
                        .map((scoreEntry, index) => (
                          <div
                            key={scoreEntry.userId}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              scoreEntry.isCorrect
                                ? "bg-green-500/10 border border-green-500/20"
                                : "bg-red-500/10 border border-red-500/20"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                                scoreEntry.isCorrect
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                  : "bg-red-500/20 text-red-700 dark:text-red-400"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {scoreEntry.userName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {(scoreEntry.timeTaken / 1000).toFixed(1)}s
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {scoreEntry.score}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {scoreEntry.isCorrect ? "✓ Correct" : "✗ Wrong"}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  {status === "waiting"
                    ? "Waiting to start..."
                    : "No question displayed"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Leaderboard */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {status === "waiting" ? "Participants" : "Leaderboard"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status === "waiting" ? (
                <div className="space-y-2">
                  {participants.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No participants yet
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {participants.map((participant, index) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 font-medium">
                            {participant.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <LeaderboardTable entries={leaderboard} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
