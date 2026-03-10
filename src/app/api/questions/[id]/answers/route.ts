import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCommunityProfileMap, toAuthorSummary } from "@/lib/community";
import prisma from "@/lib/prisma";
import { answerSchema } from "@/lib/validations";

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const answers = await prisma.answer.findMany({
      where: { questionId: id },
      orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
      include: {
        answeredBy: {
          select: communityUserSelect,
        },
        comments: {
          select: { id: true },
        },
      },
    });

    const profileMap = await getCommunityProfileMap(answers.map((answer) => answer.answeredBy.id));

    return NextResponse.json({
      success: true,
      answers: answers.map((answer) => ({
        id: answer.id,
        content: answer.content,
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
        createdAt: answer.createdAt.toISOString(),
        commentsCount: answer.comments.length,
        author: toAuthorSummary(profileMap.get(answer.answeredBy.id)),
      })),
    });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 },
    );
  }
}

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

    const { id: questionId } = await params;
    const body = await request.json();
    const result = answerSchema.safeParse(body);

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

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    const answer = await prisma.answer.create({
      data: {
        content: result.data.content.trim(),
        questionId,
        answeredById: authUser.userId,
      },
      include: {
        answeredBy: {
          select: communityUserSelect,
        },
      },
    });

    const profileMap = await getCommunityProfileMap([answer.answeredBy.id]);

    return NextResponse.json(
      {
        success: true,
        answer: {
          id: answer.id,
          content: answer.content,
          upvotes: answer.upvotes,
          downvotes: answer.downvotes,
          createdAt: answer.createdAt.toISOString(),
          author: toAuthorSummary(profileMap.get(answer.answeredBy.id)),
          comments: [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Failed to create answer" },
      { status: 500 },
    );
  }
}
