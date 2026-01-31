"use client";

import { IconSearch, IconDeviceGamepad2 } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizCard } from "@/components/quiz/quiz-card";
import { useLiveQuizzes } from "@/hooks";
import { useState } from "react";

export default function BrowseQuizzesPage() {
  const { data: quizzes, isLoading, error } = useLiveQuizzes();
  const [search, setSearch] = useState("");

  const filteredQuizzes = quizzes?.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(search.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Failed to load quizzes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Browse Live Quizzes</h1>
        <p className="text-muted-foreground">
          Find and join live quiz competitions
        </p>
      </div>

      <div className="relative max-w-md">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredQuizzes && filteredQuizzes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 border rounded-lg bg-secondary/20">
          <IconDeviceGamepad2 className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No live quizzes</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {search
              ? "No quizzes match your search. Try a different term."
              : "There are no live quizzes at the moment. Check back later!"}
          </p>
        </div>
      )}
    </div>
  );
}
