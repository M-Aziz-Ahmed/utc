import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const POST = async (req) => {
    const { email, password } = await req.json()
    try {
        await dbConnect()
        const user = await User.findOne({ email })
        if (user) {
            if (user.pass === password) {
                const cookie = await cookies()
                cookie.set('user', user._id.toString())
                return NextResponse.json({ message: 'user Logged In successfully' }, { status: 200 })

            }
        }
    }
    catch (error) {
        return NextResponse.json({ message: 'error Authenticating user' }, { status: 500 })
    }
}