"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  IconCalendar,
  IconUsers,
  IconEdit,
  IconPlayerPlay,
  IconTrash,
  IconListNumbers,
  IconShare,
  IconDeviceGamepad2,
  IconAlertCircle,
  IconRobot,
  IconHandFinger,
  IconId,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShareQuizModal } from "./share-quiz-modal";
import type { Quiz, QuizStatus } from "@/types";

interface QuizCardProps {
  quiz: Quiz;
  isHost?: boolean;
  onDelete?: (id: string) => void;
  onGoLive?: (id: string) => void;
}

const statusColors: Record<QuizStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  LIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-purple-100 text-purple-700",
};

export function QuizCard({ quiz, isHost, onDelete, onGoLive }: QuizCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);

  const handleGoLiveClick = () => {
    if (!quiz.questionCount || quiz.questionCount === 0) {
      return; // Button should be disabled, but double-check
    }
    setGoLiveModalOpen(true);
  };

  const handleConfirmGoLive = () => {
    setGoLiveModalOpen(false);
    onGoLive?.(quiz.id);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {quiz.description}
              </p>
            )}
          </div>
          <Badge className={statusColors[quiz.status]} variant="secondary">
            {quiz.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <IconListNumbers className="h-4 w-4" />
            <span>{quiz.questionCount} questions</span>
            <span className="text-muted-foreground/50">•</span>
            {quiz.isAutomatic ? (
              <IconRobot className="h-4 w-4" />
            ) : (
              <IconHandFinger className="h-4 w-4" />
            )}
            <span>
              {quiz.isAutomatic ? "Automatic" : "Manual"}
            </span>
          </div>
          {quiz.scheduledAt && (
            <div className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4" />
              <span>
                Scheduled{" "}
                {formatDistanceToNow(new Date(quiz.scheduledAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4" />
            <span>
              Created{" "}
              {formatDistanceToNow(new Date(quiz.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2 flex-wrap">
        {isHost ? (
          <>
            {quiz.status !== "LIVE" && (
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/host/quiz/${quiz.id}/edit`}>
                  <IconEdit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
            {quiz.status === "DRAFT" || quiz.status === "SCHEDULED" ? (
              <Button
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleGoLiveClick}
                disabled={!quiz.questionCount || quiz.questionCount === 0}
                title={!quiz.questionCount || quiz.questionCount === 0 ? "Add at least one question to go live" : ""}
              >
                <IconPlayerPlay className="h-4 w-4 mr-1" />
                Go Live
              </Button>
            ) : quiz.status === "LIVE" ? (
              <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Link href={`/host/quiz/${quiz.id}/live`}>
                  <IconDeviceGamepad2 className="h-4 w-4 mr-1" />
                  Control
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" size="sm" className="flex-1">
                <Link href={`/host/quiz/${quiz.id}/results`}>
                  <IconUsers className="h-4 w-4 mr-1" />
                  Results
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
            >
              <IconShare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete?.(quiz.id)}
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button asChild className="w-full" disabled={quiz.status !== "LIVE"}>
            <Link href={`/play/join/${quiz.code}`}>
              <IconPlayerPlay className="h-4 w-4 mr-2" />
              {quiz.status === "LIVE" ? "Join Quiz" : "Not Available"}
            </Link>
          </Button>
        )}
      </CardFooter>

      <ShareQuizModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        quiz={quiz}
      />

      <Dialog open={goLiveModalOpen} onOpenChange={setGoLiveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Quiz Live</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <IconId className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm">
                  <strong className="font-semibold text-foreground">{quiz.title}</strong>
                  <span className="font-mono text-muted-foreground ml-1.5">({quiz.code})</span>
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IconListNumbers className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                </p>
              </div>
              <div className="flex items-start gap-2">
                {quiz.isAutomatic ? (
                  <IconRobot className="h-4 w-4 text-muted-foreground mt-0.5" />
                ) : (
                  <IconHandFinger className="h-4 w-4 text-muted-foreground mt-0.5" />
                )}
                <p className="text-sm text-muted-foreground">
                  {quiz.isAutomatic ? "Automatic" : "Manual"} mode
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex gap-3">
                <IconAlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Cannot undo after starting
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Questions and quiz mode cannot be changed once live
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setGoLiveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirmGoLive}
            >
              <IconPlayerPlay className="h-4 w-4 mr-2" />
              Start Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
