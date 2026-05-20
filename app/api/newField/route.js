import DynamicFeilds from "@/models/DynamicFeilds";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    const body = await req.json();
    const { label, type, isRequired, belongsto } = body;

    if (!label || !type) {
        return NextResponse.json({ message: 'Label and type are required' }, { status: 400 });
    }

    try {
        await dbConnect();

        const existing = await DynamicFeilds.findOne({ label });
        if (existing) {
            return NextResponse.json({ message: 'A field with this label already exists' }, { status: 400 });
        }

        await DynamicFeilds.create({ label, type, isRequired: isRequired ?? false, belongsto });

        return NextResponse.json({ message: 'Field created successfully' }, { status: 201 });
    } catch (error) {
        console.error('newField error:', error);
        return NextResponse.json({ message: 'Error creating field' }, { status: 500 });
    }
};
