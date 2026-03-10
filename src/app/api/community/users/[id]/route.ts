import { NextResponse } from "next/server";

import { getCommunityProfileByUserId } from "@/lib/community";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await getCommunityProfileByUserId(id);

    if (!profile) {
      return NextResponse.json(
        { error: "Community profile not found" },
        { status: 404 },
      );
    }

    const [questions, answers] = await Promise.all([
      prisma.question.findMany({
        where: { askedById: id },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          _count: {
            select: {
              answers: true,
            },
          },
        },
      }),
      prisma.answer.findMany({
        where: { answeredById: id },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          question: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      profile,
      questions: questions.map((question) => ({
        id: question.id,
        title: question.title,
        createdAt: question.createdAt.toISOString(),
        upvotes: question.upvotes,
        downvotes: question.downvotes,
        answersCount: question._count.answers,
        views: question.views,
        tags: question.tags,
        category: question.category,
      })),
      answers: answers.map((answer) => ({
        id: answer.id,
        questionId: answer.question.id,
        questionTitle: answer.question.title,
        content: answer.content,
        createdAt: answer.createdAt.toISOString(),
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
      })),
    });
  } catch (error) {
    console.error("Error fetching community user:", error);
    return NextResponse.json(
      { error: "Failed to fetch community user" },
      { status: 500 },
    );
  }
}
