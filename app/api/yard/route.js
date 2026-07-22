import Yard from "@/models/Yard";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await dbConnect();
        const yards = await Yard.find({}).sort({ createdAt: -1 });
        return NextResponse.json(yards, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching yards' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        await dbConnect();
        const body = await req.json();
        if (!body.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        const yard = await Yard.create(body);
        return NextResponse.json(yard, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating yard' }, { status: 500 });
    }
};
