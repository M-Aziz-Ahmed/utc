import Tax from "@/models/Tax";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const tax = await Tax.findById(id);
        if (!tax) return NextResponse.json({ message: 'Tax not found' }, { status: 404 });
        return NextResponse.json(tax, { status: 200 });
    } catch (error) {
        console.error('getTax error:', error);
        return NextResponse.json({ message: 'Error fetching tax' }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const updated = await Tax.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (!updated) return NextResponse.json({ message: 'Tax not found' }, { status: 404 });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error('updateTax error:', error);
        return NextResponse.json({ message: 'Error updating tax' }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await Tax.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ message: 'Tax not found' }, { status: 404 });
        return NextResponse.json({ message: 'Tax deleted' }, { status: 200 });
    } catch (error) {
        console.error('deleteTax error:', error);
        return NextResponse.json({ message: 'Error deleting tax' }, { status: 500 });
    }
};
