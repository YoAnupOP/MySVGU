"use client";

import { useMemo } from "react";
import { CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import StudentShell from "@/components/student-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Session {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  code: string;
  room: string;
  faculty: string;
  classType: "lecture" | "lab" | "tutorial";
}

const sessions: Session[] = [
  { id: 1, day: "Monday", startTime: "09:00", endTime: "10:30", subject: "Mathematics", code: "MATH301", room: "A101", faculty: "Dr. Smith", classType: "lecture" },
  { id: 2, day: "Monday", startTime: "11:00", endTime: "12:30", subject: "Physics", code: "PHY302", room: "B202", faculty: "Prof. Johnson", classType: "lecture" },
  { id: 3, day: "Tuesday", startTime: "10:00", endTime: "12:00", subject: "Programming Lab", code: "CS303", room: "Lab 1", faculty: "Prof. Davis", classType: "lab" },
  { id: 4, day: "Wednesday", startTime: "09:00", endTime: "10:30", subject: "Data Structures", code: "CS304", room: "C103", faculty: "Dr. Wilson", classType: "lecture" },
  { id: 5, day: "Thursday", startTime: "14:00", endTime: "15:00", subject: "Tutorial", code: "MATH301", room: "A201", faculty: "TA John", classType: "tutorial" },
  { id: 6, day: "Friday", startTime: "12:00", endTime: "13:00", subject: "Computer Networks", code: "CS305", room: "C205", faculty: "Prof. Patel", classType: "lecture" },
];

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function typeVariant(type: Session["classType"]) {
  if (type === "lab") {
    return "live" as const;
  }
  if (type === "tutorial") {
    return "coming" as const;
  }
  return "progress" as const;
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export default function TimetablePage() {
  const todayName = days[new Date().getDay()];
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const groupedByDay = useMemo(() => {
    return days.reduce<Record<string, Session[]>>((accumulator, day) => {
      accumulator[day] = sessions.filter((session) => session.day === day);
      return accumulator;
    }, {});
  }, []);

  const todaySessions = groupedByDay[todayName] || [];

  const nextSession = useMemo(() => {
    const todayUpcoming = todaySessions.find((session) => toMinutes(session.startTime) >= nowMinutes);
    if (todayUpcoming) {
      return todayUpcoming;
    }

    const startIndex = days.indexOf(todayName);
    for (let offset = 1; offset <= 7; offset += 1) {
      const day = days[(startIndex + offset) % days.length];
      const nextDaySession = groupedByDay[day]?.[0];
      if (nextDaySession) {
        return nextDaySession;
      }
    }

    return null;
  }, [groupedByDay, nowMinutes, todayName, todaySessions]);

  const upcomingThisWeek = useMemo(() => {
    return days
      .slice(days.indexOf(todayName) + 1)
      .flatMap((day) => groupedByDay[day] || [])
      .slice(0, 4);
  }, [groupedByDay, todayName]);

  return (
    <StudentShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow={
            <>
              <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
              Planner-first timetable preview
            </>
          }
          title="A timetable that feels more like a daily planner"
          description="The live ERP timetable connection is still pending, but the student experience is already redesigned around today, next, and upcoming instead of a crowded generic grid."
          status={<StatusPill variant="progress">ERP sync pending</StatusPill>}
        />

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <Card className="border-white/85 bg-gradient-to-br from-slate-950 via-deep-blue to-academic-blue text-white">
              <CardContent className="space-y-4 p-6">
                <StatusPill variant="spotlight" className="border-white/20 bg-white/10 text-white">Today / Next / Upcoming</StatusPill>
                <h2 className="font-display text-3xl font-semibold">Cleaner planning, even before the ERP sync lands</h2>
                <p className="text-sm leading-7 text-blue-100">This card shows the intended direction: quick scanning, obvious next action, and less visual overload on mobile.</p>
              </CardContent>
            </Card>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-academic-blue" />
                  <CardTitle className="text-2xl text-slate-950">Next class</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {nextSession ? (
                  <div className="rounded-[1.35rem] bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill variant={typeVariant(nextSession.classType)}>{nextSession.classType}</StatusPill>
                      <StatusPill variant="spotlight">{nextSession.day}</StatusPill>
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold text-slate-950">{nextSession.subject}</h3>
                    <p className="mt-1 text-sm text-slate-500">{nextSession.code} / {nextSession.faculty}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> {nextSession.startTime} - {nextSession.endTime}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {nextSession.room}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-slate-300 p-6 text-sm text-slate-500">No upcoming class preview is available.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-academic-blue" />
                  <CardTitle className="text-2xl text-slate-950">Upcoming this week</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {upcomingThisWeek.length > 0 ? (
                  upcomingThisWeek.map((session) => (
                    <div key={session.id} className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{session.subject}</p>
                          <p className="mt-1 text-sm text-slate-500">{session.code} / {session.day}</p>
                        </div>
                        <StatusPill variant={typeVariant(session.classType)}>{session.classType}</StatusPill>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                        <span>{session.startTime} - {session.endTime}</span>
                        <span>{session.room}</span>
                        <span>{session.faculty}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-300 p-6 text-sm text-slate-500">No additional classes are scheduled later this week.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl text-slate-950">Today</CardTitle>
                    <p className="mt-2 text-sm text-slate-500">{todayName} plan, formatted for quick scanning on mobile first.</p>
                  </div>
                  <StatusPill variant="progress">Preview mode</StatusPill>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {todaySessions.length > 0 ? (
                  todaySessions.map((session) => (
                    <div key={session.id} className="rounded-[1.35rem] border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-display text-2xl font-semibold text-slate-950">{session.subject}</p>
                          <p className="mt-1 text-sm text-slate-500">{session.code} / {session.faculty}</p>
                        </div>
                        <StatusPill variant={typeVariant(session.classType)}>{session.classType}</StatusPill>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1rem] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Time</p>
                          <p className="mt-1 font-semibold text-slate-900">{session.startTime} - {session.endTime}</p>
                        </div>
                        <div className="rounded-[1rem] bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Room</p>
                          <p className="mt-1 font-semibold text-slate-900">{session.room}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-slate-300 p-6 text-sm text-slate-500">No classes are listed for today in this preview.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/85 bg-white/90">
              <CardHeader className="border-b border-slate-100 pb-5">
                <CardTitle className="text-2xl text-slate-950">Week overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
                {days.slice(1, 6).map((day) => (
                  <div key={day} className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{day}</p>
                      <span className="text-sm text-slate-500">{groupedByDay[day]?.length || 0} classes</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-500">
                      {(groupedByDay[day] || []).slice(0, 2).map((session) => (
                        <p key={session.id}>{session.startTime} / {session.subject}</p>
                      ))}
                      {(groupedByDay[day] || []).length === 0 ? <p>No classes</p> : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}