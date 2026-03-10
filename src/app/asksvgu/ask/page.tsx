"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Lightbulb, Plus, Sparkles, Tag } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const categories = ["Academic", "Assignment", "Exam", "Project", "Campus", "Other"];
const suggestedTags = [
  "Attendance",
  "DSA",
  "Java",
  "Python",
  "DBMS",
  "Networks",
  "Exam Prep",
  "Project Help",
  "Internship",
  "Campus Life",
];

interface FormErrors {
  title?: string;
  body?: string;
  general?: string;
}

export default function AskQuestionPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((value) => value !== tag)
        : [...previous, tag],
    );
  };

  const addCustomTag = () => {
    const normalized = customTag.trim();
    if (!normalized || selectedTags.includes(normalized)) {
      setCustomTag("");
      return;
    }

    setSelectedTags((previous) => [...previous, normalized]);
    setCustomTag("");
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Give your question a clear title.";
    } else if (title.trim().length < 10) {
      nextErrors.title = "Use at least 10 characters so others understand the problem fast.";
    }

    if (!description.trim()) {
      nextErrors.body = "Add enough context for someone to answer helpfully.";
    } else if (description.trim().length < 20) {
      nextErrors.body = "Use at least 20 characters and include the key details.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: description.trim(),
          category,
          tags: selectedTags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors)) {
          const nextErrors: FormErrors = {};
          data.errors.forEach((issue: { field: string; message: string }) => {
            if (issue.field === "title") {
              nextErrors.title = issue.message;
            }
            if (issue.field === "body") {
              nextErrors.body = issue.message;
            }
          });
          setErrors(nextErrors);
        } else {
          setErrors({ general: data.error || "Unable to publish the question right now." });
        }
        return;
      }

      toast({
        title: "Question posted",
        description: "Your thread is now live in AskSVGU.",
      });
      router.push(`/asksvgu/question/${data.question.id}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to create question:", error);
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <>
            <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
            AskSVGU posting studio
          </>
        }
        title="Turn a campus problem into a useful thread"
        description="Ask clearly, add context, and choose strong tags so the right classmates can spot your question quickly and helpfully."
        status={<StatusPill variant="live">Community posting live</StatusPill>}
        action={
          <Button asChild variant="outline">
            <Link href="/asksvgu">Back to feed</Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="border-white/85 bg-white/90">
          <CardContent className="p-6 sm:p-7">
            {!authLoading && !isAuthenticated ? (
              <div className="rounded-[1.35rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800">
                You need an active MySVGU session to post. Please <Link href="/login" className="font-semibold underline">sign in</Link> and come back.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general ? (
                <div className="rounded-[1.35rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errors.general}
                </div>
              ) : null}

              <div className="space-y-3">
                <label htmlFor="question-title" className="text-sm font-semibold text-slate-900">
                  Question title
                </label>
                <input
                  id="question-title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (errors.title) {
                      setErrors((previous) => ({ ...previous, title: undefined }));
                    }
                  }}
                  placeholder="Example: How do I recover attendance after missing two weeks of lab classes?"
                  className={`h-12 w-full rounded-[1.15rem] border bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white ${errors.title ? "border-red-300" : "border-slate-200"}`}
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{errors.title || "Make it specific enough that someone can decide to help instantly."}</span>
                  <span>{title.trim().length} characters</span>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="question-body" className="text-sm font-semibold text-slate-900">
                  Explain the situation
                </label>
                <Textarea
                  id="question-body"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    if (errors.body) {
                      setErrors((previous) => ({ ...previous, body: undefined }));
                    }
                  }}
                  rows={8}
                  placeholder="Share the course, semester, deadline, or exact issue. The more context you add, the better the answers get."
                  className={`rounded-[1.25rem] border bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white ${errors.body ? "border-red-300" : "border-slate-200"}`}
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{errors.body || "Helpful details beat short vague posts every time."}</span>
                  <span>{description.trim().length} characters</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item ? "border-academic-blue bg-academic-blue text-white shadow-[0_14px_26px_rgba(49,107,255,0.24)]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-900">Tags</label>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Optional but powerful</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${selectedTags.includes(tag) ? "border-blue-200 bg-blue-50 text-academic-blue" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={customTag}
                    onChange={(event) => setCustomTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomTag();
                      }
                    }}
                    placeholder="Add your own tag"
                    className="h-11 flex-1 rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                  />
                  <Button type="button" variant="outline" onClick={addCustomTag}>
                    <Tag className="h-4 w-4" />
                    Add tag
                  </Button>
                </div>
                {selectedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Posts become part of the real AskSVGU community and contribute to reputation once classmates respond.</p>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => router.push("/asksvgu")}>Cancel</Button>
                  <Button type="submit" disabled={submitting || !isAuthenticated}>
                    <Plus className="h-4 w-4" />
                    {submitting ? "Publishing..." : "Publish question"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/85 bg-white/90">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-academic-blue" />
                <CardTitle className="text-2xl text-slate-950">What gets better answers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-600">
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Name the course or context</p>
                <p className="mt-2">Mention the subject, lab, semester, or department so students who know the topic can jump in faster.</p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Describe what you already tried</p>
                <p className="mt-2">That saves time and makes replies more useful instead of repetitive.</p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Use tags like signposts</p>
                <p className="mt-2">Strong tags improve discovery in the feed, profile pages, and future student searches.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/85 bg-gradient-to-br from-slate-950 via-deep-blue to-academic-blue text-white">
            <CardContent className="space-y-4 p-6">
              <StatusPill variant="spotlight" className="border-white/20 bg-white/10 text-white">Community reputation</StatusPill>
              <h2 className="font-display text-2xl font-semibold">Every helpful post builds visible momentum</h2>
              <div className="space-y-3 text-sm leading-7 text-blue-100">
                <p>Ask a question: +5 reputation</p>
                <p>Post an answer: +10 reputation</p>
                <p>Helpful votes unlock badges and move you up the leaderboard.</p>
              </div>
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                <Link href="/asksvgu/leaderboard">
                  <Compass className="h-4 w-4" />
                  Explore leaderboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
