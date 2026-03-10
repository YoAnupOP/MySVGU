import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCommunityProfileMap, toAuthorSummary } from "@/lib/community";
import { fromVoteDirection } from "@/lib/community-votes";
import prisma from "@/lib/prisma";
import type { QuestionDetailResponse } from "@/lib/community-shared";

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
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authUser = await getCurrentUser().catch(() => null);
    const viewerId = authUser?.userId || "__no_viewer__";

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        askedBy: {
          select: communityUserSelect,
        },
        votes: {
          where: { userId: viewerId },
          select: { direction: true },
        },
        answers: {
          orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }],
          include: {
            answeredBy: {
              select: communityUserSelect,
            },
            votes: {
              where: { userId: viewerId },
              select: { direction: true },
            },
            comments: {
              orderBy: { createdAt: "asc" },
              include: {
                authoredBy: {
                  select: communityUserSelect,
                },
              },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    await prisma.question.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
    });

    const participantIds = [
      question.askedBy.id,
      ...question.answers.map((answer) => answer.answeredBy.id),
      ...question.answers.flatMap((answer) => answer.comments.map((comment) => comment.authoredBy.id)),
    ];
    const profileMap = await getCommunityProfileMap(participantIds);
    const topSupport = Math.max(...question.answers.map((answer) => answer.upvotes), 0);

    const payload: QuestionDetailResponse = {
      question: {
        id: question.id,
        title: question.title,
        body: question.body,
        category: question.category,
        tags: question.tags,
        createdAt: question.createdAt.toISOString(),
        views: question.views + 1,
        upvotes: question.upvotes,
        downvotes: question.downvotes,
        userVote: fromVoteDirection(question.votes[0]?.direction),
        answersCount: question.answers.length,
        author: toAuthorSummary(profileMap.get(question.askedBy.id)),
      },
      answers: question.answers.map((answer) => ({
        id: answer.id,
        content: answer.content,
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
        createdAt: answer.createdAt.toISOString(),
        userVote: fromVoteDirection(answer.votes[0]?.direction),
        isTopSupported: topSupport > 0 && answer.upvotes === topSupport,
        author: toAuthorSummary(profileMap.get(answer.answeredBy.id)),
        comments: answer.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          author: toAuthorSummary(profileMap.get(comment.authoredBy.id)),
        })),
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching question detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch question detail" },
      { status: 500 },
    );
  }
}
