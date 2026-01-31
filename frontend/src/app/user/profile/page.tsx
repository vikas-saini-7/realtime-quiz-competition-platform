"use client";

import { formatDistanceToNow } from "date-fns";
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconShield,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store";
import { useMyAttempts } from "@/hooks";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: attempts, isLoading } = useMyAttempts();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const totalQuizzes = attempts?.length || 0;
  const completedQuizzes = attempts?.filter((a) => a.completedAt)?.length || 0;
  const totalScore = attempts?.reduce((sum, a) => sum + a.totalScore, 0) || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
              <IconUser className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <Badge variant={user.role === "HOST" ? "default" : "secondary"}>
                {user.role}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <IconMail className="h-5 w-5 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <IconShield className="h-5 w-5 text-muted-foreground" />
              <span>
                {user.role === "HOST"
                  ? "Can create and host quizzes"
                  : "Can participate in quizzes"}
              </span>
            </div>
            {user.createdAt && (
              <div className="flex items-center gap-3">
                <IconCalendar className="h-5 w-5 text-muted-foreground" />
                <span>
                  Joined{" "}
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-3xl font-bold">{totalQuizzes}</p>
                <p className="text-sm text-muted-foreground">Quizzes Joined</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-3xl font-bold">{completedQuizzes}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-3xl font-bold">
                  {totalScore.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
