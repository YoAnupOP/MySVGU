"use client";

import { nanoid } from "nanoid";

// Types
export type CourseCode = "BCA" | "B.Tech" | "BBA" | "MBA" | "B.Com";

export interface AskUser {
  id: string;
  name: string;
  profile: string; // e.g., TY-BCA-A
  course: CourseCode;
  avatarUrl?: string;
  reputation: number;
}

export interface AskComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string; // e.g., "2 hours ago"
}

export interface AskAnswer {
  id: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  comments: AskComment[];
}

export interface AskQuestion {
  id: string;
  title: string;
  description: string;
  authorId: string;
  tags: string[];
  category: string; // e.g., Academic, Assignment, Exam
  upvotes: number;
  downvotes: number;
  answers: AskAnswer[];
  views: number;
  createdAt: string;
}

export interface AskState {
  users: AskUser[];
  questions: AskQuestion[];
}

const STORAGE_KEY = "asksvgu_state_v1";

// Helpers
const isClient = typeof window !== "undefined";

function timeAgoLabel(hours: number): string {
  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

// Initial Mock Data
function buildInitialUsers(): AskUser[] {
  const users = [
    { id: nanoid(), name: "Rahul Sharma", profile: "TY-BCA-A", course: "BCA", reputation: 245 },
    { id: nanoid(), name: "Priya Patel", profile: "SY-BBA-B", course: "BBA", reputation: 189 },
    { id: nanoid(), name: "Ananya Gupta", profile: "FY-BCA-D", course: "BCA", reputation: 120 },
    { id: nanoid(), name: "Arjun Mehta", profile: "TY-B.Tech-C", course: "B.Tech", reputation: 310 },
    { id: nanoid(), name: "Ishita Verma", profile: "SY-B.Com-A", course: "B.Com", reputation: 165 },
    { id: nanoid(), name: "Siddharth Rao", profile: "TY-MBA-A", course: "MBA", reputation: 278 },
    { id: nanoid(), name: "Neha Singh", profile: "SY-BCA-B", course: "BCA", reputation: 152 },
    { id: nanoid(), name: "Kunal Joshi", profile: "TY-BBA-C", course: "BBA", reputation: 204 },
    { id: nanoid(), name: "Riya Kapoor", profile: "FY-B.Tech-A", course: "B.Tech", reputation: 96 },
    { id: nanoid(), name: "Aman Khan", profile: "FY-BCA-C", course: "BCA", reputation: 88 },
    { id: nanoid(), name: "Sneha Iyer", profile: "SY-B.Tech-D", course: "B.Tech", reputation: 141 },
    { id: nanoid(), name: "Vikram Das", profile: "TY-B.Com-B", course: "B.Com", reputation: 173 },
  ] satisfies AskUser[];

  return users.map(
    (user): AskUser => ({
      ...user,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
    }),
  );
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildInitialQuestions(users: AskUser[]): AskQuestion[] {
  const sampleQuestions: Array<Pick<AskQuestion, "title" | "description" | "tags" | "category">> = [
    {
      title: "How to implement recursion in JavaScript?",
      description: "I'm struggling with understanding recursion. Can someone explain with a simple example like factorial or fibonacci?",
      tags: ["JavaScript", "Programming"],
      category: "Academic",
    },
    {
      title: "How to solve this calculus integration problem?",
      description: "Need help integrating a tricky rational function. Any tips or steps to approach it?",
      tags: ["Mathematics", "Calculus"],
      category: "Academic",
    },
    {
      title: "Best resources to learn SQL joins?",
      description: "I get confused between left, right, inner joins. Looking for good beginner-friendly resources.",
      tags: ["SQL", "Databases"],
      category: "Assignment",
    },
    {
      title: "How to center a div using Tailwind?",
      description: "What's the cleanest way to center a div both vertically and horizontally?",
      tags: ["CSS", "Tailwind"],
      category: "Academic",
    },
    {
      title: "What is the difference between var, let, and const?",
      description: "In JavaScript, when should I use var vs let vs const?",
      tags: ["JavaScript"],
      category: "Academic",
    },
    {
      title: "Linear regression intuition?",
      description: "Can someone explain linear regression in simple terms and how gradients work?",
      tags: ["Machine Learning", "Math"],
      category: "Academic",
    },
    {
      title: "How to prepare for OS viva?",
      description: "Any important topics to revise for Operating Systems viva?",
      tags: ["Operating Systems", "Exam"],
      category: "Exam",
    },
    {
      title: "Differences between HTTP and HTTPS",
      description: "Why is HTTPS considered secure and how does SSL/TLS play into it?",
      tags: ["Networking", "Security"],
      category: "Academic",
    },
    {
      title: "Python list vs tuple practical uses",
      description: "When would you prefer a tuple over a list in Python?",
      tags: ["Python"],
      category: "Academic",
    },
    {
      title: "Group project: task breakdown advice",
      description: "We have a semester project. How should we split tasks efficiently among 4 members?",
      tags: ["Project Management"],
      category: "Assignment",
    },
    {
      title: "How to create responsive grid in CSS?",
      description: "What's the simplest way to make a responsive grid layout without frameworks?",
      tags: ["CSS", "Responsive"],
      category: "Academic",
    },
    {
      title: "Time complexity of nested loops",
      description: "How do I analyze time complexity for multiple nested loops with conditions?",
      tags: ["Algorithms", "Complexity"],
      category: "Academic",
    },
  ];

  const hoursOptions = [1, 2, 3, 5, 8, 12, 18, 24, 32, 48];

  const questions: AskQuestion[] = sampleQuestions.map((q) => {
    const author = pickRandom(users);
    const createdHours = pickRandom(hoursOptions);
    const answers: AskAnswer[] = Math.random() > 0.5 ? [
      {
        id: nanoid(),
        authorId: pickRandom(users).id,
        content: "You can think of recursion as a function calling itself with a smaller problem. For factorial, f(n) = n * f(n-1) until base case n=1.",
        upvotes: Math.floor(Math.random() * 8),
        downvotes: Math.floor(Math.random() * 2),
        createdAt: timeAgoLabel(createdHours - 1),
        comments: [],
      },
    ] : [];

    return {
      id: nanoid(),
      title: q.title,
      description: q.description,
      authorId: author.id,
      tags: q.tags,
      category: q.category,
      upvotes: Math.floor(Math.random() * 20),
      downvotes: Math.floor(Math.random() * 4),
      answers,
      views: Math.floor(Math.random() * 100) + 10,
      createdAt: timeAgoLabel(createdHours),
    };
  });

  return questions;
}

function initialState(): AskState {
  const users = buildInitialUsers();
  const questions = buildInitialQuestions(users);
  return { users, questions };
}

// Storage
export function loadState(): AskState {
  if (!isClient) return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = initialState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    const parsed = JSON.parse(raw) as AskState;
    return parsed;
  } catch (_) {
    return initialState();
  }
}

export function saveState(state: AskState): void {
  if (!isClient) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): AskState {
  const state = initialState();
  saveState(state);
  return state;
}

// Query helpers
export function listQuestions(): AskQuestion[] {
  return loadState().questions;
}

export function listUsers(): AskUser[] {
  return loadState().users;
}

export function findUserById(userId: string): AskUser | undefined {
  return loadState().users.find((u) => u.id === userId);
}

export function findQuestionById(questionId: string): AskQuestion | undefined {
  return loadState().questions.find((q) => q.id === questionId);
}

// Mutations
export function addQuestion(params: {
  title: string;
  description: string;
  authorId: string;
  tags: string[];
  category: string;
}): AskQuestion {
  const state = loadState();
  const newQuestion: AskQuestion = {
    id: nanoid(),
    title: params.title,
    description: params.description,
    authorId: params.authorId,
    tags: params.tags,
    category: params.category,
    upvotes: 0,
    downvotes: 0,
    answers: [],
    views: 0,
    createdAt: "just now",
  };
  state.questions.unshift(newQuestion);
  saveState(state);
  return newQuestion;
}

export function upvoteQuestion(questionId: string): AskQuestion | undefined {
  const state = loadState();
  const q = state.questions.find((qq) => qq.id === questionId);
  if (!q) return undefined;
  q.upvotes += 1;
  saveState(state);
  return q;
}

export function downvoteQuestion(questionId: string): AskQuestion | undefined {
  const state = loadState();
  const q = state.questions.find((qq) => qq.id === questionId);
  if (!q) return undefined;
  q.downvotes += 1;
  saveState(state);
  return q;
}

export function addAnswer(params: {
  questionId: string;
  authorId: string;
  content: string;
}): AskAnswer | undefined {
  const state = loadState();
  const q = state.questions.find((qq) => qq.id === params.questionId);
  if (!q) return undefined;
  const answer: AskAnswer = {
    id: nanoid(),
    authorId: params.authorId,
    content: params.content,
    upvotes: 0,
    downvotes: 0,
    createdAt: "just now",
    comments: [],
  };
  q.answers.push(answer);
  saveState(state);
  return answer;
}

export function upvoteAnswer(questionId: string, answerId: string): AskAnswer | undefined {
  const state = loadState();
  const q = state.questions.find((qq) => qq.id === questionId);
  if (!q) return undefined;
  const a = q.answers.find((aa) => aa.id === answerId);
  if (!a) return undefined;
  a.upvotes += 1;
  saveState(state);
  return a;
}

export function addComment(params: {
  questionId: string;
  answerId?: string; // if provided, comment goes to answer; otherwise to question root (not used for now)
  authorId: string;
  content: string;
}): AskComment | undefined {
  const state = loadState();
  const q = state.questions.find((qq) => qq.id === params.questionId);
  if (!q) return undefined;
  const comment: AskComment = {
    id: nanoid(),
    authorId: params.authorId,
    content: params.content,
    createdAt: "just now",
  };
  if (params.answerId) {
    const a = q.answers.find((aa) => aa.id === params.answerId);
    if (!a) return undefined;
    a.comments.push(comment);
  } else {
    // Optional: implement root-level question comments in future
  }
  saveState(state);
  return comment;
}

export function incrementViews(questionId: string): void {
  const state = loadState();
  const q = state.questions.find((qq) => qq.id === questionId);
  if (!q) return;
  q.views += 1;
  saveState(state);
}

export function deriveLeaderboard(topN = 10): Array<AskUser> {
  const state = loadState();
  const users = [...state.users];
  users.sort((a, b) => b.reputation - a.reputation);
  return users.slice(0, topN);
}

// Utility for demo: pick an existing user to act as current
export function getDemoCurrentUser(): AskUser {
  const users = listUsers();
  return users[0];
}


