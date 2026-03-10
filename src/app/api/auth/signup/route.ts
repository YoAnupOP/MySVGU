import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Public signup is disabled. Students should sign in with ERP credentials, and staff accounts are provisioned internally.",
    },
    { status: 403 },
  );
}
