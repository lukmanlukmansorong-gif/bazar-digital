import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'admin_session'

function getRoleFromCookie(value?: string): 'admin' | 'operator' | null {
  if (!value) return null
  if (value === 'authenticated_admin_2026') return 'admin'
  if (value === 'authenticated_operator_2026') return 'operator'
  if (value.startsWith('b64:')) {
    try {
      const decoded = atob(value.slice(4))
      const parsed = JSON.parse(decoded)
      if (parsed?.role === 'admin' || parsed?.role === 'operator') {
        return parsed.role
      }
    } catch {
      return null
    }
  }
  return null
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Skip login page and API routes
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Protect all /admin/* routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get(SESSION_COOKIE)
    const role = getRoleFromCookie(sessionCookie?.value)
    
    if (!role) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Default redirect for root /admin
    if (pathname === '/admin' || pathname === '/admin/') {
      if (role === 'operator') {
        return NextResponse.redirect(new URL('/admin/transaksi', req.url))
      }
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    // Operator restrictions: Only allow /admin/transaksi
    if (role === 'operator') {
      const isAllowedForOperator = pathname.startsWith('/admin/transaksi')
      if (!isAllowedForOperator) {
        return NextResponse.redirect(new URL('/admin/transaksi', req.url))
      }
    }
  }
  
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }

