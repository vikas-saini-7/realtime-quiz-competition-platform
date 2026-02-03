import { cn } from "@/lib/utils";

interface AnimatedBrainProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

export function AnimatedBrain({ size = "md", className }: AnimatedBrainProps) {
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Left hemisphere */}
        <path
          d="M25 50C25 35 30 25 40 20C45 17 50 15 50 15C50 15 50 20 48 25C46 30 45 35 45 40C45 50 50 55 50 60"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          className="text-primary animate-pulse"
          style={{ animationDuration: "2s", animationDelay: "0s" }}
        />

        {/* Right hemisphere */}
        <path
          d="M75 50C75 35 70 25 60 20C55 17 50 15 50 15C50 15 50 20 52 25C54 30 55 35 55 40C55 50 50 55 50 60"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          className="text-primary animate-pulse"
          style={{ animationDuration: "2s", animationDelay: "0.2s" }}
        />

        {/* Left curves */}
        <path
          d="M30 35C28 38 27 42 28 46C29 50 32 53 35 54"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="text-primary animate-pulse"
          style={{ animationDuration: "2s", animationDelay: "0.4s" }}
        />

        {/* Right curves */}
        <path
          d="M70 35C72 38 73 42 72 46C71 50 68 53 65 54"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="text-primary animate-pulse"
          style={{ animationDuration: "2s", animationDelay: "0.6s" }}
        />

        {/* Center connection */}
        <path
          d="M50 60C50 65 48 70 45 73M50 60C50 65 52 70 55 73"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          className="text-primary animate-pulse"
          style={{ animationDuration: "2s", animationDelay: "0.8s" }}
        />

        {/* Neurons - animated dots */}
        <circle
          cx="35"
          cy="30"
          r="2"
          fill="currentColor"
          className="text-primary animate-ping"
          style={{ animationDuration: "1.5s", animationDelay: "0s" }}
        />
        <circle
          cx="50"
          cy="25"
          r="2"
          fill="currentColor"
          className="text-primary animate-ping"
          style={{ animationDuration: "1.5s", animationDelay: "0.3s" }}
        />
        <circle
          cx="65"
          cy="30"
          r="2"
          fill="currentColor"
          className="text-primary animate-ping"
          style={{ animationDuration: "1.5s", animationDelay: "0.6s" }}
        />
      </svg>
    </div>
  );
}
