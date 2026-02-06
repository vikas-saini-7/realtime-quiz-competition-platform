"use client";

import { useRouter } from "next/navigation";
import {
  IconPlus,
  IconBrain,
  IconUsers,
  IconTrophy,
  IconChartBar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMyQuizzes } from "@/hooks";
import { useAuthStore } from "@/store";

export default function HostDashboardPage() {
  const router = useRouter();
  const { data: quizzes, isLoading } = useMyQuizzes();
  const user = useAuthStore((state) => state.user);

  const firstName = user?.name?.split(" ")[0] || "";

  const stats = {
    totalQuizzes: quizzes?.length || 0,
    liveQuizzes: quizzes?.filter((q) => q.status === "LIVE").length || 0,
    draftQuizzes: quizzes?.filter((q) => q.status === "DRAFT").length || 0,
    completedQuizzes:
      quizzes?.filter((q) => q.status === "COMPLETED").length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome Back{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here's an overview of your quiz platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-white dark:bg-gray-500/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10">
              <IconBrain className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalQuizzes}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-500/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
              <IconUsers className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Live Quizzes</p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : stats.liveQuizzes}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-500/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/10">
              <IconChartBar className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft Quizzes</p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : stats.draftQuizzes}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-500/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
              <IconTrophy className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : stats.completedQuizzes}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-white dark:bg-gray-500/10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            onClick={() => router.push("/host/quizzes")}
            variant="outline"
            className="justify-start h-auto py-4"
          >
            <IconBrain className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">View All Quizzes</div>
              <div className="text-xs text-muted-foreground">
                Manage your quiz library
              </div>
            </div>
          </Button>

          <Button
            onClick={() => router.push("/host/quizzes")}
            variant="outline"
            className="justify-start h-auto py-4"
          >
            <IconPlus className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Create New Quiz</div>
              <div className="text-xs text-muted-foreground">
                Start building a quiz
              </div>
            </div>
          </Button>

          <Button
            onClick={() => router.push("/host/settings")}
            variant="outline"
            className="justify-start h-auto py-4"
          >
            <IconChartBar className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Settings</div>
              <div className="text-xs text-muted-foreground">
                Configure your account
              </div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}
