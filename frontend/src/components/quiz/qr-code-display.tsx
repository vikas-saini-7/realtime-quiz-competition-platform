"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

interface QRCodeDisplayProps {
  quizId: string;
  title?: string;
}

export function QRCodeDisplay({ quizId, title }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/join/${quizId}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Card className="w-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title || "Scan to Join"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-lg">
          <QRCodeSVG value={joinUrl} size={180} level="M" />
        </div>
        <div className="flex items-center gap-2 w-full">
          <code className="flex-1 px-3 py-2 bg-secondary rounded text-sm truncate">
            {joinUrl}
          </code>
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? (
              <IconCheck className="h-4 w-4 text-green-500" />
            ) : (
              <IconCopy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
