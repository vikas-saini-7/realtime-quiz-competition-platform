"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CountdownTimer,
  OptionButton,
  ScoreDisplay,
  LeaderboardTable,
  WaitingScreen,
} from "@/components/quiz";
import { useSocket, useParticipantActions } from "@/hooks/use-socket";
import { useQuizStore, useAuthStore } from "@/store";
import { toast } from "sonner";
import type { OptionLetter } from "@/types";
import { cn } from "@/lib/utils";

export default function QuizPlayPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

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
  } = useQuizStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to results when finished
  useEffect(() => {
    if (status === "finished") {
      router.push(`/play/result/${quizId}`);
    }
  }, [status, quizId, router]);

  // Redirect if not connected
  useEffect(() => {
    if (status === "idle" && isConnected) {
      router.push(`/play/join/${quizId}`);
    }
  }, [status, isConnected, quizId, router]);

  const handleSelectOption = async (option: OptionLetter) => {
    if (hasAnswered || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitAnswer(quizId, currentQuestion.id, option);
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

  // Waiting for question
  if (status === "waiting" || (status === "active" && !currentQuestion)) {
    return (
      <div className="container py-8 max-w-2xl mx-auto">
        <WaitingScreen
          message="Get ready..."
          subMessage="Next question coming up"
        />
      </div>
    );
  }

  // Between questions - show results
  if (status === "between_questions") {
    return (
      <div className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">{quizTitle}</h1>
          <Progress
            value={((questionIndex + 1) / totalQuestions) * 100}
            className="h-2"
          />
          <p className="text-sm text-muted-foreground">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>

        {/* Answer Result */}
        <Card
          className={cn(
            "border-2",
            lastAnswerResult?.isCorrect ? "border-green-500" : "border-red-500"
          )}
        >
          <CardContent className="py-8 text-center space-y-4">
            {lastAnswerResult?.isCorrect ? (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <IconCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-600">Correct!</h2>
                <p className="text-lg">
                  +{lastAnswerResult.scoreAwarded} points
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <IconX className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-red-600">
                  {hasAnswered ? "Incorrect" : "Time's up!"}
                </h2>
                {lastAnswerResult && lastAnswerResult.scoreAwarded < 0 && (
                  <p className="text-lg">{lastAnswerResult.scoreAwarded} points</p>
                )}
                <p className="text-muted-foreground">
                  Correct answer: {correctOption}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <ScoreDisplay
          score={totalScore}
          lastChange={lastAnswerResult?.scoreAwarded}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardTable entries={leaderboard.slice(0, 5)} currentUserId={user?.id} />
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground">
          Waiting for next question...
        </p>
      </div>
    );
  }

  // Active question
  if (status === "active" && currentQuestion) {
    return (
      <div className="container py-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">{quizTitle}</h1>
            <p className="text-sm text-muted-foreground">
              Question {questionIndex + 1} of {totalQuestions}
            </p>
          </div>
          {questionEndTime && (
            <CountdownTimer endTime={questionEndTime} />
          )}
        </div>

        <Progress
          value={((questionIndex + 1) / totalQuestions) * 100}
          className="h-2"
        />

        <Card>
          <CardContent className="py-6">
            <p className="text-xl font-medium">{currentQuestion.questionText}</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {(["A", "B", "C", "D"] as const).map((option) => (
            <OptionButton
              key={option}
              option={option}
              text={currentQuestion[`option${option}` as keyof typeof currentQuestion] as string}
              isSelected={selectedOption === option}
              isCorrect={getOptionResult(option)}
              isDisabled={hasAnswered || isSubmitting}
              showResult={!!correctOption}
              onClick={() => handleSelectOption(option)}
            />
          ))}
        </div>

        {hasAnswered && !correctOption && (
          <p className="text-center text-muted-foreground">
            Answer submitted! Waiting for time to end...
          </p>
        )}

        <ScoreDisplay score={totalScore} />
      </div>
    );
  }

  return null;
}
