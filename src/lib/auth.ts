import { cookies } from 'next/headers'
import prisma from '@/lib/db'

const DEFAULT_ADMIN_USERNAME = 'admin'
const DEFAULT_ADMIN_PASSWORD = 'bazar2026'
export const SESSION_COOKIE = 'admin_session'
export const LEGACY_ADMIN_SESSION = 'authenticated_admin_2026'
export const LEGACY_OPERATOR_SESSION = 'authenticated_operator_2026'

export interface UserSession {
  role: 'admin' | 'operator'
  username: string
  name: string
}

export function parseSessionCookie(value: string | undefined): UserSession | null {
  if (!value) return null
  if (value === LEGACY_ADMIN_SESSION) {
    return { role: 'admin', username: 'admin', name: 'Administrator' }
  }
  if (value === LEGACY_OPERATOR_SESSION) {
    return { role: 'operator', username: 'operator', name: 'Operator Online' }
  }
  if (value.startsWith('b64:')) {
    try {
      const jsonStr = Buffer.from(value.slice(4), 'base64').toString('utf-8')
      const parsed = JSON.parse(jsonStr)
      if (parsed && (parsed.role === 'admin' || parsed.role === 'operator')) {
        return {
          role: parsed.role,
          username: parsed.username || (parsed.role === 'admin' ? 'admin' : 'operator'),
          name: parsed.name || (parsed.role === 'admin' ? 'Administrator' : `Operator (${parsed.username})`)
        }
      }
    } catch {
      return null
    }
  }
  return null
}

export async function checkCredentials(
  username: string, 
  password: string
): Promise<UserSession | null> {
  try {
    const config = await prisma.config.findUnique({ where: { id: 1 } })
    const validAdminUser = config?.adminUsername || DEFAULT_ADMIN_USERNAME
    const validAdminPass = config?.adminPassword || DEFAULT_ADMIN_PASSWORD

    // 1. Check Admin Credentials
    if (username === validAdminUser && password === validAdminPass) {
      return {
        role: 'admin',
        username: validAdminUser,
        name: 'Administrator'
      }
    }

    const cleanUsername = username.trim()

    // 2. Check Multiple Operators table
    const operator = await prisma.operator.findFirst({
      where: {
        username: {
          equals: cleanUsername,
          mode: 'insensitive'
        }
      }
    })

    if (operator) {
      if (!operator.isActive) {
        // Inactive operator cannot login
        return null
      }
      if (operator.password === password) {
        return {
          role: 'operator',
          username: operator.username,
          name: operator.name || `Operator (${operator.username})`
        }
      }
      return null
    }

    // 3. Fallback: Check Legacy single operator from Config (if exists)
    if (
      config?.operatorUsername &&
      config?.operatorPassword &&
      cleanUsername.toLowerCase() === config.operatorUsername.trim().toLowerCase() &&
      password === config.operatorPassword
    ) {
      return {
        role: 'operator',
        username: config.operatorUsername,
        name: `Operator (${config.operatorUsername})`
      }
    }

    return null
  } catch (error) {
    console.error("Auth check error:", error)
    if (username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
      return {
        role: 'admin',
        username: DEFAULT_ADMIN_USERNAME,
        name: 'Administrator'
      }
    }
    return null
  }
}

// Backward-compatible check for admin only
export async function checkAdminCredentials(username: string, password: string): Promise<boolean> {
  const user = await checkCredentials(username, password)
  return user?.role === 'admin'
}

export async function setAdminSession(sessionData?: UserSession) {
  const cookieStore = await cookies()
  const data: UserSession = sessionData || {
    role: 'admin',
    username: 'admin',
    name: 'Administrator'
  }
  const sessionToken = `b64:${Buffer.from(JSON.stringify(data)).toString('base64')}`

  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getAdminSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return parseSessionCookie(session?.value)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return session?.role === 'admin'
}

export async function isOperatorOrAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return session?.role === 'admin' || session?.role === 'operator'
}

