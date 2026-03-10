import { NextResponse } from "next/server";

import { getAttendance } from "@/lib/attendance-sync";
import { getCurrentUser } from "@/lib/auth";
import { ErpWorkerError } from "@/lib/erpWorker";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        role: true,
        erpCredential: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Live attendance is only available for student accounts." },
        { status: 403 },
      );
    }

    if (!user.erpCredential) {
      return NextResponse.json(
        { error: "ERP credentials are missing. Please sign in again." },
        { status: 404 },
      );
    }

    const attendance = await getAttendance(authUser.userId, false);
    return NextResponse.json(attendance);
  } catch (error) {
    if (error instanceof ErpWorkerError) {
      const authUser = await getCurrentUser();

      if (authUser) {
        await prisma.erpCredential.updateMany({
          where: { userId: authUser.userId },
          data: {
            lastError: error.message,
          },
        });
      }

      const message =
        error.status === 401
          ? "Saved ERP credentials are no longer valid. Please sign in again."
          : "Attendance sync is temporarily unavailable. Please try again shortly.";

      return NextResponse.json(
        { error: message, code: error.code },
        { status: error.status === 401 ? 502 : 503 },
      );
    }

    console.error("Attendance sync error:", error);

    return NextResponse.json(
      { error: "Failed to fetch attendance." },
      { status: 500 },
    );
  }
}
