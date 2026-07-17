import Tax from "@/models/Tax";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await dbConnect();
        const taxes = await Tax.find({}).sort({ name: 1 });
        return NextResponse.json(taxes, { status: 200 });
    } catch (error) {
        console.error('getTaxes error:', error);
        return NextResponse.json({ message: 'Error fetching taxes' }, { status: 500 });
    }
};

export const POST = async (req) => {
    const body = await req.json();
    const { name, rate, type, code, description, active } = body;

    if (!name || rate === undefined || rate === null) {
        return NextResponse.json({ message: 'Name and rate are required' }, { status: 400 });
    }

    try {
        await dbConnect();
        const existing = await Tax.findOne({ name: name.trim() });
        if (existing) {
            return NextResponse.json({ message: 'A tax with this name already exists' }, { status: 400 });
        }
        const tax = await Tax.create({
            name: name.trim(),
            rate,
            type: type || 'percentage',
            code: code || '',
            description: description || '',
            active: active !== false,
        });
        return NextResponse.json(tax, { status: 201 });
    } catch (error) {
        console.error('createTax error:', error);
        return NextResponse.json({ message: 'Error creating tax' }, { status: 500 });
    }
};
