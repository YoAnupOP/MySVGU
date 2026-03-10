"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminShell from "@/components/admin-shell";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "ADMIN" && user.role !== "FACULTY"))) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-academic-blue border-t-transparent" />
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "FACULTY")) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
