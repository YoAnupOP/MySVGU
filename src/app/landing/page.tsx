"use client";

import Link from "next/link";
import {
  Bot,
  CalendarDays,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const spotlightFeatures = [
  {
    title: "Live attendance, finally readable",
    description: "Pull attendance from the official ERP, then present it in a dashboard students actually want to revisit.",
    icon: TrendingUp,
    accent: "text-academic-blue",
  },
  {
    title: "AskSVGU as the student USP",
    description: "Turn doubts, answers, badges, and leaderboard momentum into a real campus community loop.",
    icon: MessageSquareText,
    accent: "text-violet-600",
  },
  {
    title: "SVGU AI with buddy energy",
    description: "A smart campus companion for quick help, nudges, and smoother daily student life.",
    icon: Bot,
    accent: "text-emerald-600",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-light-bg text-slate-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(49,107,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(113,92,255,0.12),transparent_24%)]" />

      <header className="relative z-10 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-academic-blue to-blue-500 text-white shadow-[0_18px_35px_rgba(49,107,255,0.28)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-slate-900">MySVGU</p>
              <p className="text-xs text-slate-500">Smart student super-app</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle iconOnly />
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/staff/login">Staff login</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Student ERP login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6 page-fade-in">
            <div className="hero-chip w-fit">
              <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
              Built for students, not for outdated ERP screens
            </div>
            <div className="space-y-5">
              <h1 className="font-display text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                MySVGU makes campus life feel clear, social, and smooth.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Sign in with your official ERP credentials, track live attendance, ask smarter questions, and use a campus AI buddy that actually feels modern.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">Continue as student</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/asksvgu">Explore AskSVGU</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-panel px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Attendance</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Live ERP sync</p>
              </div>
              <div className="surface-panel px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Community</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Ask, answer, rank</p>
              </div>
              <div className="surface-panel px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Campus buddy help</p>
              </div>
            </div>
          </div>

          <div className="surface-panel-strong relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-academic-blue/15 via-blue-400/15 to-violet-400/15" />
            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Official ERP credentials stay encrypted
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-950">Why students switch to MySVGU</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The official ERP gives the data. MySVGU turns that data into a calm dashboard, a useful community, and a smoother everyday student flow.
                </p>
              </div>
              <div className="space-y-4">
                {spotlightFeatures.map((feature) => (
                  <Card key={feature.title} className="border-white/80 bg-white/90">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50">
                        <feature.icon className={`h-5 w-5 ${feature.accent}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          <Card className="border-blue-100 bg-white/88">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-academic-blue">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-slate-900">Attendance that feels actionable</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Readability, subject breakdowns, refresh feedback, and sync status that make ERP data feel useful instead of intimidating.</p>
            </CardContent>
          </Card>
          <Card className="border-violet-100 bg-white/88">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-slate-900">A community students return to</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">AskSVGU becomes a real social-academic loop with reputation, badges, profiles, and visible contribution energy.</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-white/88">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-slate-900">One polished student workspace</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Timetable, updates, and AI stay in one smart shell so students stop hopping across disconnected tools.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
