"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  DatabaseZap,
  GraduationCap,
  MessageSquareText,
  Shield,
  Users,
} from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalAnnouncements: number;
  totalQuestions: number;
  totalAnswers: number;
  cachedAttendanceCount: number;
}

interface RecentUser {
  id: string;
  name: string;
  studentId: string;
  role: string;
  createdAt: string;
}

function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () =>
      apiFetch<{ success: true; stats: AdminStats; recentUsers: RecentUser[] }>(
        "/api/admin/stats",
      ),
    staleTime: 30_000,
  });
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();
  const stats = data?.stats;
  const recentUsers = data?.recentUsers || [];

  const cards = [
    {
      label: "Total Students",
      value: stats?.totalStudents,
      icon: GraduationCap,
      color: "text-academic-blue",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Faculty & Admins",
      value: stats?.totalFaculty,
      icon: Shield,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Announcements",
      value: stats?.totalAnnouncements,
      icon: BellRing,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Community Questions",
      value: stats?.totalQuestions,
      icon: MessageSquareText,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/40",
    },
    {
      label: "Community Answers",
      value: stats?.totalAnswers,
      icon: Users,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/40",
    },
    {
      label: "Cached Attendance",
      value: stats?.cachedAttendanceCount,
      icon: DatabaseZap,
      color: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of MySVGU platform activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="border-white/85 bg-white/88 dark:border-slate-700/50 dark:bg-slate-800/60">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.bg}`}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {card.label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-8 w-16" />
                ) : (
                  <p className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">
                    {card.value ?? 0}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/85 bg-white/88 dark:border-slate-700/50 dark:bg-slate-800/60">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700/50">
          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
            Recently registered users
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-500">{u.studentId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill
                      variant={u.role === "ADMIN" ? "coming" : u.role === "FACULTY" ? "progress" : "live"}
                    >
                      {u.role}
                    </StatusPill>
                    <span className="text-xs text-slate-400">
                      {formatDate(u.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">No users yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
