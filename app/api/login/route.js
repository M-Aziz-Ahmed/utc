import User from '@/models/User'
import dbConnect from '@/utils/dbConnection'
import { setSessionCookie } from '@/utils/auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export const POST = async (req) => {
    const { email, password } = await req.json()

    if (!email || !password) {
        return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    try {
        await dbConnect()

        const user = await User.findOne({ email })

        if (!user) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
        }

        // Support both hashed passwords and legacy plaintext (for migration)
        let passwordValid = false
        if (user.pass.startsWith('$2')) {
            // bcrypt hash
            passwordValid = await bcrypt.compare(password, user.pass)
        } else {
            // Legacy plaintext — compare then upgrade to hash
            passwordValid = user.pass === password
            if (passwordValid) {
                const hashed = await bcrypt.hash(password, 12)
                await User.findByIdAndUpdate(user._id, { pass: hashed })
            }
        }

        if (!passwordValid) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
        }

        await setSessionCookie({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'User',
        })

        return NextResponse.json({
            message: 'Login successful',
            user: { email: user.email, name: user.name, role: user.role },
        }, { status: 200 })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ message: 'An error occurred during login. Please try again.' }, { status: 500 })
    }
}
