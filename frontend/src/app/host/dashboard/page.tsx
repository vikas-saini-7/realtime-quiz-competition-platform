"use client";

import { useRouter } from "next/navigation";
import { IconPlus, IconBrain } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizCard } from "@/components/quiz/quiz-card";
import { useMyQuizzes, useDeleteQuiz, useUpdateQuiz } from "@/hooks";
import { toast } from "sonner";

export default function HostDashboardPage() {
  const router = useRouter();
  const { data: quizzes, isLoading, error } = useMyQuizzes();
  const deleteQuiz = useDeleteQuiz();
  const updateQuiz = useUpdateQuiz();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Quizzes</h1>
          <p className="text-muted-foreground">
            Manage and host your quiz competitions
          </p>
        </div>
        <Button onClick={() => router.push("/host/create-quiz")}>
          <IconPlus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      ) : quizzes && quizzes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 border rounded-lg bg-secondary/20">
          <IconBrain className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No quizzes yet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Create your first quiz to get started hosting live competitions.
          </p>
          <Button onClick={() => router.push("/host/create-quiz")}>
            <IconPlus className="h-4 w-4 mr-2" />
            Create Your First Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
