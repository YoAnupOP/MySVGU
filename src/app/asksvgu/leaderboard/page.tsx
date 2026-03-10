"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, MessageCircle, Sparkles, Trophy } from "lucide-react";

import { CommunityBadges } from "@/components/community-badges";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchLeaderboard, queryKeys } from "@/lib/server-state";

const reputationRules = [
  "Ask a question: +5",
  "Post an answer: +10",
  "Question upvote received: +2",
  "Answer upvote received: +5",
  "Helpful activity unlocks badges and rank visibility.",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LeaderboardPage() {
  const leaderboardQuery = useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: fetchLeaderboard,
    staleTime: 60_000,
  });

  const leaderboard = leaderboardQuery.data || [];
  const loading = leaderboardQuery.isLoading;
  const podium = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const rest = useMemo(() => leaderboard.slice(3), [leaderboard]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <>
            <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
            Real reputation and badges
          </>
        }
        title="Campus contributors students actually recognize"
        description="The AskSVGU leaderboard is now derived from real questions, answers, and vote activity, so helpful contributions show up consistently across the whole student experience."
        status={<StatusPill variant="live">Leaderboard live</StatusPill>}
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/asksvgu/ask">Ask question</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/asksvgu">Back to feed</Link>
            </Button>
          </div>
        }
      />

      {leaderboard.length === 0 ? (
        <Card className="border-white/85 bg-white/90">
          <CardContent className="p-10 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="font-display text-2xl font-semibold text-slate-950">The leaderboard will light up soon</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">Once students start asking and answering, reputation and badge momentum will appear here automatically.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              {podium.map((entry, index) => (
                <Card
                  key={entry.userId}
                  className={`border-white/85 ${index === 0 ? "bg-gradient-to-br from-slate-950 via-deep-blue to-academic-blue text-white" : "bg-white/90"}`}
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <StatusPill variant={index === 0 ? "spotlight" : "progress"} className={index === 0 ? "border-white/20 bg-white/10 text-white" : undefined}>
                        Rank #{entry.rank}
                      </StatusPill>
                      <Award className={`h-5 w-5 ${index === 0 ? "text-white" : "text-academic-blue"}`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 ring-4 ring-white/60">
                        <AvatarImage src={entry.avatarUrl || undefined} alt={entry.name} />
                        <AvatarFallback className={index === 0 ? "bg-white/15 text-white" : "bg-blue-50 text-academic-blue"}>
                          {initials(entry.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`font-semibold ${index === 0 ? "text-white" : "text-slate-900"}`}>{entry.name}</p>
                        <p className={`text-xs ${index === 0 ? "text-blue-100" : "text-slate-500"}`}>{entry.profile}</p>
                      </div>
                    </div>
                    <div>
                      <p className={`font-display text-4xl font-semibold ${index === 0 ? "text-white" : "text-slate-950"}`}>{entry.reputation}</p>
                      <p className={`text-xs uppercase tracking-[0.18em] ${index === 0 ? "text-blue-100" : "text-slate-500"}`}>Reputation</p>
                    </div>
                    <div className={`grid grid-cols-2 gap-3 rounded-[1.2rem] p-3 ${index === 0 ? "bg-white/10" : "bg-slate-50"}`}>
                      <div>
                        <p className={`text-xs uppercase tracking-[0.18em] ${index === 0 ? "text-blue-100" : "text-slate-500"}`}>Questions</p>
                        <p className={`mt-1 text-lg font-semibold ${index === 0 ? "text-white" : "text-slate-900"}`}>{entry.questionsCount}</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-[0.18em] ${index === 0 ? "text-blue-100" : "text-slate-500"}`}>Answers</p>
                        <p className={`mt-1 text-lg font-semibold ${index === 0 ? "text-white" : "text-slate-900"}`}>{entry.answersCount}</p>
                      </div>
                    </div>
                    <CommunityBadges badges={entry.badges} />
                    <Button asChild variant={index === 0 ? "outline" : "secondary"} className={index === 0 ? "border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" : undefined}>
                      <Link href={`/asksvgu/user/${entry.userId}`}>View profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-academic-blue" />
                  <CardTitle className="text-2xl text-slate-950">Full rankings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {rest.map((entry) => (
                  <Link
                    key={entry.userId}
                    href={`/asksvgu/user/${entry.userId}`}
                    className="block rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white font-semibold text-academic-blue shadow-sm">
                        #{entry.rank}
                      </div>
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={entry.avatarUrl || undefined} alt={entry.name} />
                        <AvatarFallback className="bg-blue-50 text-academic-blue">{initials(entry.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{entry.name}</p>
                            <p className="text-xs text-slate-500">{entry.profile}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-display text-2xl font-semibold text-slate-950">{entry.reputation}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reputation</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span>{entry.questionsCount} questions</span>
                          <span>{entry.answersCount} answers</span>
                        </div>
                        <CommunityBadges badges={entry.badges} className="mt-3" limit={3} />
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-academic-blue" />
                  <CardTitle className="text-2xl text-slate-950">How ranking works</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-6 text-sm leading-7 text-slate-600">
                {reputationRules.map((rule) => (
                  <div key={rule} className="rounded-[1.25rem] bg-slate-50 p-4">
                    {rule}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="text-2xl text-slate-950">Why this matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-600">
                <p>AskSVGU is meant to reward useful student contribution, not just collect posts. Real reputation gives identity to the people who consistently help others.</p>
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Badges are server-derived</p>
                  <p className="mt-2">The same badges shown here appear on feed cards, question threads, and profile pages, so the system feels trustworthy and consistent.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}