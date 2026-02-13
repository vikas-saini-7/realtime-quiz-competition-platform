"use client";

import { useState, useEffect } from "react";
import {
  IconX,
  IconCheck,
  IconArrowRight,
  IconTrophy,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { OptionLetter } from "@/types";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OptionLetter;
  timeLimit: number;
  orderIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  baseScore: number;
  negativeScore: number;
  questions?: Question[];
}

interface PreviewQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
}

export function PreviewQuizModal({
  open,
  onOpenChange,
  quiz,
}: PreviewQuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionLetter | null>(
    null,
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setShowAnswer(false);
        setScore(0);
        setIsComplete(false);
      }, 300);
    }
  }, [open]);

  const handleSelectOption = (option: OptionLetter) => {
    if (showAnswer) return;
    setSelectedOption(option);
    setShowAnswer(true);

    // Calculate score
    if (option === currentQuestion.correctOption) {
      setScore((prev) => prev + (quiz.baseScore || 100));
    } else {
      setScore((prev) => prev - (quiz.negativeScore || 0));
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
    if (!showAnswer) return null;
    if (option === currentQuestion.correctOption) return true;
    if (option === selectedOption && option !== currentQuestion.correctOption)
      return false;
    return null;
  };

  if (!questions.length) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Quiz</DialogTitle>
          </DialogHeader>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No questions available to preview. Add questions first.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{quiz.title} - Preview</DialogTitle>
            <span className="text-sm text-muted-foreground">Preview Mode</span>
          </div>
        </DialogHeader>

        {!isComplete ? (
          <div className="space-y-6 py-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="font-semibold">Score: {score}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question Card */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      Time Limit: {currentQuestion.timeLimit}s
                    </span>
                    <span className="text-sm font-semibold">
                      Points: {quiz.baseScore || 100}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold leading-relaxed">
                    {currentQuestion.questionText}
                  </h3>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                  {(["A", "B", "C", "D"] as OptionLetter[]).map((option) => {
                    const result = getOptionResult(option);
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(option)}
                        disabled={showAnswer}
                        className={cn(
                          "w-full p-4 rounded-xl text-left transition-all",
                          "hover:bg-primary/5",
                          selectedOption === option &&
                            !showAnswer &&
                            "bg-primary/5",
                          result === true && "bg-green-50 dark:bg-green-950/30",
                          result === false && "bg-red-50 dark:bg-red-950/30",
                          showAnswer && result === null && "opacity-50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-muted-foreground min-w-6">
                            {option}.
                          </span>
                          <span className="flex-1">
                            {currentQuestion[`option${option}`]}
                          </span>
                          {result === true && (
                            <IconCheck className="h-5 w-5 text-green-600 shrink-0" />
                          )}
                          {result === false && (
                            <IconX className="h-5 w-5 text-red-600 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                {showAnswer && (
                  <div className="pt-4">
                    <Button
                      onClick={handleNextQuestion}
                      className="w-full"
                      size="lg"
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
              </CardContent>
            </Card>
          </div>
        ) : (
          // Results Screen
          <div className="py-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <IconTrophy className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-muted-foreground">
                  Here&apos;s how you performed in the preview
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-3xl font-bold">{score}</p>
                    <p className="text-sm text-muted-foreground">Total Score</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-3xl font-bold">{questions.length}</p>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <p className="text-3xl font-bold">
                      {Math.round(
                        (score /
                          questions.reduce(
                            (sum: number, q: Question) =>
                              sum + (quiz.baseScore || 10),
                            0,
                          )) *
                          100,
                      )}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Preview Again
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1"
                size="lg"
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
