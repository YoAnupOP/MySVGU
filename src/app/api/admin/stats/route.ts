import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "FACULTY")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalAnnouncements,
      totalQuestions,
      totalAnswers,
      recentUsers,
      cachedAttendanceCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: { in: ["FACULTY", "ADMIN"] } } }),
      prisma.announcement.count(),
      prisma.question.count(),
      prisma.answer.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          studentId: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.attendanceSnapshot.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalAnnouncements,
        totalQuestions,
        totalAnswers,
        cachedAttendanceCount,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}
