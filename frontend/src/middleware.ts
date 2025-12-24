import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/cart",
  "/wishlist",
  "/my-orders",
  "/my-profile",
  "/support",
  "/returns",
  "/checkout",
  "/ordersuccess",
];
function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/auth")
  );
}

const REFRESH_ENDPOINT_REL = "/api/user/refresh-token";

async function tryServerRefresh(req: NextRequest) {
  try {
    const refreshUrl = new URL(REFRESH_ENDPOINT_REL, req.url).toString();

    const refreshRes = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        // 🔥 THIS IS THE KEY FIX
        cookie: req.headers.get("cookie") ?? "",
      },
    });
    if (!refreshRes.ok) return null;
    const res = NextResponse.next();
    const setCookie = refreshRes.headers.get("set-cookie");
    if (setCookie) {
      res.headers.append("set-cookie", setCookie);
    }

    // @ts-ignore
    if (typeof refreshRes.headers.getAll === "function") {
      // @ts-ignore
      const all = refreshRes.headers.getAll("set-cookie");
      all.forEach((c: string) => res.headers.append("set-cookie", c));
    }
    return res;
  } catch (err) {
    console.error("🔴 middleware: refresh FAILED", err);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;

  // Access token missing → try refresh
  // Access token missing
  if (!accessToken) {
    console.warn("⚠️ middleware: accessToken missing");

    // 🔴 IMPORTANT FIX
    // Agar refresh-token bhi nahi hai → tryServerRefresh MAT karo
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      const refreshed = await tryServerRefresh(req);
      if (refreshed) {
        return refreshed;
      }
    }

    // Direct redirect
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Access token exists → allow
  return NextResponse.next();
}

/**
 * Matcher MUST be static (Next.js requirement)
 */
export const config = {
  matcher: [
    "/cart/:path*",
    "/wishlist/:path*",
    "/my-orders/:path*",
    "/my-profile/:path*",
    "/support/:path*",
    "/returns/:path*",
    "/checkout/:path*",
    "/ordersuccess/:path*",
  ],
};
