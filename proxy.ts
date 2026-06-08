import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/firebase/session";

const PUBLIC_PATHS = new Set([
  "/auth/login",
  "/api/session/login",
  "/api/session/logout",
]);

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.has(pathname) ||
  pathname.startsWith("/_next") ||
  pathname === "/favicon.ico" ||
  pathname === "/favicon.svg" ||
  pathname.startsWith("/api/billing/webhook"); // Stripe webhooks are unauthenticated

export function proxy(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)"],
};
