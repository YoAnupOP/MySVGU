import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { publicUserSelect } from "@/lib/authUser";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: publicUserSelect,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
