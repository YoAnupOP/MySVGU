import { NextResponse } from "next/server";

import { getLeaderboardEntries } from "@/lib/community";

export async function GET() {
  try {
    const leaderboard = await getLeaderboardEntries(25);

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching community leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
