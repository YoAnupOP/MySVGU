"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  MessageCircle,
  PenSquare,
  Send,
  Sparkles,
} from "lucide-react";

import { CommunityBadges } from "@/components/community-badges";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ApiError, apiFetch } from "@/lib/api";
import type { QuestionAnswer, QuestionDetailResponse } from "@/lib/community-shared";
import { fetchQuestionDetail, queryKeys } from "@/lib/server-state";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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

function markTopSupported(answers: QuestionAnswer[]) {
  const topSupport = Math.max(...answers.map((answer) => answer.upvotes), 0);
  return answers.map((answer) => ({
    ...answer,
    isTopSupported: topSupport > 0 && answer.upvotes === topSupport,
  }));
}

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const questionId = params?.id;
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [answerDraft, setAnswerDraft] = useState("");
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);
  const [questionVoteLoading, setQuestionVoteLoading] = useState(false);
  const [answerVoteLoading, setAnswerVoteLoading] = useState<string | null>(null);

  const questionQuery = useQuery({
    queryKey: queryKeys.questionDetail(questionId || ""),
    queryFn: () => fetchQuestionDetail(questionId || ""),
    enabled: Boolean(questionId),
    staleTime: 15_000,
  });

  const data = questionQuery.data || null;
  const loading = questionQuery.isLoading;
  const error = questionQuery.error instanceof ApiError ? questionQuery.error.message : null;

  const updateThread = (
    updater: (previous: QuestionDetailResponse) => QuestionDetailResponse,
  ) => {
    if (!questionId) {
      return;
    }

    queryClient.setQueryData<QuestionDetailResponse | undefined>(
      queryKeys.questionDetail(questionId),
      (previous) => (previous ? updater(previous) : previous),
    );
  };

  const invalidateCommunityCaches = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.questions });
    void queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard });
    void queryClient.invalidateQueries({ queryKey: queryKeys.communityMeSummary });
  };

  const answerCountLabel = useMemo(() => {
    const count = data?.answers.length || 0;
    return `${count} ${count === 1 ? "answer" : "answers"}`;
  }, [data]);

  const handleQuestionVote = async (direction: "up" | "down") => {
    if (!questionId || !data || questionVoteLoading) {
      return;
    }

    setQuestionVoteLoading(true);

    try {
      const payload = await apiFetch<{
        success: true;
        vote: { upvotes: number; downvotes: number; userVote: "up" | "down" | null };
      }>(`/api/questions/${questionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });

      updateThread((previous) => ({
        ...previous,
        question: {
          ...previous.question,
          upvotes: payload.vote.upvotes,
          downvotes: payload.vote.downvotes,
          userVote: payload.vote.userVote,
        },
      }));
      invalidateCommunityCaches();
    } catch (voteError) {
      const description = voteError instanceof ApiError ? voteError.message : "Please try again in a moment.";
      toast({
        title: "Vote unavailable",
        description,
        variant: "destructive",
      });
    } finally {
      setQuestionVoteLoading(false);
    }
  };

  const handleAnswerVote = async (answerId: string, direction: "up" | "down") => {
    if (!data || answerVoteLoading === answerId) {
      return;
    }

    setAnswerVoteLoading(answerId);

    try {
      const payload = await apiFetch<{
        success: true;
        vote: { upvotes: number; downvotes: number; userVote: "up" | "down" | null };
      }>(`/api/answers/${answerId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });

      updateThread((previous) => ({
        ...previous,
        answers: markTopSupported(
          previous.answers.map((answer) =>
            answer.id === answerId
              ? {
                  ...answer,
                  upvotes: payload.vote.upvotes,
                  downvotes: payload.vote.downvotes,
                  userVote: payload.vote.userVote,
                }
              : answer,
          ),
        ),
      }));
      invalidateCommunityCaches();
    } catch (voteError) {
      const description = voteError instanceof ApiError ? voteError.message : "Please try again in a moment.";
      toast({
        title: "Vote unavailable",
        description,
        variant: "destructive",
      });
    } finally {
      setAnswerVoteLoading(null);
    }
  };

  const submitAnswer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!questionId) {
      return;
    }

    if (!answerDraft.trim()) {
      setAnswerError("Write an answer before posting.");
      return;
    }

    setSubmittingAnswer(true);
    setAnswerError(null);

    try {
      const payload = await apiFetch<{
        success: true;
        answer: Omit<QuestionAnswer, "userVote" | "isTopSupported">;
      }>(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answerDraft.trim() }),
      });

      updateThread((previous) => ({
        ...previous,
        question: {
          ...previous.question,
          answersCount: previous.question.answersCount + 1,
        },
        answers: markTopSupported([
          ...previous.answers,
          {
            ...payload.answer,
            userVote: null,
            isTopSupported: false,
          },
        ]),
      }));

      setAnswerDraft("");
      toast({
        title: "Answer posted",
        description: "Your reply is now part of this discussion.",
      });
      invalidateCommunityCaches();
    } catch (submitError) {
      if (submitError instanceof ApiError && Array.isArray(submitError.data?.errors)) {
        const firstIssue = (submitError.data.errors as Array<{ message?: string }>)[0]?.message;
        setAnswerError(firstIssue || submitError.message);
      } else {
        setAnswerError(submitError instanceof ApiError ? submitError.message : "Unable to post answer right now.");
      }
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const submitComment = async (answerId: string) => {
    const content = (commentDrafts[answerId] || "").trim();
    if (!content) {
      return;
    }

    setSubmittingCommentId(answerId);

    try {
      const payload = await apiFetch<{
        success: true;
        comment: QuestionAnswer["comments"][number];
      }>(`/api/answers/${answerId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      updateThread((previous) => ({
        ...previous,
        answers: previous.answers.map((answer) =>
          answer.id === answerId
            ? {
                ...answer,
                comments: [...answer.comments, payload.comment],
              }
            : answer,
        ),
      }));
      setCommentDrafts((previous) => ({ ...previous, [answerId]: "" }));
    } catch (commentError) {
      const description = commentError instanceof ApiError ? commentError.message : "Please try again in a moment.";
      toast({
        title: "Comment unavailable",
        description,
        variant: "destructive",
      });
    } finally {
      setSubmittingCommentId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-[220px] w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  if (!data || error) {
    return (
      <Card className="border-white/85 bg-white/90">
        <CardContent className="p-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-slate-950">Thread unavailable</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">{error || "We could not load this question."}</p>
          <Button asChild className="mt-5">
            <Link href="/asksvgu">Back to AskSVGU</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <>
            <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
            AskSVGU thread
          </>
        }
        title={data.question.title}
        description="A real question thread with live voting, real answers, real comments, and author reputation carried across the entire community experience."
        status={<StatusPill variant="live">{answerCountLabel}</StatusPill>}
        action={
          <Button asChild variant="outline">
            <Link href="#answer-form">
              <PenSquare className="h-4 w-4" />
              Write an answer
            </Link>
          </Button>
        }
      />

      <Card className="border-white/85 bg-white/90">
        <CardContent className="space-y-6 p-6 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="flex gap-2 lg:w-[92px] lg:flex-col">
              <button
                onClick={() => handleQuestionVote("up")}
                disabled={questionVoteLoading || !isAuthenticated}
                className={cn(
                  "inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  data.question.userVote === "up"
                    ? "border-blue-200 bg-blue-50 text-academic-blue"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                {data.question.upvotes}
              </button>
              <button
                onClick={() => handleQuestionVote("down")}
                disabled={questionVoteLoading || !isAuthenticated}
                className={cn(
                  "inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  data.question.userVote === "down"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                {data.question.downvotes}
              </button>
            </div>

            <div className="min-w-0 flex-1 space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <Link href={`/asksvgu/user/${data.question.author.id}`} className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                    <AvatarImage src={data.question.author.avatarUrl || undefined} alt={data.question.author.name} />
                    <AvatarFallback className="bg-blue-50 text-academic-blue">{initials(data.question.author.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">{data.question.author.name}</p>
                    <p className="text-sm text-slate-500">{data.question.author.profile}</p>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {answerCountLabel}</span>
                  <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {data.question.views} views</span>
                  <span>{formatRelative(data.question.createdAt)}</span>
                </div>
              </div>

              <CommunityBadges badges={data.question.author.badges} />

              <p className="whitespace-pre-wrap text-sm leading-8 text-slate-700">{data.question.body}</p>

              <div className="flex flex-wrap gap-2">
                {data.question.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <div className="space-y-4">
          {data.answers.length > 0 ? (
            data.answers.map((answer) => (
              <Card
                key={answer.id}
                className={cn(
                  "border-white/85 bg-white/90",
                  answer.isTopSupported && "border-blue-200 shadow-[0_18px_45px_rgba(49,107,255,0.12)]",
                )}
              >
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                        <AvatarImage src={answer.author.avatarUrl || undefined} alt={answer.author.name} />
                        <AvatarFallback className="bg-blue-50 text-academic-blue">{initials(answer.author.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/asksvgu/user/${answer.author.id}`} className="font-semibold text-slate-900 hover:text-academic-blue">
                          {answer.author.name}
                        </Link>
                        <p className="text-sm text-slate-500">{answer.author.profile}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {answer.isTopSupported ? <StatusPill variant="live">Top supported</StatusPill> : null}
                      <StatusPill variant="progress">{formatRelative(answer.createdAt)}</StatusPill>
                    </div>
                  </div>

                  <CommunityBadges badges={answer.author.badges} limit={3} />

                  <p className="whitespace-pre-wrap text-sm leading-8 text-slate-700">{answer.content}</p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAnswerVote(answer.id, "up")}
                      disabled={answerVoteLoading === answer.id || !isAuthenticated}
                      className={cn(
                        "inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                        answer.userVote === "up"
                          ? "border-blue-200 bg-blue-50 text-academic-blue"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <ArrowUp className="mr-2 h-4 w-4" />
                      {answer.upvotes}
                    </button>
                    <button
                      onClick={() => handleAnswerVote(answer.id, "down")}
                      disabled={answerVoteLoading === answer.id || !isAuthenticated}
                      className={cn(
                        "inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                        answer.userVote === "down"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      {answer.downvotes}
                    </button>
                  </div>

                  <div className="space-y-3 rounded-[1.25rem] bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">Discussion</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{answer.comments.length} comments</p>
                    </div>

                    {answer.comments.length > 0 ? (
                      <div className="space-y-3">
                        {answer.comments.map((comment) => (
                          <div key={comment.id} className="rounded-[1rem] border border-slate-200 bg-white p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Link href={`/asksvgu/user/${comment.author.id}`} className="font-semibold text-slate-900 hover:text-academic-blue">
                                {comment.author.name}
                              </Link>
                              <span className="text-slate-400">/</span>
                              <span className="text-slate-500">{formatRelative(comment.createdAt)}</span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No comments yet. Start a short follow-up or clarification.</p>
                    )}

                    {isAuthenticated ? (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          value={commentDrafts[answer.id] || ""}
                          onChange={(event) => setCommentDrafts((previous) => ({ ...previous, [answer.id]: event.target.value }))}
                          placeholder="Add a useful comment"
                          className="h-11 flex-1 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-academic-blue"
                        />
                        <Button type="button" variant="outline" disabled={submittingCommentId === answer.id} onClick={() => submitComment(answer.id)}>
                          <Send className="h-4 w-4" />
                          {submittingCommentId === answer.id ? "Posting..." : "Comment"}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-white/85 bg-white/90">
              <CardContent className="p-8 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h2 className="font-display text-2xl font-semibold text-slate-950">No answers yet</h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">Be the first person to turn this question into something useful for the next student.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card id="answer-form" className="border-white/85 bg-white/90 scroll-mt-24">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="text-2xl text-slate-950">Write an answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {isAuthenticated ? (
                <form onSubmit={submitAnswer} className="space-y-4">
                  <Textarea
                    value={answerDraft}
                    onChange={(event) => {
                      setAnswerDraft(event.target.value);
                      if (answerError) {
                        setAnswerError(null);
                      }
                    }}
                    rows={8}
                    placeholder="Share a practical answer, relevant steps, and any campus-specific detail that will actually help."
                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-academic-blue focus:bg-white"
                  />
                  {answerError ? <p className="text-sm text-red-600">{answerError}</p> : null}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submittingAnswer}>
                      <PenSquare className="h-4 w-4" />
                      {submittingAnswer ? "Posting..." : "Post answer"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-800">
                  Sign in to answer or vote on this thread. Your contribution will count toward real AskSVGU reputation.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/85 bg-white/90">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="text-2xl text-slate-950">What stands out here</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-600">
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Best-supported answers rise visually</p>
                <p className="mt-2">The strongest answer is highlighted so students can scan faster without losing the rest of the discussion.</p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Identity stays consistent</p>
                <p className="mt-2">Badges, reputation, and profile links stay attached to every answer and comment so the community feels trustworthy.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}