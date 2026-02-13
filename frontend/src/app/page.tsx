import Link from "next/link";
import {
  IconBrain,
  IconDeviceGamepad2,
  IconUsers,
  IconBolt,
  IconArrowRight,
  IconStar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HomePage() {
  // Dummy stats for now; replace with API data as needed
  const stats = [
    { label: "Active Competitions", value: 5 },
    { label: "Total Quizzes Played", value: 123 },
    { label: "Total Users", value: 78 },
  ];

  const reviews = [
    {
      name: "Amit Sharma",
      role: "Teacher",
      text: "Super easy to use and perfect for our school quizzes! The real-time experience is amazing.",
      initials: "AS",
      rating: 5,
    },
    {
      name: "Priya Verma",
      role: "HR Manager",
      text: "We used this for a company event and everyone loved it. Minimal UI and works great on mobile.",
      initials: "PV",
      rating: 5,
    },
    {
      name: "Rahul Singh",
      role: "Student",
      text: "Best quiz platform I have tried. Fast, simple, and reliable.",
      initials: "RS",
      rating: 4,
    },
    {
      name: "Sneha Kapoor",
      role: "Quiz Host",
      text: "Hosting live quizzes is a breeze. The platform is intuitive and support is great!",
      initials: "SK",
      rating: 5,
    },
  ];

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

        {/* Stats Section */}
        <section className="container max-w-4xl mx-auto py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-2xl py-8 px-4 shadow-sm border border-gray-100 dark:border-neutral-800"
              >
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="container max-w-7xl mx-auto py-8">
          <h2 className="text-xl font-semibold mb-6 text-center">
            What users say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 flex flex-col gap-4 items-center text-center"
              >
                <Avatar size="lg" className="mb-2">
                  <AvatarFallback>{review.initials}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 justify-center mb-1">
                  {[...Array(review.rating)].map((_, idx) => (
                    <IconStar
                      key={idx}
                      className="h-4 w-4 text-yellow-400"
                      fill="#facc15"
                    />
                  ))}
                  {[...Array(5 - review.rating)].map((_, idx) => (
                    <IconStar key={idx} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
                <div className="text-muted-foreground text-sm italic">
                  "{review.text}"
                </div>
                <div className="flex flex-col items-center mt-2">
                  <span className="font-medium text-primary">
                    {review.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {review.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        {/* <section className="container max-w-7xl mx-auto py-20">
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
        </section> */}

        {/* CTA Section */}
        <section className="container max-w-7xl mx-auto py-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-500/10 via-gray-500/5 to-gray-500/5 p-12 md:p-16">
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
