import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith("/admin") && !req.nextUrl.pathname.startsWith("/admin/login") && !req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only require auth for /admin routes (except login)
        if (req.nextUrl.pathname.startsWith("/admin") && !req.nextUrl.pathname.startsWith("/admin/login")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = { matcher: ["/admin/:path*"] };
