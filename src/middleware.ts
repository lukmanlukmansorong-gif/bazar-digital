import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'authenticated_admin_2026'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Skip login page and API routes
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Protect all /admin/* routes
  if (pathname.startsWith('/admin')) {
    const session = req.cookies.get(SESSION_COOKIE)
    if (session?.value !== SESSION_VALUE) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
