"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { IconCopy, IconCheck, IconShare } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Quiz } from "@/types";

interface ShareQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
}

export function ShareQuizModal({
  open,
  onOpenChange,
  quiz,
}: ShareQuizModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const joinUrl = `${window.location.origin}/join/${quiz.code}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(quiz.code);
      setCopiedCode(true);
      toast.success("Quiz code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      toast.success("Link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz.title,
          text: `Join my quiz "${quiz.title}" with code: ${quiz.code}`,
          url: joinUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <div className="flex flex-col items-center space-y-6 py-6">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-2xl border border-black/10">
            <QRCodeSVG
              value={joinUrl}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Quiz Code */}
          <div className="text-center space-y-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl px-10 py-5">
              <span className="text-3xl font-bold tracking-[0.5em] text-primary">
                {quiz.code}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Scan or share this code
            </p>
          </div>

          {/* Share Button */}
          <Button onClick={handleShare} className="w-full" size="lg">
            <IconShare className="h-4 w-4 mr-2" />
            Share Quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
