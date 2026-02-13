"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow alphanumeric characters
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitized.length === 0) {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
      return;
    }

    const newCode = [...code];
    newCode[index] = sanitized[0] || "";
    setCode(newCode);

    // Auto-focus next input
    if (sanitized.length > 0 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if code is complete and navigate
    if (index === 5 && sanitized.length > 0) {
      const fullCode = [...newCode.slice(0, 3), sanitized[0]].join("");
      if (fullCode.length === 6) {
        const formattedCode = `${fullCode.slice(0, 3)}-${fullCode.slice(3)}`;
        router.push(`/join/${formattedCode}`);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").toUpperCase();
    const cleaned = pastedText.replace(/[^A-Z0-9]/g, "");

    if (cleaned.length >= 6) {
      const newCode = cleaned.slice(0, 6).split("");
      setCode(newCode);

      // Navigate immediately
      const formattedCode = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
      setTimeout(() => {
        router.push(`/join/${formattedCode}`);
      }, 100);
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join("");
    if (fullCode.length === 6) {
      const formattedCode = `${fullCode.slice(0, 3)}-${fullCode.slice(3)}`;
      router.push(`/join/${formattedCode}`);
    }
  };

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Enter Quiz Code</h2>
          <p className="text-muted-foreground">
            Type or paste your 6-character code
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {/* First 3 boxes */}
          {[0, 1, 2].map((index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={code[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-24 h-24 text-center text-4xl font-semibold border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all uppercase bg-gray-50 dark:bg-neutral-900"
              placeholder=""
              autoComplete="off"
            />
          ))}

          {/* Dash separator */}
          <span className="text-4xl font-light text-muted-foreground">-</span>

          {/* Last 3 boxes */}
          {[3, 4, 5].map((index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={code[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-24 h-24 text-center text-4xl font-semibold border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all uppercase bg-gray-50 dark:bg-neutral-900"
              placeholder=""
              autoComplete="off"
            />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Example: XXX-XXX
        </p>
        <div className="flex justify-center mt-10">
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
