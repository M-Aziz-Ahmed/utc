import Consignee from "@/models/Consignee";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await dbConnect();
        const consignees = await Consignee.find({}).sort({ createdAt: -1 });
        return NextResponse.json(consignees, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching consignees' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        await dbConnect();
        const body = await req.json();
        if (!body.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        const consignee = await Consignee.create(body);
        return NextResponse.json(consignee, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating consignee' }, { status: 500 });
    }
};
