// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Quiz types
export type QuizStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED";

export interface Quiz {
  id: string;
  code: string;
  title: string;
  description: string | null;
  hostId: string;
  status: QuizStatus;
  scheduledAt: string | null;
  createdAt: string;
  questionCount?: number;
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

export interface CreateQuizDto {
  title: string;
  description?: string;
  scheduledAt?: string;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  status?: QuizStatus;
  scheduledAt?: string;
}

// Question types
export type OptionLetter = "A" | "B" | "C" | "D";

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OptionLetter;
  timeLimit: number;
  baseScore: number;
  negativeScore: number;
  orderIndex: number;
}

export interface QuestionForParticipant {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  timeLimit: number;
}

export interface CreateQuestionDto {
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OptionLetter;
  timeLimit?: number;
  baseScore?: number;
  negativeScore?: number;
  orderIndex: number;
}

export interface UpdateQuestionDto {
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: OptionLetter;
  timeLimit?: number;
  baseScore?: number;
  negativeScore?: number;
  orderIndex?: number;
}

export interface BulkCreateQuestionsDto {
  quizId: string;
  questions: Omit<CreateQuestionDto, "quizId">[];
}

// Attempt types
export interface Attempt {
  id: string;
  quizId: string;
  userId: string;
  totalScore: number;
  joinedAt: string;
  completedAt: string | null;
}

export interface AttemptWithDetails extends Attempt {
  quiz?: Quiz;
  user?: User;
  answers?: Answer[];
}

// Answer types
export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOption: OptionLetter | null;
  isCorrect: boolean;
  timeTaken: number;
  scoreAwarded: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
}

// WebSocket payload types
export interface QuizQuestionEvent {
  questionIndex: number;
  totalQuestions: number;
  question: QuestionForParticipant;
  startTime: number;
  endTime: number;
}

export interface QuizQuestionEndedEvent {
  questionIndex: number;
  correctOption: OptionLetter;
  leaderboard: LeaderboardEntry[];
}

export interface QuizEndedEvent {
  quizId: string;
  finalLeaderboard: LeaderboardEntry[];
}

export interface AnswerReceivedEvent {
  questionId: string;
  isCorrect: boolean;
  scoreAwarded: number;
  totalScore: number;
}

export interface ParticipantJoinedEvent {
  userId: string;
  userName: string;
  participantCount: number;
}

export interface ParticipantLeftEvent {
  userId: string;
  participantCount: number;
}

export interface QuizStartedEvent {
  quizId: string;
  message: string;
}

// Socket response types
export interface SocketResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface JoinQuizResponse {
  success: boolean;
  quizId: string;
  attemptId: string;
  quizTitle: string;
  status: string;
  currentQuestionIndex: number;
}

export interface InitializeQuizResponse {
  success: boolean;
  quizId: string;
  state: {
    quizId: string;
    hostId: string;
    status: string;
    currentQuestionIndex: number;
    totalQuestions: number;
  };
}
