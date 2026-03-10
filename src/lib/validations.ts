import { z } from "zod";

export const loginSchema = z.object({
  classId: z
    .string()
    .min(1, "Class ID is required")
    .min(2, "Class ID must be at least 2 characters"),
  studentId: z
    .string()
    .min(1, "Student ID is required")
    .min(5, "Student ID must be at least 5 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const staffLoginSchema = z.object({
  classId: z
    .string()
    .min(1, "Organization ID is required")
    .min(2, "Organization ID must be at least 2 characters"),
  studentId: z
    .string()
    .min(1, "Staff ID is required")
    .min(3, "Staff ID must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  enrollmentNo: z.string().optional(),
  classId: z.string().optional(),
  semester: z.string().optional(),
  course: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .min(10, "Content must be at least 10 characters"),
  priority: z.enum(["high", "normal", "low"]).optional().default("normal"),
  department: z.string().optional(),
  targetProgram: z.string().optional(),
  targetSemester: z.string().optional(),
});

export const questionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(10, "Title must be at least 10 characters"),
  body: z
    .string()
    .min(1, "Description is required")
    .min(20, "Description must be at least 20 characters"),
  tags: z.array(z.string().min(1)).optional().default([]),
  category: z.string().optional().default("Academic"),
});

export const answerSchema = z.object({
  content: z
    .string()
    .min(1, "Answer is required")
    .min(10, "Answer must be at least 10 characters"),
});

export const voteSchema = z.object({
  direction: z.enum(["up", "down"]),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment is required")
    .min(3, "Comment must be at least 3 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
