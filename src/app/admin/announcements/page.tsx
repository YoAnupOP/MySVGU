"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus, Trash2 } from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  department?: string;
  targetProgram?: string;
  targetSemester?: string;
  createdAt: string;
  postedBy: { name: string; role: string };
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [department, setDepartment] = useState("");

  const announcementsQuery = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: () =>
      apiFetch<{ success: true; announcements: Announcement[] }>(
        "/api/admin/announcements",
      ),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      priority: string;
      department?: string;
    }) =>
      apiFetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      setOpen(false);
      setTitle("");
      setContent("");
      setPriority("normal");
      setDepartment("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/announcements?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
  });

  const announcements = announcementsQuery.data?.announcements || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create & manage campus announcements visible to all students.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create announcement</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  title,
                  content,
                  priority,
                  department: department || undefined,
                });
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="ann-title">Title</Label>
                <Input
                  id="ann-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="End-semester exam schedule released"
                  required
                  minLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ann-content">Content</Label>
                <Textarea
                  id="ann-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the announcement in detail..."
                  required
                  minLength={10}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ann-dept">Department</Label>
                  <Input
                    id="ann-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSE, General"
                  />
                </div>
              </div>
              {createMutation.isError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Failed to create announcement. Please try again.
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Publishing..." : "Publish"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-white/85 bg-white/88 dark:border-slate-700/50 dark:bg-slate-800/60">
        <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-700/50">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
            All announcements ({announcements.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {announcementsQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="group rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/50 dark:bg-slate-800/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {ann.title}
                        </h3>
                        <StatusPill
                          variant={
                            ann.priority === "high"
                              ? "coming"
                              : ann.priority === "low"
                                ? "live"
                                : "progress"
                          }
                        >
                          {ann.priority}
                        </StatusPill>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                        {ann.content}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>By {ann.postedBy.name}</span>
                        {ann.department && <span>Dept: {ann.department}</span>}
                        <span>{formatDate(ann.createdAt)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-slate-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                      onClick={() => deleteMutation.mutate(ann.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No announcements yet. Create the first one!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
