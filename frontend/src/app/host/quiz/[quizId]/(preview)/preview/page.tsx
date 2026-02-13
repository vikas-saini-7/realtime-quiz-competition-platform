"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconX,
  IconCheck,
  IconArrowRight,
  IconTrophy,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuizWithQuestions } from "@/hooks";
import { cn } from "@/lib/utils";
import type { OptionLetter } from "@/types";

export default function PreviewQuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const { data: quiz, isLoading } = useQuizWithQuestions(quizId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionLetter | null>(
    null,
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleSelectOption = (option: OptionLetter) => {
    if (showAnswer || !currentQuestion || !quiz) return;
    setSelectedOption(option);
    setShowAnswer(true);

    // Calculate score
    if (option === currentQuestion.correctOption) {
      setScore((prev) => prev + (quiz.baseScore || 100));
    } else {
      setScore((prev) => Math.max(0, prev - (quiz.negativeScore || 0)));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setScore(0);
    setIsComplete(false);
  };

  const getOptionResult = (option: OptionLetter): boolean | null => {
    if (!showAnswer || !currentQuestion) return null;
    if (option === currentQuestion.correctOption) return true;
    if (option === selectedOption && option !== currentQuestion.correctOption)
      return false;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="xl" message="Loading preview..." />
      </div>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            No questions available to preview
          </p>
          <Button asChild>
            <Link href={`/host/quiz/${quizId}/edit`}>
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Edit
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (isComplete) {
    const maxScore = questions.length * (quiz?.baseScore || 10);
    const accuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Close Button */}
        <Link
          href={`/host/quiz/${quizId}/edit`}
          className="fixed top-4 right-4 z-[60] p-2 rounded-full bg-transparent hover:bg-background/50 transition-all duration-200 group"
        >
          <IconX className="h-6 w-6 text-foreground group-hover:text-red-500 transition-colors" />
        </Link>

        {/* Tilted Preview Badge */}
        {/* <div className="fixed top-24 right-0 z-50">
          <div className="origin-top-right rotate-45 bg-primary text-primary-foreground shadow-xl px-12 py-2">
            <span className="text-xs font-bold tracking-wider">
              PREVIEW
            </span>
          </div>
        </div> */}

        <div className="container max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-8">
            {/* Trophy Icon */}
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-8">
                  <IconTrophy className="h-20 w-20 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  Preview Complete!
                </h1>
                <p className="text-xl text-muted-foreground">{quiz.title}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-6 rounded-2xl bg-card border-2">
                <p className="text-5xl font-bold mb-2">{score}</p>
                <p className="text-sm text-muted-foreground">Total Score</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-card border-2">
                <p className="text-5xl font-bold mb-2">{questions.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-card border-2">
                <p className="text-5xl font-bold mb-2">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRestart}
                variant="outline"
                size="lg"
                className="flex-1 h-14 text-lg rounded-xl"
              >
                Preview Again
              </Button>
              <Button
                asChild
                size="lg"
                className="flex-1 h-14 text-lg rounded-xl"
              >
                <Link href={`/host/quiz/${quizId}/edit`}>
                  <IconArrowLeft className="h-5 w-5 mr-2" />
                  Back to Edit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Question
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Tilted Preview Badge */}
      <div className="fixed top-8 -right-16 z-50">
        <div className="rotate-45 bg-primary text-primary-foreground shadow-xl px-24 py-2">
          <span className="text-xs font-bold tracking-wider">PREVIEW</span>
        </div>
      </div>

      {/* Close Button */}
      <Link
        href={`/host/quiz/${quizId}/edit`}
        className="fixed top-1 right-1 z-[60] p-2 rounded-full bg-transparent hover:bg-background/50 transition-all duration-200 group"
      >
        <IconX className="h-6 w-6 text-foreground group-hover:text-red-500 transition-colors" />
      </Link>

      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold">{quiz.title}</h1>
            <div className="space-y-2">
              <Progress value={progress} className="h-3 rounded-full" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="font-semibold text-lg">Score: {score}</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="space-y-8">
            {/* Question Text */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>Time: {currentQuestion.timeLimit}s</span>
                <span>•</span>
                <span>Points: {quiz?.baseScore || 100}</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-relaxed px-4">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="grid gap-4 max-w-3xl mx-auto">
              {(["A", "B", "C", "D"] as OptionLetter[]).map((option) => {
                const result = getOptionResult(option);
                const isSelected = selectedOption === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    disabled={showAnswer}
                    className={cn(
                      "group relative w-full p-6 md:p-8 rounded-2xl border-2 text-left transition-all",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      !showAnswer &&
                        "hover:border-primary hover:bg-primary/5 hover:shadow-lg",
                      isSelected &&
                        !showAnswer &&
                        "border-primary bg-primary/10 shadow-lg",
                      result === true &&
                        "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-lg",
                      result === false &&
                        "border-red-500 bg-red-50 dark:bg-red-950/30 shadow-lg",
                      showAnswer && result === null && "opacity-60",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg shrink-0 transition-colors",
                          !showAnswer &&
                            "bg-secondary text-secondary-foreground",
                          result === true && "bg-green-500 text-white",
                          result === false && "bg-red-500 text-white",
                          showAnswer &&
                            result === null &&
                            "bg-secondary/50 text-secondary-foreground/50",
                        )}
                      >
                        {option}
                      </div>
                      <span className="flex-1 text-lg md:text-xl font-medium">
                        {currentQuestion[`option${option}`]}
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

            {/* Next Button */}
            {showAnswer && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleNextQuestion}
                  size="lg"
                  className="h-14 px-8 text-lg rounded-xl min-w-50"
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <IconArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    "View Results"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
