"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUp,
  Eye,
  Filter,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";

import { CommunityBadges } from "@/components/community-badges";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchLeaderboard, fetchQuestions, queryKeys } from "@/lib/server-state";

const courseTabs = ["All", "BCA", "B.Tech", "BBA", "MBA", "B.Com"] as const;
type CourseTab = typeof courseTabs[number];

const filterOptions = ["Recent", "Most Voted", "Unanswered"] as const;
type FilterOption = typeof filterOptions[number];

export default function AskFeedPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState<CourseTab>("All");
  const [filter, setFilter] = useState<FilterOption>("Recent");
  const deferredQuery = useDeferredValue(query);

  const questionsQuery = useQuery({
    queryKey: queryKeys.questions,
    queryFn: fetchQuestions,
    staleTime: 60_000,
  });
  const leaderboardQuery = useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: fetchLeaderboard,
    staleTime: 60_000,
  });

  const questions = questionsQuery.data || [];
  const leaderboard = leaderboardQuery.data || [];
  const loading = questionsQuery.isLoading || leaderboardQuery.isLoading;

  const displayed = useMemo(() => {
    let data = [...questions];

    if (deferredQuery.trim()) {
      const normalizedQuery = deferredQuery.toLowerCase();
      data = data.filter((item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
      );
    }

    if (course !== "All") {
      data = data.filter((item) => item.author.course === course);
    }

    if (filter === "Most Voted") {
      data.sort((left, right) => right.upvotes - left.upvotes);
    } else if (filter === "Unanswered") {
      data = data.filter((item) => item.answersCount === 0);
    }

    return data;
  }, [questions, deferredQuery, course, filter]);

  const communityPulse = useMemo(
    () => ({
      questions: questions.length,
      answers: questions.reduce((total, question) => total + question.answersCount, 0),
      topReputation: leaderboard[0]?.reputation || 0,
    }),
    [questions, leaderboard],
  );

  const featuredQuestion = displayed[0];
  const remainingQuestions = displayed.slice(1);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-[560px] w-full" />
          <Skeleton className="h-[560px] w-full" />
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
            AskSVGU community is live
          </>
        }
        title="Ask smarter. Answer faster. Build your campus reputation."
        description="AskSVGU turns student questions into a real community loop with visible contribution, better profiles, and enough momentum to make MySVGU worth returning to every day."
        status={<StatusPill variant="live">Community live</StatusPill>}
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/asksvgu/ask">
                <Plus className="h-4 w-4" />
                Ask question
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/asksvgu/leaderboard">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="border-white/85 bg-white/90">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Questions</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{communityPulse.questions}</p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Answers</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{communityPulse.answers}</p>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Top reputation</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-950">{communityPulse.topReputation}</p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search questions, concepts, tags, and common problems..."
                    className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-academic-blue focus:bg-white"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setFilter(option)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        filter === option
                          ? "border-academic-blue bg-blue-50 text-academic-blue"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {courseTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCourse(tab)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      tab === course
                        ? "border-academic-blue bg-academic-blue text-white shadow-[0_12px_24px_rgba(49,107,255,0.18)]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {displayed.length === 0 ? (
            <Card className="border-white/85 bg-white/90">
              <CardContent className="p-10 text-center">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h3 className="font-display text-2xl font-semibold text-slate-950">No questions match yet</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Try another search, change the filter, or be the first one to ask about it.
                </p>
                <Button className="mt-5" onClick={() => router.push("/asksvgu/ask")}>
                  <Plus className="h-4 w-4" />
                  Ask a question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {featuredQuestion ? (
                <Card className="border-white/85 bg-gradient-to-br from-slate-950 via-deep-blue to-academic-blue text-white">
                  <CardContent className="space-y-5 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <StatusPill variant="spotlight" className="border-white/20 bg-white/10 text-white">
                          Featured discussion
                        </StatusPill>
                        <Link href={`/asksvgu/question/${featuredQuestion.id}`} className="mt-4 block font-display text-3xl font-semibold leading-tight text-white">
                          {featuredQuestion.title}
                        </Link>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">{featuredQuestion.description}</p>
                      </div>
                      <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                        <Link href={`/asksvgu/question/${featuredQuestion.id}`}>Open thread</Link>
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
                      <span className="font-semibold">{featuredQuestion.author.name}</span>
                      <span>{featuredQuestion.author.profile}</span>
                      <span>{formatTime(featuredQuestion.createdAt)}</span>
                    </div>
                    <CommunityBadges badges={featuredQuestion.author.badges} />
                    <div className="flex flex-wrap gap-2">
                      {featuredQuestion.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-white/85">
                      <span className="inline-flex items-center gap-1.5"><ArrowUp className="h-4 w-4" /> {featuredQuestion.upvotes}</span>
                      <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {featuredQuestion.answersCount}</span>
                      <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {featuredQuestion.views}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {remainingQuestions.map((question) => (
                  <Card key={question.id} className="border-white/85 bg-white/90 transition duration-200 hover:-translate-y-1 hover:shadow-premium">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{question.author.name}</p>
                          <p className="text-xs text-slate-500">{question.author.profile}</p>
                        </div>
                        <StatusPill variant="progress">{formatTime(question.createdAt)}</StatusPill>
                      </div>
                      <CommunityBadges badges={question.author.badges} limit={2} />
                      <Link href={`/asksvgu/question/${question.id}`} className="block space-y-2">
                        <h3 className="font-display text-xl font-semibold text-slate-950">{question.title}</h3>
                        <p className="line-clamp-3 text-sm leading-7 text-slate-600">{question.description}</p>
                      </Link>
                      <div className="flex flex-wrap gap-2">
                        {question.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center gap-1.5"><ArrowUp className="h-4 w-4" /> {question.upvotes}</span>
                          <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {question.answersCount}</span>
                          <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {question.views}</span>
                        </div>
                        <Link href={`/asksvgu/question/${question.id}`} className="font-semibold text-academic-blue hover:underline">
                          Explore
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-white/85 bg-white/90">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-academic-blue" />
                <CardTitle className="text-2xl text-slate-950">Top contributors</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {leaderboard.slice(0, 5).map((entry) => (
                <Link
                  key={entry.userId}
                  href={`/asksvgu/user/${entry.userId}`}
                  className="block rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-100 hover:bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-academic-blue shadow-sm">
                      #{entry.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{entry.name}</p>
                          <p className="text-xs text-slate-500">{entry.profile}</p>
                        </div>
                        <p className="font-display text-2xl font-semibold text-slate-950">{entry.reputation}</p>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Reputation</p>
                      <CommunityBadges badges={entry.badges} className="mt-3" limit={2} />
                    </div>
                  </div>
                </Link>
              ))}
              <Button asChild variant="outline" className="w-full">
                <Link href="/asksvgu/leaderboard">View full leaderboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/85 bg-white/90">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="text-2xl text-slate-950">How AskSVGU works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-600">
              <p>AskSVGU is where campus questions become answers, answers become reputation, and reputation becomes visible community trust.</p>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Earn points for helpful contribution</p>
                <p className="mt-2">Questions, answers, and received votes all build your profile momentum.</p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Unlock badge visibility</p>
                <p className="mt-2">Your contribution style becomes visible across feeds, threads, and the leaderboard.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}