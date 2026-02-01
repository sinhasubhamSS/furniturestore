import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ---------------- PROTECTED ROUTES ---------------- */
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

/* ---------------- PUBLIC PATH CHECK ---------------- */
function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/policies") ||
    pathname.startsWith("/products") || // ✅ product listing
    pathname.startsWith("/product") || // ✅ product detail
    pathname.startsWith("/category") ||
    pathname === "/" ||
    pathname === "/about" ||
    pathname.startsWith("/about") ||
    pathname === "/contact-us"
  );
}

/* ---------------- BOT DETECTION ---------------- */
function isBot(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  return /googlebot|bingbot|yandex|duckduckbot|baiduspider/i.test(ua);
}

/* ---------------- REFRESH TOKEN HANDLER ---------------- */
const REFRESH_ENDPOINT_REL = "/api/user/refresh-token";

async function tryServerRefresh(req: NextRequest) {
  try {
    const refreshUrl = new URL(REFRESH_ENDPOINT_REL, req.url).toString();

    const refreshRes = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (!refreshRes.ok) return null;

    const res = NextResponse.next();
    const setCookie = refreshRes.headers.get("set-cookie");
    if (setCookie) res.headers.append("set-cookie", setCookie);

    // Edge compatibility
    // @ts-ignore
    if (typeof refreshRes.headers.getAll === "function") {
      // @ts-ignore
      refreshRes.headers.getAll("set-cookie").forEach((c: string) => {
        res.headers.append("set-cookie", c);
      });
    }

    return res;
  } catch (err) {
    console.error("🔴 middleware refresh failed", err);
    return null;
  }
}

/* ---------------- MAIN MIDDLEWARE ---------------- */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Normalize trailing slash (SEO safety)
  if (pathname.endsWith("/") && pathname !== "/" && !isBot(req)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  // ✅ Public paths allowed
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;

  // 🔐 No access token
  if (!accessToken) {
    // ✅ Bots should NEVER be redirected or blocked
    if (isBot(req)) {
      return NextResponse.next();
    }

    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (refreshToken) {
      const refreshed = await tryServerRefresh(req);
      if (refreshed) return refreshed;
    }

    // 👤 Real user → login redirect
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Authenticated user
  return NextResponse.next();
}

/* ---------------- MATCHER ---------------- */
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
