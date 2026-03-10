import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { createToken, setAuthCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { staffLoginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = staffLoginSchema.safeParse(body);

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

    const { classId, studentId, password } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        classId,
        studentId,
        role: {
          in: ["FACULTY", "ADMIN"],
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
        classId: true,
        studentId: true,
        localPasswordHash: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid staff credentials." },
        { status: 401 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.localPasswordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid staff credentials." },
        { status: 401 },
      );
    }

    const token = await createToken({
      userId: user.id,
      role: user.role,
      name: user.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Staff login successful",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        classId: user.classId,
        studentId: user.studentId,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Staff login error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
