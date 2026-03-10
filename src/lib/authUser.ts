import { Prisma } from "@/generated/prisma";

export const ERP_ONLY_PASSWORD_SENTINEL = "ERP_ONLY_ACCOUNT";

export const publicUserSelect = {
  id: true,
  name: true,
  role: true,
  classId: true,
  studentId: true,
  profile: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;
