"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  IconArrowLeft,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { QuizStatusBadge } from "@/components/quiz/quiz-status-badge";
import {
  useQuizWithQuestions,
  useUpdateQuiz,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks";
import { toast } from "sonner";
import type { Question, OptionLetter } from "@/types";

const questionSchema = z.object({
  questionText: z.string().min(1, "Question is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctOption: z.enum(["A", "B", "C", "D"]),
  timeLimit: z.coerce.number().min(5).max(120),
  baseScore: z.coerce.number().min(0),
  negativeScore: z.coerce.number().min(0),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

function QuestionCard({
  question,
  index,
  onUpdate,
  onDelete,
  isUpdating,
}: {
  question: Question;
  index: number;
  onUpdate: (data: QuestionFormValues) => void;
  onDelete: () => void;
  isUpdating: boolean;
}) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption,
      timeLimit: question.timeLimit,
      baseScore: question.baseScore,
      negativeScore: question.negativeScore,
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Question {index + 1}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["A", "B", "C", "D"] as const).map((option) => (
                <FormField
                  key={option}
                  control={form.control}
                  name={`option${option}` as keyof QuestionFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option {option}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Option ${option}`}
                          {...field}
                          value={field.value as string}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="correctOption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (sec)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} max={120} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Score</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="negativeScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Negative</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isUpdating} size="sm">
              {isUpdating && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const { data: quiz, isLoading, refetch } = useQuizWithQuestions(quizId);
  const updateQuiz = useUpdateQuiz();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [editingQuizDetails, setEditingQuizDetails] = useState(false);

  const handleAddQuestion = async () => {
    if (!quiz) return;

    try {
      await createQuestion.mutateAsync({
        quizId,
        questionText: "New question",
        optionA: "Option A",
        optionB: "Option B",
        optionC: "Option C",
        optionD: "Option D",
        correctOption: "A",
        timeLimit: 30,
        baseScore: 100,
        negativeScore: 25,
        orderIndex: quiz.questions?.length || 0,
      });
      refetch();
      toast.success("Question added");
    } catch {
      toast.error("Failed to add question");
    }
  };

  const handleUpdateQuestion = async (
    questionId: string,
    data: QuestionFormValues,
  ) => {
    try {
      await updateQuestion.mutateAsync({
        id: questionId,
        data,
        quizId,
      });
      toast.success("Question updated");
    } catch {
      toast.error("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await deleteQuestion.mutateAsync({ id: questionId, quizId });
      refetch();
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const handleGoLive = async () => {
    if (!quiz?.questions?.length) {
      toast.error("Add at least one question before going live");
      return;
    }

    try {
      await updateQuiz.mutateAsync({ id: quizId, data: { status: "LIVE" } });
      router.push(`/host/quiz/${quizId}/live`);
    } catch {
      toast.error("Failed to start quiz");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
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
            <Link href="/host/dashboard">
              <IconArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <QuizStatusBadge status={quiz.status} />
            </div>
            <p className="text-muted-foreground">
              {quiz.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(quiz.status === "DRAFT" || quiz.status === "SCHEDULED") && (
            <Button onClick={handleGoLive} disabled={updateQuiz.isPending}>
              <IconPlayerPlay className="h-4 w-4 mr-2" />
              Go Live
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Questions ({quiz.questions?.length || 0})
        </h2>
        <Button onClick={handleAddQuestion} disabled={createQuestion.isPending}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {quiz.questions && quiz.questions.length > 0 ? (
        <div className="space-y-4">
          {quiz.questions
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onUpdate={(data) => handleUpdateQuestion(question.id, data)}
                onDelete={() => handleDeleteQuestion(question.id)}
                isUpdating={updateQuestion.isPending}
              />
            ))}
        </div>
      ) : (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">No questions yet</p>
            <Button onClick={handleAddQuestion}>
              <IconPlus className="h-4 w-4 mr-2" />
              Add Your First Question
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
