import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ---------------- STRICT PROTECTED ROUTES ---------------- */
const STRICT_ROUTES = ["/checkout", "/ordersuccess"];

/* ---------------- SOFT PROTECTED ROUTES ---------------- */
const SOFT_ROUTES = [
  "/cart",
  "/wishlist",
  "/my-orders",
  "/my-profile",
  "/support",
  "/returns",
];

/* ---------------- BOT DETECTION ---------------- */
function isBot(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  return /googlebot|bingbot|yandex|duckduckbot|baiduspider/i.test(ua);
}

/* ---------------- REFRESH HANDLER ---------------- */
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

    return res;
  } catch {
    return null;
  }
}

/* ---------------- MAIN MIDDLEWARE ---------------- */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isStrict = STRICT_ROUTES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const isSoft = SOFT_ROUTES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isStrict && !isSoft) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;

  // 🔐 No access token
  if (!accessToken) {
    if (isBot(req)) {
      return NextResponse.next();
    }

    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      const refreshed = await tryServerRefresh(req);
      if (refreshed) return refreshed;
    }

    // 🔴 STRICT → Hard redirect
    if (isStrict) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 🟢 SOFT → Allow request (modal will handle on client)
    return NextResponse.next();
  }

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
