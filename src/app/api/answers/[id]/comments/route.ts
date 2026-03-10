import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCommunityProfileMap, toAuthorSummary } from "@/lib/community";
import prisma from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";

const communityUserSelect = {
  id: true,
  name: true,
  studentId: true,
  role: true,
  profile: {
    select: {
      avatarUrl: true,
      course: true,
      semester: true,
      classId: true,
    },
  },
} as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const result = commentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const answer = await prisma.answer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!answer) {
      return NextResponse.json(
        { error: "Answer not found" },
        { status: 404 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        answerId: id,
        authoredById: authUser.userId,
        content: result.data.content.trim(),
      },
      include: {
        authoredBy: {
          select: communityUserSelect,
        },
      },
    });

    const profileMap = await getCommunityProfileMap([comment.authoredBy.id]);

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          author: toAuthorSummary(profileMap.get(comment.authoredBy.id)),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
