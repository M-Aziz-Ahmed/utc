import Consignee from "@/models/Consignee";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const item = await Consignee.findById(id);
        if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching consignee' }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const updated = await Consignee.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating consignee' }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await Consignee.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting consignee' }, { status: 500 });
    }
};
