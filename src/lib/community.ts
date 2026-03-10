import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import {
  COMMUNITY_BADGE_CATALOG,
  type CommunityAuthorSummary,
  type CommunityBadge,
  type CommunityProfile,
  type CommunityUserCard,
  type LeaderboardEntry,
} from "@/lib/community-shared";

const communityUserSelect = {
  id: true,
  name: true,
  studentId: true,
  role: true,
  classId: true,
  profile: {
    select: {
      avatarUrl: true,
      course: true,
      semester: true,
      classId: true,
    },
  },
} satisfies Prisma.UserSelect;

type CommunityUserRecord = Prisma.UserGetPayload<{
  select: typeof communityUserSelect;
}>;

type BaseCommunityProfile = Omit<CommunityProfile, "badges">;

function sumVotes(items: Array<{ upvotes: number; downvotes: number }>) {
  return items.reduce(
    (totals, item) => ({
      upvotes: totals.upvotes + item.upvotes,
      downvotes: totals.downvotes + item.downvotes,
    }),
    { upvotes: 0, downvotes: 0 },
  );
}

function toProfileLabel(user: CommunityUserRecord) {
  const parts = [user.profile?.semester, user.profile?.course].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" / ");
  }

  return user.role === "STUDENT" ? user.classId || "Student" : user.role;
}

function toCommunityUserCard(user: CommunityUserRecord): CommunityUserCard {
  return {
    id: user.id,
    name: user.name,
    studentId: user.studentId,
    role: user.role,
    avatarUrl: user.profile?.avatarUrl,
    profile: toProfileLabel(user),
    course: user.profile?.course,
    semester: user.profile?.semester,
    classId: user.profile?.classId || user.classId || null,
  };
}

function calculateReputation(stats: {
  questionsCount: number;
  answersCount: number;
  questionUpvotes: number;
  questionDownvotes: number;
  answerUpvotes: number;
  answerDownvotes: number;
}) {
  return (
    stats.questionsCount * 5 +
    stats.answersCount * 10 +
    stats.questionUpvotes * 2 -
    stats.questionDownvotes +
    stats.answerUpvotes * 5 -
    stats.answerDownvotes * 2
  );
}

function deriveBadges(profile: BaseCommunityProfile): CommunityBadge[] {
  const badges: CommunityBadge[] = [];

  if (profile.questionsCount >= 1) {
    badges.push(COMMUNITY_BADGE_CATALOG.FIRST_ASK);
  }

  if (profile.answersCount >= 1) {
    badges.push(COMMUNITY_BADGE_CATALOG.FIRST_HELP);
  }

  if (profile.reputation >= 50) {
    badges.push(COMMUNITY_BADGE_CATALOG.RISING_VOICE);
  }

  if (profile.answersCount >= 5) {
    badges.push(COMMUNITY_BADGE_CATALOG.CAMPUS_HELPER);
  }

  if (profile.rank !== null && profile.rank <= 10) {
    badges.push(COMMUNITY_BADGE_CATALOG.TOP_CONTRIBUTOR);
  }

  return badges;
}

function compareProfiles(left: BaseCommunityProfile, right: BaseCommunityProfile) {
  return (
    right.reputation - left.reputation ||
    right.answersCount - left.answersCount ||
    right.questionsCount - left.questionsCount ||
    left.user.name.localeCompare(right.user.name)
  );
}

export async function getCommunityProfiles(): Promise<CommunityProfile[]> {
  const users = await prisma.user.findMany({
    select: {
      ...communityUserSelect,
      _count: {
        select: {
          questions: true,
          answers: true,
          comments: true,
        },
      },
      questions: {
        select: {
          upvotes: true,
          downvotes: true,
        },
      },
      answers: {
        select: {
          upvotes: true,
          downvotes: true,
        },
      },
    },
  });

  const baseProfiles: BaseCommunityProfile[] = users.map((user) => {
    const questionVotes = sumVotes(user.questions);
    const answerVotes = sumVotes(user.answers);

    return {
      user: toCommunityUserCard(user),
      reputation: calculateReputation({
        questionsCount: user._count.questions,
        answersCount: user._count.answers,
        questionUpvotes: questionVotes.upvotes,
        questionDownvotes: questionVotes.downvotes,
        answerUpvotes: answerVotes.upvotes,
        answerDownvotes: answerVotes.downvotes,
      }),
      questionsCount: user._count.questions,
      answersCount: user._count.answers,
      commentsCount: user._count.comments,
      rank: null,
    };
  });

  const rankedProfiles = baseProfiles
    .filter(
      (profile) =>
        profile.questionsCount > 0 ||
        profile.answersCount > 0 ||
        profile.commentsCount > 0 ||
        profile.reputation > 0,
    )
    .sort(compareProfiles);

  const rankMap = new Map<string, number>();
  rankedProfiles.forEach((profile, index) => {
    rankMap.set(profile.user.id, index + 1);
  });

  return baseProfiles
    .map((profile) => {
      const rankedProfile: BaseCommunityProfile = {
        ...profile,
        rank: rankMap.get(profile.user.id) ?? null,
      };

      return {
        ...rankedProfile,
        badges: deriveBadges(rankedProfile),
      };
    })
    .sort(compareProfiles);
}

export async function getCommunityProfileByUserId(userId: string) {
  const profiles = await getCommunityProfiles();
  return profiles.find((profile) => profile.user.id === userId) || null;
}

export async function getCommunityProfileMap(userIds: string[]) {
  const requestedIds = new Set(userIds.filter(Boolean));
  const profiles = await getCommunityProfiles();
  return new Map(
    profiles
      .filter((profile) => requestedIds.has(profile.user.id))
      .map((profile) => [profile.user.id, profile] as const),
  );
}

export async function getLeaderboardEntries(limit = 10): Promise<LeaderboardEntry[]> {
  const profiles = await getCommunityProfiles();

  return profiles
    .filter((profile) => profile.rank !== null)
    .slice(0, limit)
    .map((profile) => ({
      userId: profile.user.id,
      name: profile.user.name,
      avatarUrl: profile.user.avatarUrl,
      profile: profile.user.profile,
      course: profile.user.course,
      reputation: profile.reputation,
      badges: profile.badges,
      rank: profile.rank || 0,
      questionsCount: profile.questionsCount,
      answersCount: profile.answersCount,
    }));
}

export function toAuthorSummary(profile: CommunityProfile | null | undefined): CommunityAuthorSummary {
  if (!profile) {
    return {
      id: "unknown",
      name: "Unknown User",
      studentId: "",
      role: "STUDENT",
      avatarUrl: null,
      profile: "Community member",
      course: null,
      semester: null,
      classId: null,
      reputation: 0,
      badges: [],
      rank: null,
    };
  }

  return {
    ...profile.user,
    reputation: profile.reputation,
    badges: profile.badges,
    rank: profile.rank,
  };
}