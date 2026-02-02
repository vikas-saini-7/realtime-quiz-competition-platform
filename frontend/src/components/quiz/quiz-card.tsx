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
  IconQuestionMark,
  IconShare,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
          {quiz.questionCount !== undefined && (
            <div className="flex items-center gap-2">
              <IconQuestionMark className="h-4 w-4" />
              <span>{quiz.questionCount} questions</span>
            </div>
          )}
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
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/host/quiz/${quiz.id}/edit`}>
                <IconEdit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            {quiz.status === "DRAFT" || quiz.status === "SCHEDULED" ? (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onGoLive?.(quiz.id)}
              >
                <IconPlayerPlay className="h-4 w-4 mr-1" />
                Go Live
              </Button>
            ) : quiz.status === "LIVE" ? (
              <Button asChild size="sm" className="flex-1">
                <Link href={`/host/quiz/${quiz.id}/live`}>
                  <IconPlayerPlay className="h-4 w-4 mr-1" />
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
    </Card>
  );
}
