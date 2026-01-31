import Link from "next/link";
import { IconBrain } from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconBrain className="h-4 w-4" />
          <span>QuizLive © {new Date().getFullYear()}</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link
            href="/auth/login"
            className="hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="hover:text-foreground transition-colors"
          >
            Register
          </Link>
        </nav>
      </div>
    </footer>
  );
}
