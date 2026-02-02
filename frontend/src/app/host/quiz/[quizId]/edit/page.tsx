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
  IconEdit,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconShare,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { AddQuestionModal } from "@/components/quiz/add-question-modal";
import { ShareQuizModal } from "@/components/quiz/share-quiz-modal";
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
  onEdit,
  onDelete,
  isUpdating,
}: {
  question: Question;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        ref={setNodeRef}
        style={style}
        className="overflow-hidden rounded-xl"
      >
        <CardHeader className="py-4 px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                className="cursor-grab active:cursor-grabbing touch-none hover:bg-accent rounded-lg p-1.5 transition-colors"
                {...attributes}
                {...listeners}
              >
                <IconGripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-sm font-semibold shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base truncate text-foreground">
                  {question.questionText || "Untitled Question"}
                </h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1">
                    <span className="text-[10px]">⏱️</span>
                    {question.timeLimit}s
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-green-600">✓</span>
                    {question.baseScore} pts
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-red-600">✗</span>
                    {question.negativeScore} pts
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium">
                    Answer: {question.correctOption}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={onEdit}
              >
                <IconEdit className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  {isOpen ? (
                    <IconChevronUp className="h-4 w-4" />
                  ) : (
                    <IconChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-4 px-5 pb-5">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Question
                </h4>
                <p className="text-base text-foreground leading-relaxed">
                  {question.questionText}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(["A", "B", "C", "D"] as const).map((option) => (
                    <div
                      key={option}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        question.correctOption === option
                          ? "border-green-500/50 bg-green-50 dark:bg-green-950/30"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-semibold text-sm text-muted-foreground min-w-[20px]">
                          {option}.
                        </span>
                        <span className="flex-1 text-sm">
                          {question[`option${option}`]}
                        </span>
                        {question.correctOption === option && (
                          <IconCheck className="h-4 w-4 text-green-600 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
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
  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);
  const [editQuestionModalOpen, setEditQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !quiz?.questions) return;

    const oldIndex = quiz.questions.findIndex((q) => q.id === active.id);
    const newIndex = quiz.questions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newQuestions = arrayMove(quiz.questions, oldIndex, newIndex);

    // Update order indexes for affected questions
    const updates = newQuestions.map((q, idx) => ({
      id: q.id,
      orderIndex: idx,
    }));

    // Optimistically update the UI
    try {
      // Update each question's order
      for (const update of updates) {
        if (
          update.orderIndex !==
          quiz.questions.find((q) => q.id === update.id)?.orderIndex
        ) {
          await updateQuestion.mutateAsync({
            id: update.id,
            data: { orderIndex: update.orderIndex },
            quizId,
          });
        }
      }
      refetch();
      toast.success("Question order updated");
    } catch {
      toast.error("Failed to update question order");
      refetch();
    }
  };

  const handleAddQuestion = async (data: QuestionFormValues) => {
    if (!quiz) return;

    await createQuestion.mutateAsync({
      quizId,
      questionText: data.questionText,
      optionA: data.optionA,
      optionB: data.optionB,
      optionC: data.optionC,
      optionD: data.optionD,
      correctOption: data.correctOption,
      timeLimit: data.timeLimit,
      baseScore: data.baseScore,
      negativeScore: data.negativeScore,
      orderIndex: quiz.questions?.length || 0,
    });
    refetch();
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

  const handleEditQuestionClick = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestionModalOpen(true);
  };

  const handleEditQuestionSubmit = async (data: QuestionFormValues) => {
    if (!editingQuestion) return;
    await handleUpdateQuestion(editingQuestion.id, data);
    setEditQuestionModalOpen(false);
    setEditingQuestion(null);
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
          <Button variant="outline" onClick={() => setShareModalOpen(true)}>
            <IconShare className="h-4 w-4 mr-2" />
            Share
          </Button>
          {(quiz.status === "DRAFT" || quiz.status === "SCHEDULED") && (
            <Button onClick={handleGoLive} disabled={updateQuiz.isPending}>
              <IconPlayerPlay className="h-4 w-4 mr-2" />
              Go Live
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
          <div>
            <h2 className="text-xl font-semibold">Questions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {quiz.questions?.length || 0} question
              {quiz.questions?.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <Button onClick={() => setAddQuestionModalOpen(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {quiz.questions && quiz.questions.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={quiz.questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {quiz.questions
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={() => handleEditQuestionClick(question)}
                      onDelete={() => handleDeleteQuestion(question.id)}
                      isUpdating={updateQuestion.isPending}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="rounded-full bg-muted p-4">
                <IconPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">No questions yet</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Get started by adding your first question. You need at least
                  one question to go live.
                </p>
              </div>
              <Button onClick={() => setAddQuestionModalOpen(true)} size="lg">
                <IconPlus className="h-4 w-4 mr-2" />
                Add Your First Question
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddQuestionModal
        open={addQuestionModalOpen}
        onOpenChange={setAddQuestionModalOpen}
        onSubmit={handleAddQuestion}
        isSubmitting={createQuestion.isPending}
      />

      <AddQuestionModal
        open={editQuestionModalOpen}
        onOpenChange={(open) => {
          setEditQuestionModalOpen(open);
          if (!open) setEditingQuestion(null);
        }}
        onSubmit={handleEditQuestionSubmit}
        isSubmitting={updateQuestion.isPending}
        question={editingQuestion || undefined}
        mode="edit"
      />

      <ShareQuizModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        quiz={quiz}
      />
    </div>
  );
}
