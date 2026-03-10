import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { announcementSchema } from "@/lib/validations";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "FACULTY")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error("Admin announcements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "FACULTY")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = announcementSchema.safeParse(body);

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

    const { title, content, priority, department, targetProgram, targetSemester } =
      result.data;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority: priority || "normal",
        department,
        targetProgram,
        targetSemester,
        postedById: authUser.userId,
      },
      include: {
        postedBy: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "FACULTY")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 },
      );
    }

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
