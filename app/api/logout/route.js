import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const POST = async () => {
    try {
        const cookieStore = await cookies()
        
        // Delete the user cookie
        cookieStore.delete('user')
        
        return NextResponse.json({ 
            message: 'Logged out successfully' 
        }, { status: 200 })
        
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json({ 
            message: 'An error occurred during logout' 
        }, { status: 500 })
    }
}
