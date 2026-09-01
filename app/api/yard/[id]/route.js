import { readJson } from '@/utils/readJson'
import Yard from "@/models/Yard";
import dbConnect from "@/utils/dbConnection";
import { requirePortal } from '@/utils/apiAuth'
import mongoose from 'mongoose'
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        const { error } = await requirePortal('yard')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const yard = await Yard.findById(id);
        if (!yard) return NextResponse.json({ message: 'Yard not found' }, { status: 404 });
        return NextResponse.json(yard, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching yard' }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        const { error } = await requirePortal('yard')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const body = await readJson(req);
        const updates = {}
        for (const key of ['name', 'location', 'address', 'city', 'country', 'capacity', 'notes']) {
            if (body[key] !== undefined) updates[key] = body[key]
        }
        const yard = await Yard.findByIdAndUpdate(id, updates, { new: true });
        if (!yard) return NextResponse.json({ message: 'Yard not found' }, { status: 404 });
        return NextResponse.json(yard, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating yard' }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        const { error } = await requirePortal('yard')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const yard = await Yard.findByIdAndDelete(id);
        if (!yard) return NextResponse.json({ message: 'Yard not found' }, { status: 404 });
        return NextResponse.json({ message: 'Yard deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting yard' }, { status: 500 });
    }
};
