import Link from "next/link";
import { GraduationCap, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-10 w-10 text-academic-blue" />
          </div>
          <CardTitle className="text-2xl text-slate-text">Signup is Disabled</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            MySVGU student accounts now come directly from the official ERP login, so there is no separate public signup anymore.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-medium mb-1">Students</p>
            <p>Use your ERP Class ID, Student ID, and password on the student login page.</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium mb-1 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Faculty and admin
            </p>
            <p>Staff accounts are provisioned internally and continue to use the dedicated staff login page.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button className="bg-academic-blue hover:bg-deep-blue text-white">Student ERP Login</Button>
            </Link>
            <Link href="/staff/login">
              <Button variant="outline">Staff Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
