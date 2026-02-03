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
  LeaderboardEntry,
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
    updateLeaderboard,
    reset,
  } = useQuizStore();

  const isInitialized = useRef(false);

  useEffect(() => {
    if (!accessToken || isInitialized.current) return;

    console.log("[Socket] Initializing socket connection...");
    console.log("[Socket] Access token available:", !!accessToken);

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";
    console.log("[Socket] WS URL:", wsUrl);

    socket = io(`${wsUrl}/quiz`, {
      auth: {
        token: `Bearer ${accessToken}`,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket] Transport connected - Socket ID:", socket?.id);
      console.log("[Socket] Waiting for authentication...");
    });

    socket.on("authenticated", (data) => {
      console.log("[Socket] Authentication successful:", data);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error);
      console.error("[Socket] Error message:", error.message);
      setConnected(false);
    });

    socket.on("error", (error) => {
      console.error("[Socket] Socket error:", error);
    });

    socket.on("exception", (error) => {
      console.error("[Socket] Socket exception:", error);
    });

    // Quiz events
    socket.on("quiz:started", (data: QuizStartedEvent) => {
      console.log("[Socket] Quiz started event received:", data);
      setStatus("active");
    });

    socket.on("quiz:question", (data: QuizQuestionEvent) => {
      console.log("[Socket] New question event received:", data);
      console.log("[Socket] Question index:", data.questionIndex);
      console.log("[Socket] Question text:", data.question?.questionText);
      setQuestion(data);
    });

    socket.on("quiz:question-ended", (data: QuizQuestionEndedEvent) => {
      console.log("[Socket] Question ended event received:", data);
      console.log("[Socket] Correct option:", data.correctOption);
      console.log("[Socket] Leaderboard entries:", data.leaderboard?.length);
      setQuestionEnded(data.correctOption, data.leaderboard);
    });

    socket.on("quiz:ended", (data: QuizEndedEvent) => {
      console.log("[Socket] Quiz ended event received:", data);
      endQuiz(data.finalLeaderboard);
    });

    // Participant events
    socket.on("participant:joined", (data: ParticipantJoinedEvent) => {
      console.log("[Socket] Participant joined event received:", data);
      addParticipant(data.userId, data.userName, data.participantCount);
      console.log(
        "[Socket] addParticipant called with count:",
        data.participantCount,
      );
    });

    socket.on("participant:left", (data: ParticipantLeftEvent) => {
      console.log("[Socket] Participant left event received:", data);
      console.log(
        `[Socket] ${data.userName} disconnected, remaining: ${data.participantCount}`,
      );
      removeParticipant(data.userId, data.participantCount);
    });

    // Answer feedback
    socket.on("answer:received", (data: AnswerReceivedEvent) => {
      console.log("Answer received:", data);
      setAnswerResult(data);
    });

    // Real-time question answers (for host)
    socket.on("participant:answered", (data) => {
      console.log("[Socket] Participant answered:", data);
      useQuizStore.getState().addQuestionScore({
        userId: data.userId,
        userName: data.userName,
        score: data.scoreAwarded,
        isCorrect: data.isCorrect,
        timeTaken: data.timeTaken,
      });
    });

    // Leaderboard updates
    socket.on(
      "leaderboard:update",
      (data: { leaderboard: LeaderboardEntry[] }) => {
        console.log("[Socket] Leaderboard update received:", data);
        updateLeaderboard(data.leaderboard);
      },
    );

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
    updateLeaderboard,
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
  const { setTotalQuestions, setStatus, setParticipantCount, reset } =
    useQuizStore();

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
              // Reset store to clear any previous quiz data
              reset();
              setTotalQuestions(response.state.totalQuestions);
              setStatus("waiting");
              setParticipantCount(response.participantCount || 0);
              // Set the participants who joined earlier
              if (response.participants && response.participants.length > 0) {
                response.participants.forEach((p) => {
                  useQuizStore
                    .getState()
                    .addParticipant(
                      p.userId,
                      p.userName,
                      response.participantCount,
                    );
                });
              }
              resolve(response);
            } else {
              reject(new Error("Failed to initialize quiz"));
            }
          },
        );
      });
    },
    [setTotalQuestions, setStatus, setParticipantCount, reset],
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
          console.error("Join failed: Socket not connected");
          reject(new Error("Socket not connected"));
          return;
        }

        if (!socket.connected) {
          console.error("Join failed: Socket not in connected state");
          reject(new Error("Socket not in connected state"));
          return;
        }

        console.log("Emitting participant:join with quizId:", quizId);

        // Set a timeout in case the server doesn't respond
        const timeout = setTimeout(() => {
          console.error("Join timeout: No response from server");
          reject(new Error("Request timeout - server did not respond"));
        }, 10000); // 10 second timeout

        socket.emit(
          "participant:join",
          { quizId },
          (response: JoinQuizResponse) => {
            clearTimeout(timeout);
            console.log("Join response received:", response);
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
          "answer:submit",
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
