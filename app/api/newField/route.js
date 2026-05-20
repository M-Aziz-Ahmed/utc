import DynamicFeilds from "@/models/DynamicFeilds";
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
        const newField = await DynamicFeilds.create(body);
        return NextResponse.json(
            { message: 'Field created successfully' },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error('createUser error:', error);
        return NextResponse.json({ message: 'error creating Field' }, { status: 500 });
    }
}