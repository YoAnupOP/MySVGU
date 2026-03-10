import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

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
        name: true,
        role: true,
        studentId: true,
        classId: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);

    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const result = profileSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 },
      );
    }

    const { name, enrollmentNo, classId, semester, course } = result.data;

    await prisma.user.update({
      where: { id: authUser.userId },
      data: { name },
    });

    const profile = await prisma.profile.upsert({
      where: { userId: authUser.userId },
      update: {
        enrollmentNo,
        classId,
        semester,
        course,
      },
      create: {
        userId: authUser.userId,
        enrollmentNo,
        classId,
        semester,
        course,
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
