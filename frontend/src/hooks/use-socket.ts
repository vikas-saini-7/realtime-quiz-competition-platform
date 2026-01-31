"use client";

import { useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore, useQuizStore } from "@/store";
import type {
  QuizQuestionEvent,
  QuizQuestionEndedEvent,
  QuizEndedEvent,
  ParticipantJoinedEvent,
  ParticipantLeftEvent,
  AnswerReceivedEvent,
  QuizStartedEvent,
  OptionLetter,
  JoinQuizResponse,
  InitializeQuizResponse,
} from "@/types";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function useSocket() {
  const { accessToken } = useAuthStore();
  const {
    setConnected,
    setQuestion,
    setQuestionEnded,
    endQuiz,
    addParticipant,
    removeParticipant,
    setAnswerResult,
    setStatus,
    reset,
  } = useQuizStore();

  const isInitialized = useRef(false);

  useEffect(() => {
    if (!accessToken || isInitialized.current) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";

    socket = io(wsUrl, {
      path: "/quiz",
      auth: {
        token: `Bearer ${accessToken}`,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    // Quiz events
    socket.on("quiz:started", (data: QuizStartedEvent) => {
      console.log("Quiz started:", data);
      setStatus("active");
    });

    socket.on("quiz:question", (data: QuizQuestionEvent) => {
      console.log("New question:", data);
      setQuestion(data);
    });

    socket.on("quiz:question-ended", (data: QuizQuestionEndedEvent) => {
      console.log("Question ended:", data);
      setQuestionEnded(data.correctOption, data.leaderboard);
    });

    socket.on("quiz:ended", (data: QuizEndedEvent) => {
      console.log("Quiz ended:", data);
      endQuiz(data.finalLeaderboard);
    });

    // Participant events
    socket.on("participant:joined", (data: ParticipantJoinedEvent) => {
      console.log("Participant joined:", data);
      addParticipant(data.userId, data.userName, data.participantCount);
    });

    socket.on("participant:left", (data: ParticipantLeftEvent) => {
      console.log("Participant left:", data);
      removeParticipant(data.userId, data.participantCount);
    });

    // Answer feedback
    socket.on("answer:received", (data: AnswerReceivedEvent) => {
      console.log("Answer received:", data);
      setAnswerResult(data);
    });

    isInitialized.current = true;

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        isInitialized.current = false;
      }
    };
  }, [
    accessToken,
    setConnected,
    setQuestion,
    setQuestionEnded,
    endQuiz,
    addParticipant,
    removeParticipant,
    setAnswerResult,
    setStatus,
  ]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = null;
      isInitialized.current = false;
      reset();
    }
  }, [reset]);

  return {
    socket,
    isConnected: useQuizStore.getState().isConnected,
    disconnect,
  };
}

// Host actions
export function useHostActions() {
  const { setTotalQuestions, setStatus, setParticipantCount } = useQuizStore();

  const initializeQuiz = useCallback(
    (quizId: string): Promise<InitializeQuizResponse> => {
      return new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error("Socket not connected"));
          return;
        }

        socket.emit(
          "host:initialize",
          { quizId },
          (response: InitializeQuizResponse) => {
            if (response.success) {
              setTotalQuestions(response.state.totalQuestions);
              setStatus("waiting");
              setParticipantCount(0);
              resolve(response);
            } else {
              reject(new Error("Failed to initialize quiz"));
            }
          },
        );
      });
    },
    [setTotalQuestions, setStatus, setParticipantCount],
  );

  const startQuiz = useCallback((quizId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      socket.emit(
        "host:start",
        { quizId },
        (response: { success: boolean }) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error("Failed to start quiz"));
          }
        },
      );
    });
  }, []);

  const nextQuestion = useCallback(
    (
      quizId: string,
    ): Promise<{ finished?: boolean; questionIndex?: number }> => {
      return new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error("Socket not connected"));
          return;
        }

        socket.emit(
          "host:next-question",
          { quizId },
          (response: {
            success: boolean;
            finished?: boolean;
            questionIndex?: number;
          }) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error("Failed to advance to next question"));
            }
          },
        );
      });
    },
    [],
  );

  const endQuizEarly = useCallback((quizId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      socket.emit(
        "host:end-quiz",
        { quizId },
        (response: { success: boolean }) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error("Failed to end quiz"));
          }
        },
      );
    });
  }, []);

  return {
    initializeQuiz,
    startQuiz,
    nextQuestion,
    endQuizEarly,
  };
}

// Participant actions
export function useParticipantActions() {
  const { joinQuiz, submitAnswer: setSubmitAnswer } = useQuizStore();

  const join = useCallback(
    (quizId: string): Promise<JoinQuizResponse> => {
      return new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error("Socket not connected"));
          return;
        }

        socket.emit(
          "participant:join",
          { quizId },
          (response: JoinQuizResponse) => {
            if (response.success) {
              joinQuiz(response.quizId, response.attemptId, response.quizTitle);
              resolve(response);
            } else {
              reject(new Error("Failed to join quiz"));
            }
          },
        );
      });
    },
    [joinQuiz],
  );

  const submitAnswer = useCallback(
    (
      quizId: string,
      questionId: string,
      selectedOption: OptionLetter,
    ): Promise<{
      isCorrect: boolean;
      scoreAwarded: number;
      totalScore: number;
    }> => {
      return new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error("Socket not connected"));
          return;
        }

        setSubmitAnswer(selectedOption);

        socket.emit(
          "participant:answer",
          { quizId, questionId, selectedOption },
          (response: {
            success: boolean;
            isCorrect: boolean;
            scoreAwarded: number;
            totalScore: number;
          }) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error("Failed to submit answer"));
            }
          },
        );
      });
    },
    [setSubmitAnswer],
  );

  const leaveQuiz = useCallback((quizId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      socket.emit(
        "participant:leave",
        { quizId },
        (response: { success: boolean }) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error("Failed to leave quiz"));
          }
        },
      );
    });
  }, []);

  const getLeaderboard = useCallback(
    (quizId: string, limit = 10): Promise<{ leaderboard: unknown[] }> => {
      return new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error("Socket not connected"));
          return;
        }

        socket.emit(
          "leaderboard:get",
          { quizId, limit },
          (response: { success: boolean; leaderboard: unknown[] }) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(new Error("Failed to get leaderboard"));
            }
          },
        );
      });
    },
    [],
  );

  return {
    join,
    submitAnswer,
    leaveQuiz,
    getLeaderboard,
  };
}
