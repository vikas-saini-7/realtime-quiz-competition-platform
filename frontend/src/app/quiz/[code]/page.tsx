"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconTrophy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CountdownTimer,
  OptionButton,
  ScoreDisplay,
  LeaderboardTable,
  WaitingScreen,
  ParticipantCounter,
} from "@/components/quiz";
import { useSocket, useParticipantActions } from "@/hooks/use-socket";
import { useQuizStore, useAuthStore } from "@/store";
import { useQuizByCode } from "@/hooks";
import { toast } from "sonner";
import type { OptionLetter } from "@/types";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizCode = params.code as string;

  const { data: quiz, isLoading: isLoadingQuiz } = useQuizByCode(quizCode);
  const { isConnected } = useSocket();
  const { submitAnswer } = useParticipantActions();
  const { user } = useAuthStore();

  const {
    status,
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

  // Redirect if not joined
  useEffect(() => {
    if (!quiz?.id) return;
    if (status === "idle" && isConnected) {
      router.push(`/join/${quizCode}`);
    }
  }, [status, isConnected, quizCode, quiz, router]);

  const handleSelectOption = async (option: OptionLetter) => {
    if (hasAnswered || !currentQuestion || isSubmitting || !quiz?.id) return;

    setIsSubmitting(true);
    try {
      await submitAnswer(quiz.id, currentQuestion.id, option);
    } catch {
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

  if (isLoadingQuiz) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <WaitingScreen message="Loading..." />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
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
      <div className="container py-8 max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/join">
              <IconArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">
              Waiting for host to start
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="py-8">
            <WaitingScreen
              message="Waiting for host to start..."
              subMessage="The quiz will begin shortly"
            />

            <div className="mt-8 flex justify-center">
              <ParticipantCounter count={participantCount} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // BETWEEN QUESTIONS: Show results
  if (status === "between_questions") {
    return (
      <div className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">{quizTitle || quiz.title}</h1>
          <Progress
            value={((questionIndex + 1) / totalQuestions) * 100}
            className="h-2"
          />
          <p className="text-sm text-muted-foreground">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastAnswerResult?.isCorrect ? (
                <IconCheck className="h-6 w-6 text-green-500" />
              ) : (
                <IconX className="h-6 w-6 text-red-500" />
              )}
              {lastAnswerResult?.isCorrect ? "Correct!" : "Incorrect"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreDisplay score={totalScore} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // FINISHED: Show final results
  if (status === "finished") {
    const userRank =
      leaderboard.findIndex((entry) => entry.userId === user?.id) + 1;

    return (
      <div className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <IconTrophy className="h-16 w-16 mx-auto text-yellow-500" />
          <h1 className="text-3xl font-bold">Quiz Complete!</h1>
          <p className="text-xl text-muted-foreground">{quiz.title}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">{totalScore}</p>
              <p className="text-muted-foreground">Total Score</p>
            </div>
            {userRank > 0 && (
              <div className="text-center">
                <p className="text-2xl font-semibold">Rank: #{userRank}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Final Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button asChild className="flex-1">
            <Link href="/join">Join Another Quiz</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ACTIVE: Show current question
  if (status === "active" && currentQuestion) {
    return (
      <div className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">{quizTitle || quiz.title}</h1>
          <Progress
            value={((questionIndex + 1) / totalQuestions) * 100}
            className="h-2"
          />
          <p className="text-sm text-muted-foreground">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <ScoreDisplay score={totalScore} />
              <CountdownTimer endTime={questionEndTime || Date.now()} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">
              {currentQuestion.questionText}
            </h2>

            <div className="grid gap-3">
              {["A", "B", "C", "D"].map((option) => {
                const optionLetter = option as OptionLetter;
                const result = getOptionResult(optionLetter);
                const optionKey =
                  `option${option}` as keyof typeof currentQuestion;
                return (
                  <OptionButton
                    key={option}
                    option={optionLetter}
                    text={String(currentQuestion[optionKey] || "")}
                    isSelected={selectedOption === optionLetter}
                    isDisabled={hasAnswered || isSubmitting}
                    isCorrect={result}
                    showResult={hasAnswered}
                    onClick={() => handleSelectOption(optionLetter)}
                  />
                );
              })}
            </div>

            {hasAnswered && (
              <p className="text-center text-sm text-muted-foreground">
                Waiting for next question...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // DEFAULT: Waiting state
  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <WaitingScreen
        message="Get ready..."
        subMessage="Next question coming up"
      />
    </div>
  );
}
