"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BellRing,
  Building2,
  CalendarDays,
  Megaphone,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import StudentShell from "@/components/student-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ApiError, apiFetch } from "@/lib/api";
import { fetchAnnouncements, queryKeys, type Announcement } from "@/lib/server-state";

interface FormState {
  title: string;
  content: string;
  priority: string;
  department: string;
  targetProgram: string;
  targetSemester: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  general?: string;
}

const initialFormState: FormState = {
  title: "",
  content: "",
  priority: "normal",
  department: "",
  targetProgram: "",
  targetSemester: "",
};

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return "Just now";
  }
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  return date.toLocaleDateString();
}

function priorityVariant(priority: string) {
  if (priority === "high") {
    return "coming" as const;
  }
  if (priority === "low") {
    return "spotlight" as const;
  }
  return "progress" as const;
}

export default function AnnouncementsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showComposer, setShowComposer] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const canCreateAnnouncement = user?.role === "FACULTY" || user?.role === "ADMIN";

  const announcementsQuery = useQuery({
    queryKey: queryKeys.announcements,
    queryFn: fetchAnnouncements,
    staleTime: 60_000,
  });

  const announcements = announcementsQuery.data || [];
  const loading = announcementsQuery.isLoading;

  const featuredAnnouncements = useMemo(
    () => announcements.filter((item) => item.priority === "high").slice(0, 2),
    [announcements],
  );
  const regularAnnouncements = useMemo(
    () => announcements.filter((item) => !featuredAnnouncements.some((featured) => featured.id === item.id)),
    [announcements, featuredAnnouncements],
  );

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    if (!form.title.trim()) {
      nextErrors.title = "A title is required.";
    } else if (form.title.trim().length < 5) {
      nextErrors.title = "Use at least 5 characters.";
    }
    if (!form.content.trim()) {
      nextErrors.content = "Content is required.";
    } else if (form.content.trim().length < 10) {
      nextErrors.content = "Use at least 10 characters.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitAnnouncement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const payload = await apiFetch<{
        success: true;
        announcement: Announcement;
      }>("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      queryClient.setQueryData<Announcement[]>(queryKeys.announcements, (previous = []) => [
        payload.announcement,
        ...previous,
      ]);
      setForm(initialFormState);
      setShowComposer(false);
      toast({
        title: "Announcement published",
        description: "Students can now see the update in the announcements stream.",
      });
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.data?.errors)) {
        const nextErrors: FormErrors = {};
        (error.data.errors as Array<{ field?: string; message?: string }>).forEach((issue) => {
          if (issue.field === "title") {
            nextErrors.title = issue.message;
          }
          if (issue.field === "content") {
            nextErrors.content = issue.message;
          }
        });
        setErrors(nextErrors);
      } else {
        setErrors({ general: error instanceof ApiError ? error.message : "Network error. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <StudentShell>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-[520px] w-full" />
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
              Editorial campus updates
            </>
          }
          title="Announcements that are easier to scan and trust"
          description="MySVGU now presents updates in a cleaner editorial flow, with clearer priority, department context, and calmer reading rhythm across mobile and desktop."
          status={<StatusPill variant="live">Updates live</StatusPill>}
          action={
            canCreateAnnouncement ? (
              <Button onClick={() => setShowComposer((previous) => !previous)}>
                {showComposer ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showComposer ? "Close composer" : "New announcement"}
              </Button>
            ) : undefined
          }
        />

        {showComposer && canCreateAnnouncement ? (
          <Card className="border-blue-200 bg-white/92">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="text-2xl text-slate-950">Publish a new announcement</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={submitAnnouncement} className="space-y-5">
                {errors.general ? (
                  <div className="rounded-[1.25rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errors.general}</div>
                ) : null}
                <div className="space-y-2">
                  <label htmlFor="announcement-title" className="text-sm font-semibold text-slate-900">Title</label>
                  <input
                    id="announcement-title"
                    value={form.title}
                    onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                    className="h-12 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                    placeholder="e.g. Mid-sem practical submission window is now open"
                  />
                  {errors.title ? <p className="text-sm text-red-600">{errors.title}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="announcement-content" className="text-sm font-semibold text-slate-900">Content</label>
                  <Textarea
                    id="announcement-content"
                    value={form.content}
                    onChange={(event) => setForm((previous) => ({ ...previous, content: event.target.value }))}
                    rows={6}
                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                    placeholder="Share the update, important dates, and what students should do next."
                  />
                  {errors.content ? <p className="text-sm text-red-600">{errors.content}</p> : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(event) => setForm((previous) => ({ ...previous, priority: event.target.value }))}
                      className="h-12 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Department</label>
                    <input
                      value={form.department}
                      onChange={(event) => setForm((previous) => ({ ...previous, department: event.target.value }))}
                      className="h-12 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                      placeholder="Academic Office"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Program</label>
                    <input
                      value={form.targetProgram}
                      onChange={(event) => setForm((previous) => ({ ...previous, targetProgram: event.target.value }))}
                      className="h-12 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                      placeholder="BCA"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">Semester</label>
                    <input
                      value={form.targetSemester}
                      onChange={(event) => setForm((previous) => ({ ...previous, targetSemester: event.target.value }))}
                      className="h-12 w-full rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                      placeholder="4"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    <Megaphone className="h-4 w-4" />
                    {submitting ? "Publishing..." : "Publish announcement"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : announcements.length === 0 ? (
          <Card className="border-white/85 bg-white/90">
            <CardContent className="p-10 text-center">
              <BellRing className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h2 className="font-display text-2xl font-semibold text-slate-950">No updates yet</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">Announcements will appear here once faculty or admin publish them.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              {featuredAnnouncements.length > 0 ? (
                <Card className="border-white/85 bg-gradient-to-br from-slate-950 via-deep-blue to-academic-blue text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-white" />
                      <CardTitle className="text-2xl text-white">Priority updates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    {featuredAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="rounded-[1.35rem] border border-white/15 bg-white/10 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill variant="spotlight" className="border-white/20 bg-white/10 text-white">{announcement.department || "General"}</StatusPill>
                          <StatusPill variant="spotlight" className="border-white/20 bg-white/10 text-white">High priority</StatusPill>
                        </div>
                        <h2 className="mt-4 font-display text-2xl font-semibold text-white">{announcement.title}</h2>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-blue-100">{announcement.content}</p>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
                          <span>{formatRelative(announcement.createdAt)}</span>
                          {announcement.postedBy ? <span>{announcement.postedBy.name}</span> : null}
                          {announcement.targetProgram ? <span>{announcement.targetProgram}</span> : null}
                          {announcement.targetSemester ? <span>Semester {announcement.targetSemester}</span> : null}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              <Card className="border-white/85 bg-white/90">
                <CardHeader className="border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-academic-blue" />
                    <CardTitle className="text-2xl text-slate-950">Latest updates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {regularAnnouncements.map((announcement) => (
                    <article key={announcement.id} className="rounded-[1.35rem] border border-slate-100 bg-slate-50/80 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <StatusPill variant={priorityVariant(announcement.priority)}>{announcement.priority || "normal"}</StatusPill>
                            <StatusPill variant="spotlight">{announcement.department || "General"}</StatusPill>
                          </div>
                          <h3 className="mt-4 font-display text-2xl font-semibold text-slate-950">{announcement.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500">{formatRelative(announcement.createdAt)}</p>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{announcement.content}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                        {announcement.postedBy ? <span>Posted by {announcement.postedBy.name}</span> : null}
                        {announcement.targetProgram ? <span>{announcement.targetProgram}</span> : null}
                        {announcement.targetSemester ? <span>Semester {announcement.targetSemester}</span> : null}
                      </div>
                    </article>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-white/85 bg-white/90">
                <CardHeader className="border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-academic-blue" />
                    <CardTitle className="text-2xl text-slate-950">Why this view feels better</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-600">
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Priority is obvious without feeling noisy</p>
                    <p className="mt-2">Important updates get spotlight treatment while routine notices stay easy to scan in the list below.</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Department context travels with the post</p>
                    <p className="mt-2">Students can tell quickly whether an update came from academics, accounts, or another university office.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StudentShell>
  );
}