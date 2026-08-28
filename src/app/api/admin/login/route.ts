import { NextRequest, NextResponse } from 'next/server'
import { checkAdminCredentials, setAdminSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    
    const isValid = await checkAdminCredentials(username, password)
    if (isValid) {
      await setAdminSession()
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan' }, { status: 500 })
  }
}
