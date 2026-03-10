import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { fromVoteDirection } from "@/lib/community-votes";
import { getCommunityProfileMap, toAuthorSummary } from "@/lib/community";
import prisma from "@/lib/prisma";
import { questionSchema } from "@/lib/validations";

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

export async function GET() {
  try {
    const authUser = await getCurrentUser().catch(() => null);

    const questions = await prisma.question.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        askedBy: {
          select: communityUserSelect,
        },
        _count: {
          select: {
            answers: true,
          },
        },
        votes: {
          where: {
            userId: authUser?.userId || "__no_viewer__",
          },
          select: {
            direction: true,
          },
        },
      },
    });

    const profileMap = await getCommunityProfileMap(questions.map((question) => question.askedBy.id));

    return NextResponse.json({
      success: true,
      questions: questions.map((question) => ({
        id: question.id,
        title: question.title,
        description: question.body,
        tags: question.tags,
        category: question.category,
        upvotes: question.upvotes,
        downvotes: question.downvotes,
        views: question.views,
        createdAt: question.createdAt.toISOString(),
        authorId: question.askedById,
        answersCount: question._count.answers,
        userVote: fromVoteDirection(question.votes[0]?.direction),
        author: toAuthorSummary(profileMap.get(question.askedBy.id)),
      })),
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const result = questionSchema.safeParse(body);

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

    const question = await prisma.question.create({
      data: {
        title: result.data.title,
        body: result.data.body,
        tags: result.data.tags,
        category: result.data.category,
        askedById: authUser.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        question: {
          id: question.id,
          title: question.title,
          description: question.body,
          tags: question.tags,
          category: question.category,
          upvotes: question.upvotes,
          downvotes: question.downvotes,
          views: question.views,
          createdAt: question.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}
