import Supplier from "@/models/Supplier";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await dbConnect();
        const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
        return NextResponse.json(suppliers, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching suppliers' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        await dbConnect();
        const body = await req.json();
        if (!body.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        const supplier = await Supplier.create(body);
        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating supplier' }, { status: 500 });
    }
};
