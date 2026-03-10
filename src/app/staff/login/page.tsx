"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";

import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormErrors {
  classId?: string;
  studentId?: string;
  password?: string;
  general?: string;
}

export default function StaffLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    classId: "",
    studentId: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/staff/login", {
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
          setErrors({ general: data.error || "Staff login failed" });
        }
        return;
      }

      const redirectTo = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirect") || "/admin"
        : "/admin";
      router.push(redirectTo);
      router.refresh();
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
    <div className="relative min-h-screen bg-light-bg flex items-center justify-center px-4 py-8">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-10 w-10 text-academic-blue" />
          </div>
          <CardTitle className="text-xl text-slate-text">Staff Login</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Faculty and admin users continue to use their local MySVGU credentials here.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="classId">Organization ID</Label>
              <Input id="classId" name="classId" value={formData.classId} onChange={handleChange} />
              {errors.classId && <p className="text-red-500 text-xs">{errors.classId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Staff ID</Label>
              <Input id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} />
              {errors.studentId && <p className="text-red-500 text-xs">{errors.studentId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full bg-academic-blue hover:bg-deep-blue text-white" disabled={isLoading}>
              {isLoading ? "Signing in..." : (
                <span className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" /> Sign In
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="hover:underline">Back to student ERP login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
