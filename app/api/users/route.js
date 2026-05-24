import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        await dbConnect();
        
        // Fetch all users, sorted by creation date (newest first)
        // Exclude password field for security
        const users = await User.find({})
            .select('-pass')
            .sort({ createdAt: -1 });
        
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('getUsers error:', error);
        return NextResponse.json({ 
            message: 'Error fetching users',
            error: error.message 
        }, { status: 500 });
    }
}
