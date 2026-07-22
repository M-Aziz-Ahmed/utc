import Yard from "@/models/Yard";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const yard = await Yard.findById(id);
        if (!yard) return NextResponse.json({ message: 'Yard not found' }, { status: 404 });
        return NextResponse.json(yard, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching yard' }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const yard = await Yard.findByIdAndUpdate(id, body, { new: true });
        if (!yard) return NextResponse.json({ message: 'Yard not found' }, { status: 404 });
        return NextResponse.json(yard, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating yard' }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const yard = await Yard.findByIdAndDelete(id);
        if (!yard) return NextResponse.json({ message: 'Yard not found' }, { status: 404 });
        return NextResponse.json({ message: 'Yard deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting yard' }, { status: 500 });
    }
};
