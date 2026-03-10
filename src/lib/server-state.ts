import { ApiError, apiFetch } from "@/lib/api";
import type { AuthUser } from "@/lib/auth-shared";
import type {
  CommunityAuthorSummary,
  CommunityProfile,
  CommunityProfileResponse,
  CommunitySummaryResponse,
  LeaderboardEntry,
  QuestionDetailResponse,
} from "@/lib/community-shared";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  department?: string;
  targetProgram?: string;
  targetSemester?: string;
  createdAt: string;
  postedBy?: { name: string; role: string };
}

export interface AttendanceSubject {
  name: string;
  present: number;
  total: number;
  percentage: number;
}

export interface AttendanceResponse {
  student: {
    classId: string;
    studentId: string;
    name: string;
  };
  overall: {
    present: number;
    total: number;
    percentage: number;
  };
  subjects: AttendanceSubject[];
  fetchedAt: string;
  lastSyncedAt: string;
  source: "cache" | "erp-live";
}

export interface QuestionListItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  upvotes: number;
  downvotes: number;
  views: number;
  createdAt: string;
  authorId: string;
  answersCount: number;
  userVote?: "up" | "down" | null;
  author: CommunityAuthorSummary;
}

export const queryKeys = {
  authMe: ["auth", "me"] as const,
  announcements: ["announcements"] as const,
  dashboardAttendance: (studentId?: string) =>
    ["dashboard", "attendance", studentId || "anonymous"] as const,
  communityMeSummary: ["community", "me", "summary"] as const,
  questions: ["community", "questions"] as const,
  leaderboard: ["community", "leaderboard"] as const,
  questionDetail: (id: string) => ["community", "question", id] as const,
  communityUser: (id: string) => ["community", "user", id] as const,
};

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await apiFetch<{ success: true; user: AuthUser }>("/api/auth/me");
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      return null;
    }

    throw error;
  }
}

export async function fetchAnnouncements() {
  const data = await apiFetch<{
    success: true;
    announcements?: Announcement[];
  }>("/api/announcements");

  return data.announcements || [];
}

export async function fetchDashboardAttendance() {
  return await apiFetch<AttendanceResponse>("/api/dashboard/attendance");
}

export async function refreshDashboardAttendance() {
  return await apiFetch<AttendanceResponse>("/api/dashboard/attendance/refresh", {
    method: "POST",
  });
}

export async function fetchCommunitySummary(): Promise<CommunityProfile | null> {
  try {
    const data = await apiFetch<CommunitySummaryResponse>("/api/community/me/summary");
    return data.profile || null;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404)) {
      return null;
    }

    throw error;
  }
}

export async function fetchQuestions() {
  const data = await apiFetch<{
    success: true;
    questions?: QuestionListItem[];
  }>("/api/questions");

  return data.questions || [];
}

export async function fetchLeaderboard() {
  const data = await apiFetch<{
    success: true;
    leaderboard?: LeaderboardEntry[];
  }>("/api/community/leaderboard");

  return data.leaderboard || [];
}

export async function fetchQuestionDetail(id: string) {
  return await apiFetch<QuestionDetailResponse>(`/api/questions/${id}`);
}

export async function fetchCommunityUserProfile(id: string) {
  return await apiFetch<CommunityProfileResponse>(`/api/community/users/${id}`);
}