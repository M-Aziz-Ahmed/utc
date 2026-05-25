import Dimensions from "@/models/Dimensions";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await dbConnect();
        const dims = await Dimensions.find({}).sort({ createdAt: -1 });
        return NextResponse.json(dims, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching dimensions' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        await dbConnect();
        const body = await req.json();
        if (!body.name) return NextResponse.json({ message: 'Preset name is required' }, { status: 400 });
        const dim = await Dimensions.create(body);
        return NextResponse.json(dim, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating dimensions preset' }, { status: 500 });
    }
};
