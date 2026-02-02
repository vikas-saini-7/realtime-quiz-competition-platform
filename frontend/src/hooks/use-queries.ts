"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  quizService,
  questionService,
  attemptService,
  leaderboardService,
  authService,
} from "@/lib/api";
import type {
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  BulkCreateQuestionsDto,
} from "@/types";

// Auth queries
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Quiz queries
export function useQuizzes() {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: quizService.getAll,
  });
}

export function useMyQuizzes() {
  return useQuery({
    queryKey: ["quizzes", "my"],
    queryFn: quizService.getMyQuizzes,
  });
}

export function useLiveQuizzes() {
  return useQuery({
    queryKey: ["quizzes", "live"],
    queryFn: quizService.getLive,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => quizService.getById(quizId),
    enabled: !!quizId,
  });
}

export function useQuizByCode(code: string) {
  return useQuery({
    queryKey: ["quiz", "code", code],
    queryFn: () => quizService.getByCode(code),
    enabled: !!code,
  });
}

export function useQuizWithQuestions(quizId: string) {
  return useQuery({
    queryKey: ["quiz", quizId, "questions"],
    queryFn: () => quizService.getWithQuestions(quizId),
    enabled: !!quizId,
  });
}

// Quiz mutations
export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuizDto) => quizService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuizDto }) =>
      quizService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quiz", id] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quizService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
}

// Question queries
export function useQuestions(quizId: string) {
  return useQuery({
    queryKey: ["questions", quizId],
    queryFn: () => questionService.getByQuizId(quizId),
    enabled: !!quizId,
  });
}

// Question mutations
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionDto) => questionService.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["questions", data.quizId] });
      queryClient.invalidateQueries({
        queryKey: ["quiz", data.quizId, "questions"],
      });
    },
  });
}

export function useBulkCreateQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkCreateQuestionsDto) =>
      questionService.bulkCreate(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["questions", data.quizId] });
      queryClient.invalidateQueries({
        queryKey: ["quiz", data.quizId, "questions"],
      });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      quizId,
    }: {
      id: string;
      data: UpdateQuestionDto;
      quizId: string;
    }) => questionService.update(id, data),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ["questions", quizId] });
      queryClient.invalidateQueries({
        queryKey: ["quiz", quizId, "questions"],
      });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quizId }: { id: string; quizId: string }) =>
      questionService.delete(id),
    onSuccess: (_, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ["questions", quizId] });
      queryClient.invalidateQueries({
        queryKey: ["quiz", quizId, "questions"],
      });
    },
  });
}

// Attempt queries
export function useMyAttempts() {
  return useQuery({
    queryKey: ["attempts", "my"],
    queryFn: attemptService.getMyAttempts,
  });
}

export function useAttemptsByQuiz(quizId: string) {
  return useQuery({
    queryKey: ["attempts", "quiz", quizId],
    queryFn: () => attemptService.getByQuizId(quizId),
    enabled: !!quizId,
  });
}

export function useCreateAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => attemptService.create(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attempts"] });
    },
  });
}

// Leaderboard queries
export function useLeaderboard(quizId: string, limit?: number) {
  return useQuery({
    queryKey: ["leaderboard", quizId, limit],
    queryFn: () => leaderboardService.getByQuizId(quizId, limit),
    enabled: !!quizId,
    refetchInterval: 5000, // Refetch every 5 seconds during active quiz
  });
}

export function useMyLeaderboardPosition(quizId: string) {
  return useQuery({
    queryKey: ["leaderboard", quizId, "my-position"],
    queryFn: () => leaderboardService.getMyPosition(quizId),
    enabled: !!quizId,
  });
}
