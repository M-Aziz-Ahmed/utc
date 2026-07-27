import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'utc-secret-key-change-in-production')

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('utc_token')

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET)

    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    }, { status: 200 })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
