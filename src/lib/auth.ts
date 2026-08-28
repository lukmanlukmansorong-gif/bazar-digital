import { cookies } from 'next/headers'
import prisma from '@/lib/db'

const DEFAULT_ADMIN_USERNAME = 'admin'
const DEFAULT_ADMIN_PASSWORD = 'bazar2026'
const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'authenticated_admin_2026'

export async function checkAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const config = await prisma.config.findUnique({ where: { id: 1 } })
    const validUsername = config?.adminUsername || DEFAULT_ADMIN_USERNAME
    const validPassword = config?.adminPassword || DEFAULT_ADMIN_PASSWORD

    return username === validUsername && password === validPassword
  } catch (error) {
    console.error("Auth check error:", error)
    return username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD
  }
}

export async function setAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
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

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === SESSION_VALUE
}
