import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "FACULTY")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        classId: true,
        studentId: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            semester: true,
            course: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role || !["STUDENT", "FACULTY", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid userId or role" },
        { status: 400 },
      );
    }

    if (userId === authUser.userId) {
      return NextResponse.json(
        { error: "You cannot change your own role." },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, role: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Admin role update error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
