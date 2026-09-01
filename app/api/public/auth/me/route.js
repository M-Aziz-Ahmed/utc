import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import dbConnect from '@/utils/dbConnection'
import User from '@/models/User'
import { JWT_SECRET } from '@/utils/secret'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('utc_token')

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET)

    await dbConnect()
    const user = await User.findById(payload.id).select('email name role').lean()
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || 'user',
      },
    }, { status: 200 })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
