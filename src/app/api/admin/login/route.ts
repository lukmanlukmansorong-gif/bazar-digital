import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, setAdminSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username dan password wajib diisi' }, { status: 400 })
    }

    const sessionData = await checkCredentials(username, password)
    if (sessionData) {
      await setAdminSession(sessionData)
      const redirectTo = sessionData.role === 'operator' ? '/admin/transaksi' : '/admin/dashboard'
      return NextResponse.json({ 
        success: true, 
        role: sessionData.role,
        name: sessionData.name,
        redirectTo 
      })
    }
    
    return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}

