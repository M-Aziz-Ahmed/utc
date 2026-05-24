import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const POST = async (req) => {
    const { email, password } = await req.json()
    
    try {
        await dbConnect()
        
        // Find user by email
        const user = await User.findOne({ email })
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }
        
        // Check password
        if (user.pass !== password) {
            return NextResponse.json({ message: 'Invalid password' }, { status: 401 })
        }
        
        // Create user session data
        const userData = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'User'
        }
        
        // Set cookie with user data
        const cookieStore = await cookies()
        cookieStore.set('user', encodeURIComponent(JSON.stringify(userData)), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        
        return NextResponse.json({ 
            message: 'Login successful!',
            user: {
                email: user.email,
                name: user.name,
                role: user.role
            }
        }, { status: 200 })
        
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ 
            message: 'An error occurred during login. Please try again.' 
        }, { status: 500 })
    }
}