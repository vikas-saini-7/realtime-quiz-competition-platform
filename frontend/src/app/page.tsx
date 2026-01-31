import Link from "next/link";
import {
  IconBrain,
  IconDeviceGamepad2,
  IconUsers,
  IconBolt,
  IconArrowRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container flex flex-col items-center justify-center gap-8 py-20 md:py-32 text-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium">
            <IconBolt className="h-4 w-4" />
            Real-time quiz competitions
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
            Host and Join Live{" "}
            <span className="text-primary">Quiz Competitions</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Create engaging quizzes, invite participants, and compete in
            real-time. Perfect for classrooms, corporate training, or just fun
            with friends.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/auth/register">
                Get Started
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/play/browse">Browse Live Quizzes</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-20 border-t">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <IconBrain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Create Quizzes</h3>
              <p className="text-muted-foreground">
                Build quizzes with multiple choice questions, set time limits,
                and customize scoring rules.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <IconUsers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Invite Participants</h3>
              <p className="text-muted-foreground">
                Share a link or QR code for participants to join. Works on any
                device with a browser.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <IconDeviceGamepad2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Compete Live</h3>
              <p className="text-muted-foreground">
                Answer questions in real-time, climb the leaderboard, and see
                results instantly.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20 border-t">
          <div className="flex flex-col items-center text-center gap-6">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="text-muted-foreground max-w-md">
              Create your first quiz in minutes and invite participants to join
              the competition.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/auth/register?role=HOST">Host a Quiz</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/register?role=USER">Join as Player</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
