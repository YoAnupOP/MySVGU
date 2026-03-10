import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCommunityProfileByUserId } from "@/lib/community";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const profile = await getCommunityProfileByUserId(authUser.userId);

    if (!profile) {
      return NextResponse.json(
        { error: "Community profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching community summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch community summary" },
      { status: 500 },
    );
  }
}
