import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { NextResponse } from "next/server"

const createUser = async (req) => {
    const {name, email, pass, role, verified, number} = req.json()
    try{
        await dbConnect()
        User.create({name:name, email:email, pass:pass, role:role, verified:verified, number:number})
        return NextResponse.json({message:'user created successfully'}, {status:200})
    }
    catch(error){
        return NextResponse.json({message:'error creating user'}, {status:500})
    }
}