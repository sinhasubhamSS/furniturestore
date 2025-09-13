import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/admin/dashboard', '/my-profile', '/my-orders','/checkout/payment']; // Protected routes list

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sirf protected routes pe check karo
  if (protectedRoutes.includes(pathname)) {
    // Token cookie lo
    const token = req.cookies.get('token');

    // Token nahi mila toh login page redirect karo
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // Token hai ya public route hai, allow next request
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard', '/my-profile', '/my-orders','/checkout/payment','/return'], // Middleware sirf in routes pe chalega
};
