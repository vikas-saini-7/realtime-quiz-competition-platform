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
        <section className="container max-w-7xl mx-auto flex flex-col items-center justify-center gap-8 py-20 md:py-32 text-center">
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
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/join">
                Join Quiz
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/host/dashboard">Host Quiz Competition</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container max-w-7xl mx-auto py-20 bg-muted/10 dark:bg-muted/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for{" "}
              <span className="text-primary">live competitions</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete platform designed for real-time quiz competitions with
              powerful features and seamless experience
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="group flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-card hover:shadow-lg transition-all">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <IconBrain className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Create Quizzes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Build engaging quizzes with multiple choice questions, set time
                limits, and customize scoring rules to match your needs
              </p>
            </div>

            <div className="group flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-card hover:shadow-lg transition-all">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <IconUsers className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Invite Participants</h3>
              <p className="text-muted-foreground leading-relaxed">
                Share a simple code or QR code for instant access. Works
                seamlessly on any device with a browser
              </p>
            </div>

            <div className="group flex flex-col items-center text-center gap-4 p-8 rounded-2xl bg-card hover:shadow-lg transition-all">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <IconDeviceGamepad2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Compete Live</h3>
              <p className="text-muted-foreground leading-relaxed">
                Answer questions in real-time, climb the leaderboard, and see
                results instantly with live updates
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container max-w-7xl mx-auto py-24 bg-muted/10 dark:bg-muted/5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-12 md:p-16">
            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <IconBolt className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  Start for Free
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold max-w-2xl">
                Ready to host your first quiz competition?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Create engaging quizzes in minutes and invite participants to
                join the fun. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button asChild size="lg" className="rounded-xl">
                  <Link href="/auth/register">
                    Create a Quiz
                    <IconArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                >
                  <Link href="/join">Join a Quiz</Link>
                </Button>
              </div>
            </div>
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
