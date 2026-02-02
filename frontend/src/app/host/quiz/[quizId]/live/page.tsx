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
import { Skeleton } from "@/components/ui/skeleton";
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
    questionIndex,
    totalQuestions,
    leaderboard,
    currentQuestion,
    setStatus,
    setTotalQuestions,
    reset,
  } = useQuizStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

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
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
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
            <p className="text-muted-foreground">
              {isConnected ? "Connected" : "Connecting..."}
            </p>
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
                <Button
                  onClick={handleNextQuestion}
                  disabled={isAdvancing}
                  className="w-full"
                  size="lg"
                >
                  {isAdvancing && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <IconPlayerSkipForward className="h-5 w-5 mr-2" />
                  {questionIndex === -1
                    ? "Show First Question"
                    : "Next Question"}
                </Button>
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
        </div>

        {/* Center: Current Question */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Current Question</CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion ? (
                <div className="space-y-4">
                  <p className="text-lg font-medium">
                    {currentQuestion.questionText}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">A:</span>{" "}
                      {currentQuestion.optionA}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">B:</span>{" "}
                      {currentQuestion.optionB}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">C:</span>{" "}
                      {currentQuestion.optionC}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">D:</span>{" "}
                      {currentQuestion.optionD}
                    </p>
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

        {/* Right: QR Code & Leaderboard */}
        <div className="space-y-6">
          {status === "waiting" && quiz?.code && (
            <QRCodeDisplay quizCode={quiz.code} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={leaderboard} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
