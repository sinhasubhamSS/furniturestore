// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/cart",
  "/wishlist",
  "/myorders",
  "/my-profile",
  "/support",
  "/returns",
  "/checkout",
  "/ordersuccess",
];

// Skip _next, api, static assets
function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const isProtected = PROTECTED_PATHS.some(
    (p) =>
      pathname === p ||
      pathname.startsWith(p + "/") ||
      pathname.startsWith(p + "?")
  );

  if (!isProtected) return NextResponse.next();

  const accessCookie = req.cookies.get("accessToken")?.value || null;

  if (!accessCookie) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/wishlist/:path*",
    "/myorders/:path*",
    "/my-profile/:path*",
    "/support/:path*",
    "/returns/:path*",
    "/checkout/:path*",
    "/ordersuccess/:path*",
  ],
};
