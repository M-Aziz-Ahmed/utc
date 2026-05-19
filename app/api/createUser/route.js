import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { NextResponse } from "next/server"

export const POST = async (req) => {
    const {email, password} = await req.json()
    try{
        await dbConnect()
        const user = await User.findOne({email})
        if (user){
            return NextResponse.json({message:'user already exists'}, {status:400})
        }
        await User.create({email, pass:password})
        return NextResponse.json({message:'user created successfully'}, {status:200})
    }
    catch(error){
        return NextResponse.json({message:'error creating user'}, {status:500})
    }
}