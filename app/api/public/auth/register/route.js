import { readJson } from '@/utils/readJson'
import { NextResponse } from 'next/server'
import dbConnect from '@/utils/dbConnection'
import User from '@/models/User'
import Consignee from '@/models/Consignee'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'utc-secret-key-change-in-production')

export async function POST(req) {
  try {
    await dbConnect()
    const { name, email, password, phone, country } = await readJson(req)

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      country: country || '',
      role: 'user',
      verified: false,
    })

    // Also create a Consignee record so website registrations appear in the
    // ERP Client / Consignee form.
    try {
      await Consignee.create({
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        country: country || '',
        notes: 'Registered via website',
      })
    } catch (consigneeError) {
      console.error('Consignee create error:', consigneeError)
    }

    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user',
      },
    }, { status: 201 })

    response.cookies.set('utc_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ message: 'Error creating account' }, { status: 500 })
  }
}
