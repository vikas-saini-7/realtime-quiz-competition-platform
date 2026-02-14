"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { generateQuizAI } from "@/lib/ai";

import type { Question } from "@/types";

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

interface AIQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (question: AIQuestion) => void;
}

export function AIQuestionModal({
  open,
  onOpenChange,
  onResult,
}: AIQuestionModalProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast.error("Please enter a topic");
      return;
    }
    setLoading(true);
    try {
      const aiResult = await generateQuizAI({
        topic,
        difficulty: difficulty as "easy" | "medium" | "hard",
        numberOfQuestions: 1,
      });
      // The backend returns { success, data: [ { question, options, correctAnswer } ], timestamp }
      const questions = aiResult?.data || aiResult?.questions || aiResult;
      if (!questions || !Array.isArray(questions) || !questions.length) {
        toast.error("AI did not return a question");
        setLoading(false);
        return;
      }
      const backendQ = questions[0];
      const optionsArr = backendQ.options || [];
      const correctIdx = optionsArr.findIndex(
        (opt: string) => opt === backendQ.correctAnswer,
      );
      const optionLetters = ["A", "B", "C", "D"] as const;
      const mapped = {
        questionText: backendQ.question || "",
        optionA: optionsArr[0] || "",
        optionB: optionsArr[1] || "",
        optionC: optionsArr[2] || "",
        optionD: optionsArr[3] || "",
        correctOption: optionLetters[correctIdx] || "A",
        timeLimit: 30,
      };
      onResult(mapped);
      onOpenChange(false);
      toast.success("AI question generated!");
    } catch {
      toast.error("Failed to generate question with AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Generate Question with AI</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Topic</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Science"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
