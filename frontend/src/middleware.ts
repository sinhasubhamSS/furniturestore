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
    pathname.startsWith("/auth") ||
    pathname.startsWith("/policies") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/category") ||
    pathname === "/" ||
    pathname === "/about-us" ||
    pathname === "/contact-us"
  );
}

const REFRESH_ENDPOINT_REL = "/api/user/refresh-token";

/* ---------------- BOT DETECTION (SEO FIX) ---------------- */
function isBot(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  return /googlebot|bingbot|yandex|duckduckbot|baiduspider/i.test(ua);
}

/* ---------------- REFRESH HANDLER (UNCHANGED) ---------------- */
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

    // @ts-ignore (edge compatibility)
    if (typeof refreshRes.headers.getAll === "function") {
      // @ts-ignore
      refreshRes.headers.getAll("set-cookie").forEach((c: string) => {
        res.headers.append("set-cookie", c);
      });
    }

    return res;
  } catch (err) {
    console.error("🔴 middleware: refresh FAILED", err);
    return null;
  }
}

/* ---------------- MAIN MIDDLEWARE ---------------- */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths → allow
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

  // 🔐 ACCESS TOKEN MISSING
  if (!accessToken) {
    // 🚫 SEO FIX: Bots should NOT see login redirects
    if (isBot(req)) {
      // Tell Google: "This page does not exist for indexing"
      return new NextResponse(null, { status: 410 });
    }

    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      const refreshed = await tryServerRefresh(req);
      if (refreshed) {
        return refreshed;
      }
    }

    // 👤 Real user → redirect to login
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Authenticated → allow
  return NextResponse.next();
}

/* ---------------- MATCHER (UNCHANGED) ---------------- */
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
