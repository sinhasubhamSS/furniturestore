import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  
  '/my-profile',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Debugging
  console.log("🟢 Middleware triggered");
  console.log("👉 PATHNAME:", pathname);

  if (protectedRoutes.includes(pathname)) {
   const token = req.cookies.get('accessToken');

    console.log("🔑 Token:", token?.value || "Not Found");

    if (!token) {
      console.log("❌ No token, redirecting to login");
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    console.log("✅ Token found, access allowed");
  } else {
    console.log("🟢 Public route, skipping auth");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
  
    '/my-profile',
  ],
};
