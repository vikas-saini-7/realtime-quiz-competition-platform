"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizCode = params.code as string;

  // Redirect to new play URL
  useEffect(() => {
    router.replace(`/play/${quizCode}`);
  }, [quizCode, router]);

  return null;
}
