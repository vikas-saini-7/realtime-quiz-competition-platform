"use client";

import { cn } from "@/lib/utils";
import type { OptionLetter } from "@/types";
import { IconCheck, IconX } from "@tabler/icons-react";

interface OptionButtonProps {
  option: OptionLetter;
  text: string;
  isSelected: boolean;
  isCorrect?: boolean | null;
  isDisabled?: boolean;
  showResult?: boolean;
  onClick: () => void;
}

const optionColors: Record<
  OptionLetter,
  { bg: string; border: string; text: string }
> = {
  A: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  B: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  C: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
  },
  D: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
};

export function OptionButton({
  option,
  text,
  isSelected,
  isCorrect,
  isDisabled,
  showResult,
  onClick,
}: OptionButtonProps) {
  const colors = optionColors[option];

  const getResultStyles = () => {
    if (!showResult) return "";
    if (isCorrect === true) return "border-green-500 bg-green-50";
    if (isCorrect === false && isSelected) return "border-red-500 bg-red-50";
    return "";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isSelected && !showResult && "ring-2 ring-primary ring-offset-2",
        !isSelected && !showResult && colors.border,
        getResultStyles(),
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
          colors.bg,
          colors.text,
        )}
      >
        {option}
      </span>
      <span className="flex-1 font-medium">{text}</span>
      {showResult && isCorrect === true && (
        <IconCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
      )}
      {showResult && isCorrect === false && isSelected && (
        <IconX className="h-6 w-6 text-red-500 flex-shrink-0" />
      )}
    </button>
  );
}
