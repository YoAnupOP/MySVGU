import { VoteDirection } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export function toVoteDirection(direction: "up" | "down") {
  return direction === "up" ? VoteDirection.UP : VoteDirection.DOWN;
}

export function fromVoteDirection(direction: VoteDirection | null | undefined) {
  if (direction === VoteDirection.UP) {
    return "up";
  }

  if (direction === VoteDirection.DOWN) {
    return "down";
  }

  return null;
}

function getVoteDelta(previous: VoteDirection | null, next: VoteDirection | null) {
  const delta = { upvotes: 0, downvotes: 0 };

  if (previous === VoteDirection.UP) {
    delta.upvotes -= 1;
  }

  if (previous === VoteDirection.DOWN) {
    delta.downvotes -= 1;
  }

  if (next === VoteDirection.UP) {
    delta.upvotes += 1;
  }

  if (next === VoteDirection.DOWN) {
    delta.downvotes += 1;
  }

  return delta;
}

export async function applyQuestionVote({
  questionId,
  userId,
  direction,
}: {
  questionId: string;
  userId: string;
  direction: "up" | "down";
}) {
  return prisma.$transaction(async (tx) => {
    const question = await tx.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!question) {
      throw new Error("QUESTION_NOT_FOUND");
    }

    const nextDirection = toVoteDirection(direction);
    const existingVote = await tx.questionVote.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId,
        },
      },
    });

    const finalDirection = existingVote?.direction === nextDirection ? null : nextDirection;
    const delta = getVoteDelta(existingVote?.direction || null, finalDirection);

    if (!existingVote && finalDirection) {
      await tx.questionVote.create({
        data: {
          questionId,
          userId,
          direction: finalDirection,
        },
      });
    } else if (existingVote && !finalDirection) {
      await tx.questionVote.delete({
        where: {
          questionId_userId: {
            questionId,
            userId,
          },
        },
      });
    } else if (existingVote && finalDirection) {
      await tx.questionVote.update({
        where: {
          questionId_userId: {
            questionId,
            userId,
          },
        },
        data: {
          direction: finalDirection,
        },
      });
    }

    const updatedQuestion = await tx.question.update({
      where: { id: questionId },
      data: {
        upvotes: { increment: delta.upvotes },
        downvotes: { increment: delta.downvotes },
      },
      select: {
        upvotes: true,
        downvotes: true,
      },
    });

    return {
      ...updatedQuestion,
      userVote: fromVoteDirection(finalDirection),
    };
  });
}

export async function applyAnswerVote({
  answerId,
  userId,
  direction,
}: {
  answerId: string;
  userId: string;
  direction: "up" | "down";
}) {
  return prisma.$transaction(async (tx) => {
    const answer = await tx.answer.findUnique({
      where: { id: answerId },
      select: { id: true },
    });

    if (!answer) {
      throw new Error("ANSWER_NOT_FOUND");
    }

    const nextDirection = toVoteDirection(direction);
    const existingVote = await tx.answerVote.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId,
        },
      },
    });

    const finalDirection = existingVote?.direction === nextDirection ? null : nextDirection;
    const delta = getVoteDelta(existingVote?.direction || null, finalDirection);

    if (!existingVote && finalDirection) {
      await tx.answerVote.create({
        data: {
          answerId,
          userId,
          direction: finalDirection,
        },
      });
    } else if (existingVote && !finalDirection) {
      await tx.answerVote.delete({
        where: {
          answerId_userId: {
            answerId,
            userId,
          },
        },
      });
    } else if (existingVote && finalDirection) {
      await tx.answerVote.update({
        where: {
          answerId_userId: {
            answerId,
            userId,
          },
        },
        data: {
          direction: finalDirection,
        },
      });
    }

    const updatedAnswer = await tx.answer.update({
      where: { id: answerId },
      data: {
        upvotes: { increment: delta.upvotes },
        downvotes: { increment: delta.downvotes },
      },
      select: {
        upvotes: true,
        downvotes: true,
      },
    });

    return {
      ...updatedAnswer,
      userVote: fromVoteDirection(finalDirection),
    };
  });
}
