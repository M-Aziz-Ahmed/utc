import DynamicFeilds from "@/models/DynamicFeilds";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await dbConnect();
        const fields = await DynamicFeilds.find({}).sort({ order: 1 });
        return NextResponse.json(fields, { status: 200 });
    } catch (error) {
        console.error('getFields error:', error);
        return NextResponse.json({ message: 'error fetching fields' }, { status: 500 });
    }
};

export const POST = async (req) => {
    const body = await req.json();
    const { belongsto } = body;
    try {
        await dbConnect();
        const fields = await DynamicFeilds.find({ belongsto }).sort({ order: 1 });
        return NextResponse.json(fields, { status: 200 });
    } catch (error) {
        console.error('getFields error:', error);
        return NextResponse.json({ message: 'error fetching fields' }, { status: 500 });
    }
};
