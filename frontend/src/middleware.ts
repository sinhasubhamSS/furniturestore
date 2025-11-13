// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected routes list (keep in sync with your app)
 */
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

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  );
}

// Relative refresh endpoint used by your interceptor: adjust if different
const REFRESH_ENDPOINT_REL = "/user/refresh-token";

/**
 * Try server-side refresh: call refresh endpoint (cookies forwarded by Edge runtime).
 * If refresh endpoint responds OK and sets cookies, copy Set-Cookie headers to the response
 * so browser receives new cookies, then allow the original request to continue.
 */
async function tryServerRefresh(req: NextRequest) {
  try {
    const refreshUrl = new URL(REFRESH_ENDPOINT_REL, req.url).toString();

    const refreshRes = await fetch(refreshUrl, {
      method: "POST",
      headers: { accept: "application/json" },
      // no body; refresh token must be in httpOnly cookie sent with the incoming request
    });

    if (!refreshRes.ok) return null;

    const nextRes = NextResponse.next();

    // Copy single 'set-cookie' header if present
    const scSingle = refreshRes.headers.get("set-cookie");
    if (scSingle) nextRes.headers.append("set-cookie", scSingle);

    // Best-effort: some runtimes expose getAll; copy all if available
    // @ts-ignore
    if (typeof (refreshRes.headers as any).getAll === "function") {
      // @ts-ignore
      const all: string[] = (refreshRes.headers as any).getAll("set-cookie");
      for (const c of all) nextRes.headers.append("set-cookie", c);
    }

    return nextRes;
  } catch (err) {
    // log for debugging — in production use structured logging
    console.error("middleware: server-side refresh failed:", err);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // skip internal and api/static assets
  if (isPublicPath(pathname)) return NextResponse.next();

  // quick protected detection (static-friendly)
  const isProtected =
    pathname === "/cart" ||
    pathname === "/wishlist" ||
    pathname === "/myorders" ||
    pathname === "/my-profile" ||
    pathname === "/support" ||
    pathname === "/returns" ||
    pathname === "/checkout" ||
    pathname === "/ordersuccess" ||
    pathname.startsWith("/cart/") ||
    pathname.startsWith("/wishlist/") ||
    pathname.startsWith("/myorders/") ||
    pathname.startsWith("/my-profile/") ||
    pathname.startsWith("/support/") ||
    pathname.startsWith("/returns/") ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/ordersuccess/") ||
    pathname.includes("?");

  if (!isProtected) return NextResponse.next();

  const accessCookie = req.cookies.get("accessToken")?.value || null;

  if (!accessCookie) {
    // attempt server-side refresh (will copy Set-Cookie headers to client if refresh succeeds)
    const refreshed = await tryServerRefresh(req);
    if (refreshed) return refreshed;

    // refresh failed -> redirect to login (with from query)
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * NOTE: config.matcher must be a literal array (statically analyzable).
 * Keep this list in sync with PROTECTED_PATHS above.
 */
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
