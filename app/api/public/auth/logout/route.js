import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const response = NextResponse.json({ message: 'Logged out' }, { status: 200 })
    response.cookies.set('utc_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ message: 'Error logging out' }, { status: 500 })
  }
}
