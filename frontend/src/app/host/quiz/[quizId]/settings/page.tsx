"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { QuizStatusBadge } from "@/components/quiz/quiz-status-badge";
import { useQuizWithQuestions, useUpdateQuiz } from "@/hooks";
import { toast } from "sonner";

export default function QuizSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const { data: quiz, isLoading, refetch } = useQuizWithQuestions(quizId);
  const updateQuiz = useUpdateQuiz();

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    title: "",
    description: "",
    isAutomatic: false,
    baseScore: 100,
    negativeScore: 25,
    scheduledAt: "",
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdateQuizSettings = async () => {
    if (!hasChanges) return;

    setIsSavingSettings(true);
    try {
      await updateQuiz.mutateAsync({
        id: quizId,
        data: {
          title: settingsForm.title,
          description: settingsForm.description,
          isAutomatic: settingsForm.isAutomatic,
          baseScore: settingsForm.baseScore,
          negativeScore: settingsForm.negativeScore,
          scheduledAt: settingsForm.scheduledAt || undefined,
        },
      });
      await refetch();
      setHasChanges(false);
      toast.success("Settings updated successfully");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Initialize settings form when quiz loads
  useEffect(() => {
    if (quiz) {
      setSettingsForm({
        title: quiz.title,
        description: quiz.description || "",
        isAutomatic: quiz.isAutomatic ?? false,
        baseScore: quiz.baseScore ?? 100,
        negativeScore: quiz.negativeScore ?? 25,
        scheduledAt: quiz.scheduledAt
          ? new Date(quiz.scheduledAt).toISOString().slice(0, 16)
          : "",
      });
      setHasChanges(false);
    }
  }, [
    quiz?.id,
    quiz?.title,
    quiz?.description,
    quiz?.isAutomatic,
    quiz?.baseScore,
    quiz?.negativeScore,
    quiz?.scheduledAt,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Quiz not found</p>
        <Button asChild>
          <Link href="/host/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/host/quiz/${quizId}/edit`}>
              <IconArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quiz Settings</h1>
              <QuizStatusBadge status={quiz.status} />
            </div>
            <p className="text-muted-foreground">{quiz.title}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button
          onClick={handleUpdateQuizSettings}
          disabled={
            !hasChanges ||
            isSavingSettings ||
            quiz.status === "LIVE" ||
            quiz.status === "COMPLETED"
          }
          className="min-w-[120px]"
        >
          {isSavingSettings ? (
            <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <IconDeviceFloppy className="h-4 w-4 mr-2" />
          )}
          {isSavingSettings ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic Details Section */}
        <Card className="bg-white dark:bg-gray-500/10">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>Update quiz title and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={settingsForm.title}
                  onChange={(e) => {
                    setSettingsForm({ ...settingsForm, title: e.target.value });
                    setHasChanges(true);
                  }}
                  placeholder="Quiz title"
                  disabled={
                    quiz.status === "LIVE" || quiz.status === "COMPLETED"
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quiz Code</label>
                <Input
                  value={quiz.code}
                  disabled
                  className="font-mono font-semibold bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={settingsForm.description}
                onChange={(e) => {
                  setSettingsForm({
                    ...settingsForm,
                    description: e.target.value,
                  });
                  setHasChanges(true);
                }}
                placeholder="Quiz description (optional)"
                className="resize-none min-h-[80px]"
                disabled={quiz.status === "LIVE" || quiz.status === "COMPLETED"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiz Behavior Section */}
        <Card className="bg-white dark:bg-gray-500/10">
          <CardHeader>
            <CardTitle>Quiz Behavior</CardTitle>
            <CardDescription>Control progression mode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Automatic Mode</label>
                <p className="text-xs text-muted-foreground">
                  {settingsForm.isAutomatic
                    ? "Questions auto-advance when timer expires"
                    : "Manually control question progression"}
                </p>
              </div>
              <Switch
                checked={settingsForm.isAutomatic}
                onCheckedChange={(checked) => {
                  setSettingsForm({ ...settingsForm, isAutomatic: checked });
                  setHasChanges(true);
                }}
                disabled={
                  quiz.status === "LIVE" ||
                  quiz.status === "COMPLETED" ||
                  isSavingSettings
                }
              />
            </div>
            {(quiz.status === "LIVE" || quiz.status === "COMPLETED") && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                ⚠️ Cannot change settings after quiz has started
              </p>
            )}
          </CardContent>
        </Card>

        {/* Scoring Configuration Section */}
        <Card className="bg-white dark:bg-gray-500/10">
          <CardHeader>
            <CardTitle>Scoring System</CardTitle>
            <CardDescription>
              Configure points for correct and incorrect answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Score</label>
                <Input
                  type="number"
                  min={0}
                  value={settingsForm.baseScore}
                  onChange={(e) => {
                    setSettingsForm({
                      ...settingsForm,
                      baseScore: parseInt(e.target.value) || 0,
                    });
                    setHasChanges(true);
                  }}
                  placeholder="Points for correct answer"
                  disabled={
                    quiz.status === "LIVE" || quiz.status === "COMPLETED"
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Points awarded for each correct answer
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Negative Score</label>
                <Input
                  type="number"
                  min={0}
                  value={settingsForm.negativeScore}
                  onChange={(e) => {
                    setSettingsForm({
                      ...settingsForm,
                      negativeScore: parseInt(e.target.value) || 0,
                    });
                    setHasChanges(true);
                  }}
                  placeholder="Penalty for wrong answer"
                  disabled={
                    quiz.status === "LIVE" || quiz.status === "COMPLETED"
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Points deducted for each incorrect answer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule and Statistics Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Schedule */}
          <Card className="bg-white dark:bg-gray-500/10">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Set when quiz becomes available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                type="datetime-local"
                value={settingsForm.scheduledAt}
                onChange={(e) => {
                  setSettingsForm({
                    ...settingsForm,
                    scheduledAt: e.target.value,
                  });
                  setHasChanges(true);
                }}
                disabled={quiz.status === "LIVE" || quiz.status === "COMPLETED"}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Leave empty for immediate availability
              </p>
            </CardContent>
          </Card>

          {/* Quiz Info */}
          <Card className="bg-white dark:bg-gray-500/10">
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>Overview of quiz details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-semibold">
                    {quiz.questions?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <QuizStatusBadge status={quiz.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
