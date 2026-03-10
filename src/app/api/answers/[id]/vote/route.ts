import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { applyAnswerVote } from "@/lib/community-votes";
import { voteSchema } from "@/lib/validations";

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
    const result = voteSchema.safeParse(body);

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

    const vote = await applyAnswerVote({
      answerId: id,
      userId: authUser.userId,
      direction: result.data.direction,
    });

    return NextResponse.json({
      success: true,
      vote,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ANSWER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Answer not found" },
        { status: 404 },
      );
    }

    console.error("Error applying answer vote:", error);
    return NextResponse.json(
      { error: "Failed to update answer vote" },
      { status: 500 },
    );
  }
}
