import api from "@/lib/api";

export interface GenerateQuizAIParams {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
}

export async function generateQuizAI(params: GenerateQuizAIParams) {
  const response = await api.post("/ai/generate", params);
  return response.data;
}
