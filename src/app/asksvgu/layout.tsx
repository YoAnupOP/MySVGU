import type { Metadata } from "next";

import StudentShell from "@/components/student-shell";

export const metadata: Metadata = {
  title: "AskSVGU | MySVGU",
  description: "A modern student Q&A and reputation hub inside MySVGU.",
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return <StudentShell containerClassName="max-w-6xl">{children}</StudentShell>;
}
