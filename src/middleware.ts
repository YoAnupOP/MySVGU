import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

import { getJwtSecretBytes } from "@/lib/env";

const protectedRoutes = [
  "/dashboard",
  "/timetable",
  "/announcements",
  "/chatbot",
  "/asksvgu",
  "/admin",
];

const authRoutes = ["/login", "/signup", "/staff/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  let isAuthenticated = false;
  let userRole: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecretBytes());
      isAuthenticated = true;
      userRole = (payload.role as string) || null;
    } catch {
      isAuthenticated = false;
    }
  }

  const isStaff = userRole === "ADMIN" || userRole === "FACULTY";

  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(isStaff ? "/admin" : "/dashboard", request.url));
  }

  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const isAdminRoute = pathname.startsWith("/admin");
    const loginUrl = new URL(isAdminRoute ? "/staff/login" : "/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(isStaff ? "/admin" : "/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/landing", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
