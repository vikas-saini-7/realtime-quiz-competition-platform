"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconBrain } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { QuizCard } from "@/components/quiz/quiz-card";
import { CreateQuizModal } from "@/components/quiz/create-quiz-modal";
import { useMyQuizzes, useDeleteQuiz, useUpdateQuiz } from "@/hooks";
import { toast } from "sonner";

export default function HostDashboardPage() {
  const router = useRouter();
  const { data: quizzes, isLoading, error } = useMyQuizzes();
  const deleteQuiz = useDeleteQuiz();
  const updateQuiz = useUpdateQuiz();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await deleteQuiz.mutateAsync(id);
      toast.success("Quiz deleted successfully");
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  const handleGoLive = async (id: string) => {
    const quiz = quizzes?.find((q) => q.id === id);
    if (!quiz?.questionCount || quiz.questionCount === 0) {
      toast.error("Add at least one question before going live");
      return;
    }

    try {
      await updateQuiz.mutateAsync({ id, data: { status: "LIVE" } });
      router.push(`/host/quiz/${id}/live`);
    } catch {
      toast.error("Failed to start quiz");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Failed to load quizzes</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            {quizzes?.length || 0} {quizzes?.length === 1 ? "quiz" : "quizzes"}
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          size="lg"
          className="rounded-xl"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          New Quiz
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} className="h-56" showHeader={false} />
          ))}
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              isHost
              onDelete={handleDelete}
              onGoLive={handleGoLive}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 rounded-3xl bg-muted/20 dark:bg-muted/10">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
            <IconBrain className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Create your first quiz</h2>
            <p className="text-muted-foreground max-w-sm">
              Get started by creating a quiz and share it with your audience.
            </p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            size="lg"
            className="rounded-xl"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            New Quiz
          </Button>
        </div>
      )}

      <CreateQuizModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
