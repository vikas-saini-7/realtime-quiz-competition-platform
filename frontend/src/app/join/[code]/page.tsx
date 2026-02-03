"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconLoader2,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QuizStatusBadge } from "@/components/quiz";
import { useQuizByCode } from "@/hooks";
import { useSocket, useParticipantActions } from "@/hooks/use-socket";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

export default function JoinQuizConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const quizCode = params.code as string;

  const { data: quiz, isLoading } = useQuizByCode(quizCode);
  const { isConnected } = useSocket();
  const { join } = useParticipantActions();
  const { user } = useAuthStore();

  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    console.log("Join button clicked");
    console.log("isConnected:", isConnected);
    console.log("quiz.id:", quiz?.id);

    if (!isConnected) {
      toast.error("Not connected to server");
      return;
    }

    if (!quiz?.id) {
      toast.error("Quiz not found");
      return;
    }

    setIsJoining(true);
    try {
      console.log("Attempting to join quiz with ID:", quiz.id);
      const response = await join(quiz.id);
      console.log("Join successful, response:", response);
      toast.success("Joined quiz!");
      router.push(`/play/${quiz.code}`);
    } catch (error) {
      console.error("Join error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to join quiz",
      );
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-lg mx-auto">
        <Card className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading quiz details..." />
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-100 gap-4">
          <p className="text-muted-foreground">Quiz not found</p>
          <p className="text-sm text-muted-foreground">Code: {quizCode}</p>
          <Button asChild>
            <Link href="/join">Try Another Code</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (quiz.status !== "LIVE") {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-100 gap-4">
          <QuizStatusBadge status={quiz.status} />
          <h2 className="text-xl font-semibold">{quiz.title}</h2>
          <p className="text-muted-foreground">
            This quiz is not currently live
          </p>
          <Button asChild>
            <Link href="/join">Try Another Code</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/join">
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Join Quiz</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{quiz.title}</CardTitle>
            <QuizStatusBadge status={quiz.status} />
          </div>
          {quiz.description && (
            <CardDescription>{quiz.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quiz Code:</span>
              <span className="font-mono font-bold">{quiz.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joining as:</span>
              <span className="font-medium">{user?.name || "Guest"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connection:</span>
              <span
                className={`font-medium ${
                  isConnected ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {isConnected ? "Connected" : "Connecting..."}
              </span>
            </div>
          </div>

          <Button
            onClick={handleJoin}
            disabled={isJoining || !isConnected}
            className="w-full"
            size="lg"
          >
            {isJoining ? (
              <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <IconPlayerPlay className="mr-2 h-5 w-5" />
            )}
            Join Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
