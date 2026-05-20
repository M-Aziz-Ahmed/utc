import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { NextResponse } from "next/server"

export const POST = async (req) => {
    const body = await req.json();
    const { label } = body;
    try {
        await dbConnect();
        const existingUser = await User.findOne({ label });
        if (existingUser) {
            return NextResponse.json({ message: 'Field already exists' }, { status: 400 });
        }
        const newField = await Dynamic.create(body);
        const cookieValue = `user=${encodeURIComponent(JSON.stringify({ id: newUser._id }))}; Path=/; HttpOnly; SameSite=Lax`;
        return NextResponse.json(
            { message: 'user created successfully' },
            {
                status: 200,
                headers: {
                    'Set-Cookie': cookieValue,
                },
            }
        );
    } catch (error) {
        console.error('createUser error:', error);
        return NextResponse.json({ message: 'error creating user' }, { status: 500 });
    }
}