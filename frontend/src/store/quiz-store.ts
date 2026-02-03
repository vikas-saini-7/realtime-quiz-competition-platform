import { create } from "zustand";
import type {
  OptionLetter,
  QuestionForParticipant,
  AnswerReceivedEvent,
  LeaderboardEntry,
  QuizQuestionEvent,
} from "@/types";

export type QuizSessionStatus =
  | "idle"
  | "waiting"
  | "active"
  | "between_questions"
  | "finished";

interface QuizState {
  // Connection
  isConnected: boolean;

  // Quiz session
  quizId: string | null;
  attemptId: string | null;
  quizTitle: string | null;

  // Current question
  currentQuestion: QuestionForParticipant | null;
  questionIndex: number;
  totalQuestions: number;
  questionStartTime: number | null;
  questionEndTime: number | null;

  // Answer state
  selectedOption: OptionLetter | null;
  hasAnswered: boolean;
  lastAnswerResult: AnswerReceivedEvent | null;
  correctOption: OptionLetter | null;

  // Scores
  totalScore: number;
  leaderboard: LeaderboardEntry[];

  // Participants (for host)
  participantCount: number;
  participants: { id: string; name: string }[];

  // Current question scores (for host - real-time)
  questionScores: Array<{
    userId: string;
    userName: string;
    score: number;
    isCorrect: boolean;
    timeTaken?: number;
  }>;

  // Quiz status
  status: QuizSessionStatus;

  // Actions
  setConnected: (connected: boolean) => void;
  joinQuiz: (quizId: string, attemptId: string, title: string) => void;
  setQuestion: (event: QuizQuestionEvent) => void;
  submitAnswer: (option: OptionLetter) => void;
  setAnswerResult: (result: AnswerReceivedEvent) => void;
  setQuestionEnded: (
    correctOption: OptionLetter,
    leaderboard: LeaderboardEntry[],
  ) => void;
  updateLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setParticipantCount: (count: number) => void;
  addParticipant: (id: string, name: string, count: number) => void;
  removeParticipant: (id: string, count: number) => void;
  addQuestionScore: (
    userId: string,
    userName: string,
    score: number,
    isCorrect: boolean,
    timeTaken?: number,
  ) => void;
  clearQuestionScores: () => void;
  setStatus: (status: QuizSessionStatus) => void;
  setTotalQuestions: (total: number) => void;
  endQuiz: (finalLeaderboard: LeaderboardEntry[]) => void;
  reset: () => void;
}

const initialState = {
  isConnected: false,
  quizId: null,
  attemptId: null,
  quizTitle: null,
  currentQuestion: null,
  questionIndex: -1,
  totalQuestions: 0,
  questionStartTime: null,
  questionEndTime: null,
  selectedOption: null,
  hasAnswered: false,
  lastAnswerResult: null,
  correctOption: null,
  totalScore: 0,
  leaderboard: [],
  participantCount: 0,
  participants: [],
  questionScores: [],
  status: "idle" as QuizSessionStatus,
};

export const useQuizStore = create<QuizState>((set) => ({
  ...initialState,

  setConnected: (connected) => set({ isConnected: connected }),

  joinQuiz: (quizId, attemptId, title) =>
    set({
      quizId,
      attemptId,
      quizTitle: title,
      status: "waiting",
    }),

  setQuestion: (event) => {
    console.log("[QuizStore] setQuestion called with event:", event);
    set({
      currentQuestion: event.question,
      questionIndex: event.questionIndex,
      totalQuestions: event.totalQuestions,
      questionStartTime: event.startTime,
      questionEndTime: event.endTime,
      selectedOption: null,
      hasAnswered: false,
      lastAnswerResult: null,
      correctOption: null,
      questionScores: [], // Clear question scores for new question
      status: "active",
    });
    console.log(
      "[QuizStore] Question set - Index:",
      event.questionIndex,
      "Status: active",
    );
  },

  submitAnswer: (option) =>
    set({
      selectedOption: option,
      hasAnswered: true,
    }),

  setAnswerResult: (result) =>
    set({
      lastAnswerResult: result,
      totalScore: result.totalScore,
    }),

  setQuestionEnded: (correctOption, leaderboard) =>
    set({
      correctOption,
      leaderboard,
      status: "between_questions",
    }),

  updateLeaderboard: (leaderboard) => set({ leaderboard }),

  setParticipantCount: (count) => set({ participantCount: count }),

  addParticipant: (id, name, count) =>
    set((state) => {
      // Check if participant already exists
      const existingParticipant = state.participants.find((p) => p.id === id);
      if (existingParticipant) {
        console.log("[QuizStore] Participant already exists, skipping:", {
          id,
          name,
        });
        // Just update the count, don't add duplicate
        return {
          participantCount: count,
        };
      }

      console.log(
        "[QuizStore] addParticipant called - id:",
        id,
        "name:",
        name,
        "count:",
        count,
      );
      console.log(
        "[QuizStore] Current participantCount:",
        state.participantCount,
      );
      const newState = {
        participants: [...state.participants, { id, name }],
        participantCount: count,
      };
      console.log(
        "[QuizStore] New participantCount:",
        newState.participantCount,
      );
      return newState;
    }),

  removeParticipant: (id, count) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
      participantCount: count,
      // Also remove from question scores if they were answering
      questionScores: state.questionScores.filter((s) => s.userId !== id),
    })),

  addQuestionScore: (userId, userName, score, isCorrect, timeTaken) =>
    set((state) => {
      console.log("[QuizStore] addQuestionScore called:", {
        userId,
        userName,
        score,
        isCorrect,
        timeTaken,
      });
      // Check if user already answered
      const existing = state.questionScores.find((s) => s.userId === userId);
      if (existing) {
        console.log("[QuizStore] User already answered, skipping");
        return state; // Don't add duplicate
      }
      const newScores = [
        ...state.questionScores,
        { userId, userName, score, isCorrect, timeTaken },
      ];
      console.log("[QuizStore] New questionScores:", newScores);
      return {
        ...state,
        questionScores: newScores,
      };
    }),

  clearQuestionScores: () => set({ questionScores: [] }),

  setStatus: (status) => set({ status }),

  setTotalQuestions: (total) => set({ totalQuestions: total }),

  endQuiz: (finalLeaderboard) =>
    set({
      leaderboard: finalLeaderboard,
      status: "finished",
    }),

  reset: () => set(initialState),
}));
