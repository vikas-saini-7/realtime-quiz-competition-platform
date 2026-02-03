"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

const sizeConfig = {
  sm: { container: 32, border: 2, center: 14 },
  md: { container: 48, border: 2, center: 22 },
  lg: { container: 64, border: 3, center: 29 },
  xl: { container: 80, border: 3, center: 37 },
};

export function LoadingSpinner({
  size = "md",
  className,
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const config = sizeConfig[size];
  const styleId = `ripple-${size}`;
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Create keyframes dynamically
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        @keyframes ${styleId} {
          0% {
            top: ${config.center}px;
            left: ${config.center}px;
            width: ${config.border * 2}px;
            height: ${config.border * 2}px;
            opacity: 0;
          }
          4.9% {
            top: ${config.center}px;
            left: ${config.center}px;
            width: ${config.border * 2}px;
            height: ${config.border * 2}px;
            opacity: 0;
          }
          5% {
            top: ${config.center}px;
            left: ${config.center}px;
            width: ${config.border * 2}px;
            height: ${config.border * 2}px;
            opacity: 1;
          }
          100% {
            top: 0;
            left: 0;
            width: ${config.container}px;
            height: ${config.container}px;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
      }
    };
  }, [config, styleId]);

  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        className,
      )}
    >
      {/* Ripple Animation */}
      <div
        className="relative inline-block"
        style={{
          width: `${config.container}px`,
          height: `${config.container}px`,
        }}
      >
        <div
          className="absolute rounded-full border-primary opacity-100"
          style={{
            borderWidth: `${config.border}px`,
            animation: `${styleId} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
          }}
        />
        <div
          className="absolute rounded-full border-primary opacity-100"
          style={{
            borderWidth: `${config.border}px`,
            animation: `${styleId} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
            animationDelay: "-0.5s",
          }}
        />
      </div>

      {message && (
        <p
          className={cn(
            "text-muted-foreground font-medium",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            size === "xl" && "text-lg",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
