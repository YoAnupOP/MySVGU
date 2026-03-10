"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, MessageCircle, Sparkles, Trophy } from "lucide-react";

import { CommunityBadges } from "@/components/community-badges";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { fetchCommunityUserProfile, queryKeys } from "@/lib/server-state";

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

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const profileQuery = useQuery({
    queryKey: queryKeys.communityUser(id || ""),
    queryFn: () => fetchCommunityUserProfile(id || ""),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

  const data = profileQuery.data || null;
  const loading = profileQuery.isLoading;
  const error = profileQuery.error instanceof ApiError ? profileQuery.error.message : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      </div>
    );
  }

  if (!data || error) {
    return (
      <Card className="border-white/85 bg-white/90">
        <CardContent className="p-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-slate-950">Profile unavailable</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">{error || "We could not find this contributor."}</p>
          <Button asChild className="mt-5">
            <Link href="/asksvgu">Back to AskSVGU</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { profile, questions, answers } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <>
            <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
            Community profile
          </>
        }
        title={profile.user.name}
        description="A real AskSVGU profile with earned reputation, visible badges, and recent contribution history across questions and answers."
        status={<StatusPill variant="live">{profile.rank ? `Rank #${profile.rank}` : "Contributor"}</StatusPill>}
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/asksvgu">Back to feed</Link>
            </Button>
            <Button asChild>
              <Link href="/asksvgu/leaderboard">Leaderboard</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <Card className="border-white/85 bg-white/90">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-premium">
                  <AvatarImage src={profile.user.avatarUrl || undefined} alt={profile.user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-academic-blue to-blue-500 text-lg font-semibold text-white">
                    {initials(profile.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-display text-3xl font-semibold text-slate-950">{profile.user.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{profile.user.profile}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{profile.user.studentId}</p>
                </div>
              </div>

              <CommunityBadges badges={profile.badges} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reputation</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{profile.reputation}</p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rank</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{profile.rank ? `#${profile.rank}` : "-"}</p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Questions</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{profile.questionsCount}</p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Answers</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{profile.answersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/85 bg-white/90">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-academic-blue" />
                <CardTitle className="text-2xl text-slate-950">Contribution snapshot</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-600">
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Badge visibility is real</p>
                <p className="mt-2">This profile uses the same derived badges shown in leaderboard cards, feed previews, and question threads.</p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Reputation is server-derived</p>
                <p className="mt-2">The score updates from actual questions, answers, and votes instead of client-side demo data.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/85 bg-white/90">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-slate-950">Recent questions</CardTitle>
                  <p className="mt-2 text-sm text-slate-500">The latest threads this student started.</p>
                </div>
                <StatusPill variant="progress">{questions.length} listed</StatusPill>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {questions.length > 0 ? (
                questions.map((question) => (
                  <Link
                    key={question.id}
                    href={`/asksvgu/question/${question.id}`}
                    className="block rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{question.title}</h3>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{question.category} / {formatRelative(question.createdAt)}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>{question.upvotes} upvotes</span>
                      <span>{question.answersCount} answers</span>
                      <span>{question.views} views</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No questions posted yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/85 bg-white/90">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl text-slate-950">Recent answers</CardTitle>
                  <p className="mt-2 text-sm text-slate-500">Useful replies this student has contributed.</p>
                </div>
                <StatusPill variant="progress">{answers.length} listed</StatusPill>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {answers.length > 0 ? (
                answers.map((answer) => (
                  <Link
                    key={answer.id}
                    href={`/asksvgu/question/${answer.questionId}`}
                    className="block rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Answer on</p>
                        <h3 className="mt-1 font-semibold text-slate-900">{answer.questionTitle}</h3>
                      </div>
                      <MessageCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{answer.content}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>{answer.upvotes} upvotes</span>
                      <span>{answer.downvotes} downvotes</span>
                      <span>{formatRelative(answer.createdAt)}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No answers posted yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}