"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, GraduationCap, LogIn, ShieldCheck, Sparkles } from "lucide-react";

import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryKeys } from "@/lib/server-state";

interface FormErrors {
  classId?: string;
  studentId?: string;
  password?: string;
  general?: string;
}

const trustNotes = [
  "Uses the same Class ID, Student ID, and password as the official ERP.",
  "Attendance syncs live from ERP after login and on refresh.",
  "Your ERP password is stored encrypted for secure re-sync access.",
];

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isNavigating, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    classId: "",
    studentId: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    void router.prefetch("/dashboard");
  }, [router]);

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!formData.classId.trim()) {
      nextErrors.classId = "Class ID is required";
    }

    if (!formData.studentId.trim()) {
      nextErrors.studentId = "Student ID is required";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: FormErrors = {};
          data.errors.forEach((error: { field: string; message: string }) => {
            fieldErrors[error.field as keyof FormErrors] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || "Login failed" });
        }
        return;
      }

      const redirectTo =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") || "/dashboard"
          : "/dashboard";

      queryClient.setQueryData(queryKeys.authMe, data.user);
      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previousState) => ({ ...previousState, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((previousState) => ({ ...previousState, [name]: undefined }));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-light-bg px-4 py-8 text-slate-text sm:px-6 lg:px-8">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-8">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(49,107,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_22%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="surface-panel-strong page-fade-in overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            <div className="hero-chip w-fit">
              <Sparkles className="h-3.5 w-3.5 text-academic-blue" />
              Smart login, smoother student flow
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-academic-blue to-blue-500 text-white shadow-[0_18px_35px_rgba(49,107,255,0.24)]">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-slate-950">Student ERP Login</p>
                  <p className="text-sm text-slate-500">One secure sign-in for the smarter MySVGU experience.</p>
                </div>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                MySVGU uses your official ERP credentials, then turns the raw data into a cleaner dashboard, a stronger student community, and a more useful campus AI flow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {trustNotes.map((note) => (
                <Card key={note} className="border-white/80 bg-white/90">
                  <CardContent className="p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-academic-blue">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/90 p-4 text-sm leading-6 text-blue-900">
              Tip: if your attendance was just refreshed in ERP, MySVGU will pick up the latest numbers as soon as the dashboard sync runs again.
            </div>
          </div>
        </div>

        <Card className="surface-panel-strong page-fade-in border-white/80 bg-white/92">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <p className="font-display text-3xl font-semibold text-slate-950">Welcome back</p>
                <p className="text-sm leading-6 text-slate-500">Enter your ERP credentials to continue into MySVGU.</p>
              </div>

              {errors.general ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.general}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="classId">Class ID</Label>
                <Input
                  id="classId"
                  name="classId"
                  placeholder="CI201"
                  value={formData.classId}
                  onChange={handleChange}
                  className={errors.classId ? "border-red-400 ring-red-100" : "bg-white/90"}
                />
                {errors.classId ? <p className="text-xs text-red-500">{errors.classId}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="23CI2010277"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={errors.studentId ? "border-red-400 ring-red-100" : "bg-white/90"}
                />
                {errors.studentId ? <p className="text-xs text-red-500">{errors.studentId}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">ERP Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your ERP password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-400 pr-12 ring-red-100" : "bg-white/90 pr-12"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? <p className="text-xs text-red-500">{errors.password}</p> : null}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading || isNavigating}>
                {isLoading || isNavigating ? "Signing you in..." : (
                  <span className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Continue to MySVGU
                  </span>
                )}
              </Button>

              <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm leading-6 text-slate-600">
                Faculty or admin? <Link href="/staff/login" className="font-semibold text-academic-blue hover:underline">Use staff login</Link>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <Link href="/landing" className="hover:text-academic-blue hover:underline">Back to home</Link>
                <Link href="/signup" className="hover:text-academic-blue hover:underline">Why is signup disabled?</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}