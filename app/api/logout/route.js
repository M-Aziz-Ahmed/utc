import { clearSessionCookie } from '@/utils/auth'
import { NextResponse } from 'next/server'

export const POST = async () => {
    try {
        await clearSessionCookie()
        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json({ message: 'An error occurred during logout' }, { status: 500 })
    }
}
