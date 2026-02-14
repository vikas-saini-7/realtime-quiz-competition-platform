"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import type { Question } from "@/types";
import { AIQuestionModal } from "./ai-question-modal";

const questionSchema = z.object({
  questionText: z.string().min(1, "Question is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctOption: z.enum(["A", "B", "C", "D"]),
  timeLimit: z.coerce.number().min(5).max(120),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface AddQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: QuestionFormValues) => Promise<void>;
  isSubmitting: boolean;
  question?: Question; // Optional: if provided, modal is in edit mode
  mode?: "create" | "edit";
}

export function AddQuestionModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  question,
  mode = "create",
}: AddQuestionModalProps) {
  const isEditMode = mode === "edit" || !!question;
  const [aiModalOpen, setAiModalOpen] = useState(false);
  // Handler to receive AI question and fill form
  type AIQuestion = Partial<
    Pick<
      Question,
      | "questionText"
      | "optionA"
      | "optionB"
      | "optionC"
      | "optionD"
      | "correctOption"
      | "timeLimit"
    >
  > & {
    question?: string;
    options?: { A?: string; B?: string; C?: string; D?: string };
    answer?: string;
  };
  const handleAIResult = (q: AIQuestion) => {
    form.setValue("questionText", q.questionText || q.question || "");
    form.setValue("optionA", q.optionA || q.options?.A || "");
    form.setValue("optionB", q.optionB || q.options?.B || "");
    form.setValue("optionC", q.optionC || q.options?.C || "");
    form.setValue("optionD", q.optionD || q.options?.D || "");
    // Ensure only 'A' | 'B' | 'C' | 'D' is passed
    const correct = q.correctOption || q.answer;
    const validOptions = ["A", "B", "C", "D"] as const;
    function isOptionLetter(
      val: unknown,
    ): val is (typeof validOptions)[number] {
      return (
        typeof val === "string" &&
        validOptions.includes(val as (typeof validOptions)[number])
      );
    }
    const correctOption = isOptionLetter(correct) ? correct : "A";
    form.setValue("correctOption", correctOption);
    form.setValue("timeLimit", q.timeLimit || 30);
  };

  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      timeLimit: 30,
    },
  });

  // Update form when question changes (for edit mode)
  useEffect(() => {
    if (question && open) {
      form.reset({
        questionText: question.questionText,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctOption: question.correctOption,
        timeLimit: question.timeLimit,
      });
    } else if (!open) {
      // Reset form when modal closes
      form.reset({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
        timeLimit: 30,
      });
    }
  }, [question, open, form]);

  const handleSubmit = async (data: QuestionFormValues) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
      toast.success(
        isEditMode
          ? "Question updated successfully!"
          : "Question added successfully!",
      );
    } catch {
      toast.error(
        isEditMode ? "Failed to update question" : "Failed to add question",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader className="space-y-3 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold">
              {isEditMode ? "Edit Question" : "Add New Question"}
            </DialogTitle>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="ml-4"
            onClick={() => setAiModalOpen(true)}
          >
            Fill with AI
          </Button>
        </DialogHeader>
        <AIQuestionModal
          open={aiModalOpen}
          onOpenChange={setAiModalOpen}
          onResult={handleAIResult}
        />

        {/* AI modal is now in header, button removed from here */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Question
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question..."
                      className="resize-none min-h-[100px] rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <p className="text-sm font-semibold">Options</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(["A", "B", "C", "D"] as const).map((option) => (
                  <FormField
                    key={option}
                    control={form.control}
                    name={`option${option}` as keyof QuestionFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-muted-foreground">
                          Option {option}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Enter option ${option}`}
                            className="h-11 rounded-xl"
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
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Settings</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="correctOption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Correct
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
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
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Time (sec)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={5}
                          max={120}
                          className="h-11 rounded-xl"
                          {...field}
                          value={
                            typeof field.value === "number"
                              ? field.value
                              : field.value && !isNaN(Number(field.value))
                                ? Number(field.value)
                                : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-xl flex-1"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="rounded-xl flex-1"
              >
                {isSubmitting && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Update Question" : "Add Question"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
