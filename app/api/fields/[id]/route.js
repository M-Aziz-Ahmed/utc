import DynamicFeilds from "@/models/DynamicFeilds";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const PATCH = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const updated = await DynamicFeilds.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (!updated) {
            return NextResponse.json({ message: 'Field not found' }, { status: 404 });
        }
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error('updateField error:', error);
        return NextResponse.json({ message: 'Error updating field' }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await DynamicFeilds.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ message: 'Field not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Field deleted' }, { status: 200 });
    } catch (error) {
        console.error('deleteField error:', error);
        return NextResponse.json({ message: 'Error deleting field' }, { status: 500 });
    }
};
