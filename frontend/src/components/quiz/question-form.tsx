"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { Question, OptionLetter } from "@/types";

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctOption: z.enum(["A", "B", "C", "D"]),
  timeLimit: z.number().min(5).max(120),
  baseScore: z.number().min(0),
  negativeScore: z.number().min(0),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  question?: Question;
  orderIndex: number;
  onSubmit: (data: QuestionFormValues & { orderIndex: number }) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function QuestionForm({
  question,
  orderIndex,
  onSubmit,
  onDelete,
  isLoading,
}: QuestionFormProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: question?.questionText || "",
      optionA: question?.optionA || "",
      optionB: question?.optionB || "",
      optionC: question?.optionC || "",
      optionD: question?.optionD || "",
      correctOption: question?.correctOption || "A",
      timeLimit: question?.timeLimit || 30,
      baseScore: question?.baseScore || 100,
      negativeScore: question?.negativeScore || 25,
    },
  });

  const handleSubmit = (data: QuestionFormValues) => {
    onSubmit({ ...data, orderIndex });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Question {orderIndex + 1}</CardTitle>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">Option A</SelectItem>
                        <SelectItem value="B">Option B</SelectItem>
                        <SelectItem value="C">Option C</SelectItem>
                        <SelectItem value="D">Option D</SelectItem>
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
                      <Input
                        type="number"
                        min={5}
                        max={120}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
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
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
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
                    <FormLabel>Negative Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {question ? "Update Question" : "Add Question"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
