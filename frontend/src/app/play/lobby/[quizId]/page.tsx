"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconUsers } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WaitingScreen, ParticipantCounter } from "@/components/quiz";
import { useSocket } from "@/hooks/use-socket";
import { useQuizStore } from "@/store";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const { isConnected } = useSocket();
  const { status, quizTitle, participantCount } = useQuizStore();

  // Redirect to quiz when started
  useEffect(() => {
    if (status === "active") {
      router.push(`/play/quiz/${quizId}`);
    }
  }, [status, quizId, router]);

  // Redirect if not joined
  useEffect(() => {
    if (status === "idle" && isConnected) {
      router.push(`/play/join/${quizId}`);
    }
  }, [status, isConnected, quizId, router]);

  return (
    <div className="container py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/play/browse">
            <IconArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{quizTitle || "Quiz Lobby"}</h1>
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
