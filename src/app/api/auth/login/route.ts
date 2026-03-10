import { NextRequest, NextResponse } from "next/server";

import { createToken, setAuthCookie } from "@/lib/auth";
import { ERP_ONLY_PASSWORD_SENTINEL, publicUserSelect } from "@/lib/authUser";
import { encryptErpPassword } from "@/lib/erpCrypto";
import { ErpWorkerError, verifyErpCredentials } from "@/lib/erpWorker";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 },
      );
    }

    const { classId, studentId, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { studentId },
      select: {
        id: true,
        role: true,
        name: true,
      },
    });

    if (existingUser && existingUser.role !== "STUDENT") {
      return NextResponse.json(
        { error: "This account is reserved for staff login." },
        { status: 409 },
      );
    }

    const verification = await verifyErpCredentials({
      classId,
      studentId,
      password,
    });

    const encryptedPassword = encryptErpPassword(password);
    const resolvedName =
      verification.student.name?.trim() || existingUser?.name || studentId;

    const user = await prisma.user.upsert({
      where: { studentId },
      update: {
        classId,
        studentId,
        name: resolvedName,
        role: "STUDENT",
        localPasswordHash: ERP_ONLY_PASSWORD_SENTINEL,
        profile: {
          upsert: {
            update: {
              classId,
            },
            create: {
              classId,
            },
          },
        },
        erpCredential: {
          upsert: {
            update: {
              passwordCiphertext: encryptedPassword,
              lastVerifiedAt: new Date(),
              lastError: null,
            },
            create: {
              passwordCiphertext: encryptedPassword,
              lastVerifiedAt: new Date(),
              lastError: null,
            },
          },
        },
      },
      create: {
        classId,
        studentId,
        name: resolvedName,
        role: "STUDENT",
        localPasswordHash: ERP_ONLY_PASSWORD_SENTINEL,
        profile: {
          create: {
            classId,
          },
        },
        erpCredential: {
          create: {
            passwordCiphertext: encryptedPassword,
            lastVerifiedAt: new Date(),
            lastError: null,
          },
        },
      },
      select: publicUserSelect,
    });

    const token = await createToken({
      userId: user.id,
      role: user.role,
      name: user.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "ERP login successful",
      user,
    });
  } catch (error) {
    if (error instanceof ErpWorkerError) {
      const isInvalidCredentials = error.status === 401;

      return NextResponse.json(
        {
          error: isInvalidCredentials
            ? "Invalid ERP credentials."
            : "The ERP service is unavailable right now. Please try again shortly.",
        },
        { status: isInvalidCredentials ? 401 : 502 },
      );
    }

    console.error("Login error:", error);

    const detail = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      process.env.NODE_ENV === "development"
        ? { error: "Internal server error", detail }
        : { error: "Internal server error" },
      { status: 500 },
    );
  }
}
