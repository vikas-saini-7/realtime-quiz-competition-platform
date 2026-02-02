"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  FormDescription,
} from "@/components/ui/form";
import { useCreateQuiz } from "@/hooks";
import { toast } from "sonner";

const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  scheduledAt: z.string().optional(),
});

type CreateQuizFormValues = z.infer<typeof createQuizSchema>;

interface CreateQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateQuizModal({ open, onOpenChange }: CreateQuizModalProps) {
  const router = useRouter();
  const createQuiz = useCreateQuiz();

  const form = useForm<CreateQuizFormValues>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduledAt: "",
    },
  });

  const onSubmit = async (data: CreateQuizFormValues) => {
    try {
      const quiz = await createQuiz.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        scheduledAt: data.scheduledAt || undefined,
      });
      toast.success("Quiz created successfully!");
      form.reset();
      onOpenChange(false);
      router.push(`/host/quiz/${quiz.id}/edit`);
    } catch {
      toast.error("Failed to create quiz");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            Create New Quiz
          </DialogTitle>
          <DialogDescription className="text-base">
            Set up your quiz details. You can add questions after creation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Quiz Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="JavaScript Fundamentals"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Description{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Test your knowledge of JavaScript basics..."
                      className="resize-none rounded-xl min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">
                    Schedule{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={createQuiz.isPending}
                size="lg"
                className="rounded-xl flex-1"
              >
                {createQuiz.isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Quiz
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
