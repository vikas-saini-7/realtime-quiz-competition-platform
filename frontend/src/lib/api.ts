import axios, { AxiosError } from "axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Quiz,
  QuizWithQuestions,
  CreateQuizDto,
  UpdateQuizDto,
  Question,
  CreateQuestionDto,
  UpdateQuestionDto,
  BulkCreateQuestionsDto,
  Attempt,
  Answer,
  LeaderboardEntry,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("accessToken", token);
  } else if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth Service
export const authService = {
  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    // console.log("API login response:", response.data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>(
      "/auth/me",
    );
    return response.data.data;
  },
};

// Quiz Service
export const quizService = {
  getAll: async (): Promise<Quiz[]> => {
    const response = await api.get<{ success: boolean; data: Quiz[] }>(
      "/quizzes",
    );
    return response.data.data;
  },

  getMyQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get<{ success: boolean; data: Quiz[] }>(
      "/quizzes/my-quizzes",
    );
    return response.data.data;
  },

  getLive: async (): Promise<Quiz[]> => {
    const response = await api.get<{ success: boolean; data: Quiz[] }>(
      "/quizzes/live",
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Quiz> => {
    const response = await api.get<{ success: boolean; data: Quiz }>(
      `/quizzes/${id}`,
    );
    return response.data.data;
  },

  getWithQuestions: async (id: string): Promise<QuizWithQuestions> => {
    const response = await api.get<{
      success: boolean;
      data: QuizWithQuestions;
    }>(`/quizzes/${id}/with-questions`);
    return response.data.data;
  },

  create: async (data: CreateQuizDto): Promise<Quiz> => {
    const response = await api.post<{ success: boolean; data: Quiz }>(
      "/quizzes",
      data,
    );
    return response.data.data;
  },

  update: async (id: string, data: UpdateQuizDto): Promise<Quiz> => {
    const response = await api.put<{ success: boolean; data: Quiz }>(
      `/quizzes/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/quizzes/${id}`);
  },
};

// Question Service
export const questionService = {
  getByQuizId: async (quizId: string): Promise<Question[]> => {
    const response = await api.get<{ success: boolean; data: Question[] }>(
      `/questions/quiz/${quizId}`,
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Question> => {
    const response = await api.get<{ success: boolean; data: Question }>(
      `/questions/${id}`,
    );
    return response.data.data;
  },

  create: async (data: CreateQuestionDto): Promise<Question> => {
    const response = await api.post<{ success: boolean; data: Question }>(
      "/questions",
      data,
    );
    return response.data.data;
  },

  bulkCreate: async (data: BulkCreateQuestionsDto): Promise<Question[]> => {
    const response = await api.post<{ success: boolean; data: Question[] }>(
      "/questions/bulk",
      data,
    );
    return response.data.data;
  },

  update: async (id: string, data: UpdateQuestionDto): Promise<Question> => {
    const response = await api.put<{ success: boolean; data: Question }>(
      `/questions/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },
};

// Attempt Service
export const attemptService = {
  create: async (quizId: string): Promise<Attempt> => {
    const response = await api.post<{ success: boolean; data: Attempt }>(
      "/attempts",
      { quizId },
    );
    return response.data.data;
  },

  getMyAttempts: async (): Promise<Attempt[]> => {
    const response = await api.get<{ success: boolean; data: Attempt[] }>(
      "/attempts/my-attempts",
    );
    return response.data.data;
  },

  getByQuizId: async (quizId: string): Promise<Attempt[]> => {
    const response = await api.get<{ success: boolean; data: Attempt[] }>(
      `/attempts/quiz/${quizId}`,
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Attempt> => {
    const response = await api.get<{ success: boolean; data: Attempt }>(
      `/attempts/${id}`,
    );
    return response.data.data;
  },
};

// Answer Service
export const answerService = {
  getByAttemptId: async (attemptId: string): Promise<Answer[]> => {
    const response = await api.get<{ success: boolean; data: Answer[] }>(
      `/answers/attempt/${attemptId}`,
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Answer> => {
    const response = await api.get<{ success: boolean; data: Answer }>(
      `/answers/${id}`,
    );
    return response.data.data;
  },
};

// Leaderboard Service
export const leaderboardService = {
  getByQuizId: async (
    quizId: string,
    limit?: number,
  ): Promise<LeaderboardEntry[]> => {
    const params = limit ? { limit } : {};
    const response = await api.get<{
      success: boolean;
      data: LeaderboardEntry[];
    }>(`/leaderboard/${quizId}`, { params });
    return response.data.data;
  },

  getMyPosition: async (quizId: string): Promise<LeaderboardEntry> => {
    const response = await api.get<{
      success: boolean;
      data: LeaderboardEntry;
    }>(`/leaderboard/${quizId}/my-position`);
    return response.data.data;
  },
};

export default api;
