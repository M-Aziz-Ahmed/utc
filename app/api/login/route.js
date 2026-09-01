import { readJson } from '@/utils/readJson'
import User from '@/models/User'
import dbConnect from '@/utils/dbConnection'
import { setSessionCookie } from '@/utils/auth'
import { getFirstPortalPath } from '@/utils/permissions'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export const POST = async (req) => {
    const { email, password } = await readJson(req)

    if (!email || !password) {
        return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    try {
        await dbConnect()

        const user = await User.findOne({ email: String(email).toLowerCase().trim() })

        if (!user) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
        }

        // Some accounts store the hash in `password` (public register) instead of `pass` (admin create).
        const storedHash = user.pass || user.password
        if (!storedHash || !storedHash.startsWith('$2')) {
            return NextResponse.json(
                { message: 'This account needs a password reset. Contact an administrator.' },
                { status: 403 }
            )
        }

        const passwordValid = await bcrypt.compare(password, storedHash)

        if (!passwordValid) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
        }

        await setSessionCookie({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'User',
            permissions: user.permissions || [],
            viewOnly: !!user.viewOnly,
        })

        const sessionUser = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'User',
            permissions: [...(user.permissions || [])],
            viewOnly: !!user.viewOnly,
        }

        return NextResponse.json({
            message: 'Login successful',
            user: sessionUser,
            redirectTo: getFirstPortalPath(sessionUser),
        }, { status: 200 })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ message: 'An error occurred during login. Please try again.' }, { status: 500 })
    }
}
