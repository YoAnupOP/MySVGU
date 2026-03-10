"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  Clock3,
  RefreshCw,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { CommunityBadges } from "@/components/community-badges";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import StudentShell from "@/components/student-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import {
  fetchAnnouncements,
  fetchCommunitySummary,
  fetchDashboardAttendance,
  refreshDashboardAttendance,
  queryKeys,
} from "@/lib/server-state";

const buddyPrompts = [
  "What should I focus on this week?",
  "Summarize important announcements for me",
  "How can I improve my attendance quickly?",
];

const formatDate = (value: string | Date) => {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const announcementsQuery = useQuery({
    queryKey: queryKeys.announcements,
    queryFn: fetchAnnouncements,
    staleTime: 60_000,
  });

  const communityQuery = useQuery({
    queryKey: queryKeys.communityMeSummary,
    queryFn: fetchCommunitySummary,
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const attendanceQuery = useQuery({
    queryKey: queryKeys.dashboardAttendance(user?.studentId),
    queryFn: fetchDashboardAttendance,
    enabled: !authLoading && user?.role === "STUDENT",
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
  });

  const refreshMutation = useMutation({
    mutationFn: refreshDashboardAttendance,
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.dashboardAttendance(user?.studentId),
        data,
      );
    },
  });

  const announcements = announcementsQuery.data || [];
  const communityProfile = communityQuery.data || null;
  const attendance = attendanceQuery.data || null;
  const attendanceError =
    attendanceQuery.error instanceof ApiError ? attendanceQuery.error.message : null;
  const loadingAnnouncements = announcementsQuery.isLoading;
  const loadingCommunity = communityQuery.isLoading;
  const loadingAttendance = attendanceQuery.isLoading;
  const refreshingAttendance = refreshMutation.isPending;

  const userName = user?.name || "Student";
  const userRole = user?.role || "STUDENT";
  const attendancePercentage = attendance?.overall.percentage || 0;
  const showStudentAttendance = userRole === "STUDENT";
  const userInitials = userName
    .split(" ")
    .map((namePart) => namePart[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const cards = useMemo(
    () => [
      {
        key: "attendance",
        title: "Attendance",
        description: attendance
          ? `${attendance.overall.present}/${attendance.overall.total} classes attended`
          : "Live from official ERP",
        icon: CalendarCheck,
        status: showStudentAttendance ? "live" : "progress",
      },
      {
        key: "cgpa",
        title: "CGPA",
        description: "ERP connection is in progress",
        icon: TrendingUp,
        status: "progress",
      },
      {
        key: "fees",
        title: "Fees / Results",
        description: "Keeping equal space while data sync is being connected",
        icon: WalletCards,
        status: "coming",
      },
    ],
    [attendance, showStudentAttendance],
  );

  if (authLoading) {
    return (
      <StudentShell>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </StudentShell>
    );
  }

  return (
    <StudentShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow={
            <>
              <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
              ERP-backed campus workspace
            </>
          }
          title={`Welcome back, ${userName}`}
          description={
            showStudentAttendance
              ? "Your attendance sync is now live from the official ERP, while MySVGU keeps the rest of student life smoother, smarter, and much easier to scan."
              : `Logged in as ${userRole}. Student-facing polish is now centered around the dashboard, AskSVGU, and SVGU AI.`
          }
          status={
            <StatusPill variant={showStudentAttendance ? "live" : "progress"}>
              {showStudentAttendance ? "Live sync" : "Local mode"}
            </StatusPill>
          }
          action={
            showStudentAttendance ? (
              <Button
                variant="outline"
                onClick={() => {
                  refreshMutation.mutate();
                }}
                disabled={refreshingAttendance || loadingAttendance}
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshingAttendance ? "animate-spin" : ""}`}
                />
                Refresh attendance
              </Button>
            ) : null
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {cards.map((card) => (
                <Card key={card.key} className="page-fade-in border-white/85 bg-white/88">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-academic-blue">
                        <card.icon className="h-5 w-5" />
                      </div>
                      <StatusPill variant={card.status as "live" | "progress" | "coming"}>
                        {card.status === "live"
                          ? "Live"
                          : card.status === "progress"
                            ? "In progress"
                            : "Coming next"}
                      </StatusPill>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {card.title}
                      </p>
                      {card.key === "attendance" ? (
                        loadingAttendance ? (
                          <Skeleton className="h-10 w-24" />
                        ) : attendance ? (
                          <div>
                            <p className="font-display text-4xl font-semibold text-slate-950">
                              {attendancePercentage}%
                            </p>
                            <p className="mt-1 text-sm text-slate-500">{card.description}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-display text-2xl font-semibold text-slate-900">
                              Unavailable
                            </p>
                            <p className="mt-1 text-sm text-slate-500">{card.description}</p>
                          </div>
                        )
                      ) : (
                        <div>
                          <p className="font-display text-2xl font-semibold text-slate-900">
                            {card.key === "cgpa" ? "Not connected yet" : "Coming next"}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {card.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {card.key === "attendance" && attendance ? (
                      <div className="space-y-2">
                        <Progress value={attendancePercentage} />
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Official ERP source
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>

            {attendanceError ? (
              <Card className="border-red-200 bg-red-50/90">
                <CardContent className="flex items-start gap-3 p-5 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Attendance sync is temporarily unavailable.</p>
                    <p className="mt-1">{attendanceError}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="border-white/85 bg-white/90">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <StatusPill variant="spotlight">AskSVGU momentum</StatusPill>
                      <CardTitle className="mt-3 text-2xl text-slate-950">
                        Community energy that keeps MySVGU sticky
                      </CardTitle>
                    </div>
                    <Button asChild variant="outline" className="hidden sm:inline-flex">
                      <Link href="/asksvgu">
                        Open AskSVGU
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {loadingCommunity ? (
                    <>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-12 w-3/4" />
                    </>
                  ) : communityProfile ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-[1.35rem] bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Reputation
                          </p>
                          <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
                            {communityProfile.reputation}
                          </p>
                        </div>
                        <div className="rounded-[1.35rem] bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Rank
                          </p>
                          <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
                            {communityProfile.rank ? `#${communityProfile.rank}` : "-"}
                          </p>
                        </div>
                        <div className="rounded-[1.35rem] bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Answers
                          </p>
                          <p className="mt-2 font-display text-3xl font-semibold text-slate-950">
                            {communityProfile.answersCount}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700">Unlocked badges</p>
                        <CommunityBadges badges={communityProfile.badges} />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button asChild>
                          <Link href="/asksvgu/ask">Ask a question</Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href="/asksvgu/leaderboard">See leaderboard</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-[1.35rem] border border-dashed border-slate-300 p-5 text-sm leading-7 text-slate-500">
                      AskSVGU activity will start showing up here once you ask, answer, and earn your first reputation points.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/85 bg-gradient-to-br from-slate-950 via-deep-blue to-academic-blue text-white">
                <CardContent className="space-y-5 p-6">
                  <div>
                    <StatusPill variant="spotlight" className="border-white/20 bg-white/15 text-white">
                      Campus Buddy
                    </StatusPill>
                    <h2 className="mt-4 font-display text-2xl font-semibold">
                      SVGU AI now feels like a student-side copilot.
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-blue-100">
                      Use the AI buddy for planning, announcement summaries, and quick campus guidance without leaving your student shell.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {buddyPrompts.map((prompt) => (
                      <Link
                        key={prompt}
                        href={`/chatbot?prompt=${encodeURIComponent(prompt)}`}
                        className="block rounded-[1.2rem] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90 transition hover:bg-white/15"
                      >
                        {prompt}
                      </Link>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                    <Link href="/chatbot">Open SVGU AI</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <StatusPill variant="spotlight">Subject breakdown</StatusPill>
                    <CardTitle className="mt-3 text-2xl text-slate-950">
                      Subject-wise attendance
                    </CardTitle>
                  </div>
                  {attendance ? (
                    <StatusPill variant="live">Updated {formatDate(attendance.lastSyncedAt || attendance.fetchedAt)}</StatusPill>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {loadingAttendance ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : attendance?.subjects.length ? (
                  attendance.subjects.map((subject) => (
                    <div key={subject.name} className="rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-4">
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{subject.name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {subject.present}/{subject.total} classes attended
                          </p>
                        </div>
                        <StatusPill variant={subject.percentage >= 75 ? "live" : subject.percentage >= 50 ? "progress" : "coming"}>
                          {subject.percentage}%
                        </StatusPill>
                      </div>
                      <Progress value={subject.percentage} />
                    </div>
                  ))
                ) : showStudentAttendance ? (
                  <div className="rounded-[1.35rem] border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    No live attendance data is available yet.
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    Subject-level ERP attendance appears here for student accounts.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 text-center">
                <Avatar className="mx-auto mb-4 h-20 w-20 ring-4 ring-white shadow-premium">
                  <AvatarImage src={user?.profile?.avatarUrl} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-academic-blue to-blue-500 text-lg font-semibold text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl text-slate-950">{userName}</CardTitle>
                <p className="text-sm text-slate-500">{user?.studentId || "Student profile"}</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-500">Student ID</span>
                  <span className="font-semibold text-slate-900">{user?.studentId || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-500">Class ID</span>
                  <span className="font-semibold text-slate-900">
                    {user?.classId || user?.profile?.classId || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-500">Course</span>
                  <span className="font-semibold text-slate-900">
                    {user?.profile?.course || "Pending ERP sync"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-500">Semester</span>
                  <span className="font-semibold text-slate-900">
                    {user?.profile?.semester || "Pending ERP sync"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-academic-blue" />
                  <CardTitle className="text-xl text-slate-950">Sync status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-6 text-sm leading-7 text-slate-600">
                {attendance ? (
                  <>
                    <p>
                      Source:{" "}
                      <span className="font-semibold text-slate-900">
                        {attendance.source === "cache" ? "Cached" : "Official ERP"}
                      </span>
                    </p>
                    <p>
                      Last synced:{" "}
                      <span className="font-semibold text-slate-900">
                        {formatDate(attendance.lastSyncedAt || attendance.fetchedAt)}
                      </span>
                    </p>
                  </>
                ) : (
                  <p>Attendance will refresh from ERP after login and whenever you tap refresh.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-academic-blue" />
                  <CardTitle className="text-xl text-slate-950">Latest updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {loadingAnnouncements ? (
                  <Skeleton className="h-24 w-full" />
                ) : announcements.length > 0 ? (
                  announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-slate-900">{announcement.title}</h4>
                        <StatusPill variant={announcement.priority === "high" ? "coming" : "progress"}>
                          {announcement.priority || "normal"}
                        </StatusPill>
                      </div>
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">{announcement.content}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {announcement.department || "General"} / {formatDate(announcement.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[1.25rem] border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                    No announcements yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}