import Manufacturer from "@/models/Manufacturer";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await dbConnect();
        const manufacturers = await Manufacturer.find({}).sort({ createdAt: -1 });
        return NextResponse.json(manufacturers, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching manufacturers' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        await dbConnect();
        const body = await req.json();
        if (!body.name) return NextResponse.json({ message: 'Manufacturer name is required' }, { status: 400 });
        const manufacturer = await Manufacturer.create(body);
        return NextResponse.json(manufacturer, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating manufacturer' }, { status: 500 });
    }
};
