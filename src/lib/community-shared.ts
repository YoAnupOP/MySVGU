export type CommunityBadgeKey =
  | "FIRST_ASK"
  | "FIRST_HELP"
  | "RISING_VOICE"
  | "CAMPUS_HELPER"
  | "TOP_CONTRIBUTOR";

export type CommunityBadgeTone = "blue" | "emerald" | "amber" | "violet";

export interface CommunityBadge {
  key: CommunityBadgeKey;
  label: string;
  description: string;
  tone: CommunityBadgeTone;
}

export interface CommunityUserCard {
  id: string;
  name: string;
  studentId: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  avatarUrl?: string | null;
  profile: string;
  course?: string | null;
  semester?: string | null;
  classId?: string | null;
}

export interface CommunityAuthorSummary extends CommunityUserCard {
  reputation: number;
  badges: CommunityBadge[];
  rank: number | null;
}

export interface CommunityProfile {
  user: CommunityUserCard;
  reputation: number;
  badges: CommunityBadge[];
  questionsCount: number;
  answersCount: number;
  commentsCount: number;
  rank: number | null;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  profile: string;
  course?: string | null;
  reputation: number;
  badges: CommunityBadge[];
  rank: number;
  questionsCount: number;
  answersCount: number;
}

export interface CommunityQuestionPreview {
  id: string;
  title: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  answersCount: number;
  views: number;
  tags: string[];
  category: string;
}

export interface CommunityAnswerPreview {
  id: string;
  questionId: string;
  questionTitle: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

export interface CommunityProfileResponse {
  profile: CommunityProfile;
  questions: CommunityQuestionPreview[];
  answers: CommunityAnswerPreview[];
}

export interface QuestionComment {
  id: string;
  content: string;
  createdAt: string;
  author: CommunityAuthorSummary;
}

export interface QuestionAnswer {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  userVote: "up" | "down" | null;
  isTopSupported: boolean;
  author: CommunityAuthorSummary;
  comments: QuestionComment[];
}

export interface QuestionDetailResponse {
  question: {
    id: string;
    title: string;
    body: string;
    category: string;
    tags: string[];
    createdAt: string;
    views: number;
    upvotes: number;
    downvotes: number;
    userVote: "up" | "down" | null;
    answersCount: number;
    author: CommunityAuthorSummary;
  };
  answers: QuestionAnswer[];
}

export interface CommunitySummaryResponse {
  profile: CommunityProfile;
}

export const COMMUNITY_BADGE_CATALOG: Record<CommunityBadgeKey, CommunityBadge> = {
  FIRST_ASK: {
    key: "FIRST_ASK",
    label: "First Ask",
    description: "Posted the first question in AskSVGU.",
    tone: "blue",
  },
  FIRST_HELP: {
    key: "FIRST_HELP",
    label: "First Help",
    description: "Posted the first answer in AskSVGU.",
    tone: "emerald",
  },
  RISING_VOICE: {
    key: "RISING_VOICE",
    label: "Rising Voice",
    description: "Reached 50 reputation points.",
    tone: "amber",
  },
  CAMPUS_HELPER: {
    key: "CAMPUS_HELPER",
    label: "Campus Helper",
    description: "Answered at least five questions.",
    tone: "violet",
  },
  TOP_CONTRIBUTOR: {
    key: "TOP_CONTRIBUTOR",
    label: "Top Contributor",
    description: "Currently ranked in the top 10 contributors.",
    tone: "blue",
  },
};
