import { readJson } from '@/utils/readJson'
import Tax from "@/models/Tax";
import dbConnect from "@/utils/dbConnection";
import { requirePortal } from '@/utils/apiAuth'
import mongoose from 'mongoose'
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        const { error } = await requirePortal('setup')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
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
        const { error } = await requirePortal('setup')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const body = await readJson(req);
        const updates = {}
        for (const key of ['name', 'rate', 'type', 'code', 'description', 'active']) {
            if (body[key] !== undefined) updates[key] = body[key]
        }
        const updated = await Tax.findByIdAndUpdate(id, { $set: updates }, { new: true });
        if (!updated) return NextResponse.json({ message: 'Tax not found' }, { status: 404 });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error('updateTax error:', error);
        return NextResponse.json({ message: 'Error updating tax' }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        const { error } = await requirePortal('setup')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const deleted = await Tax.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ message: 'Tax not found' }, { status: 404 });
        return NextResponse.json({ message: 'Tax deleted' }, { status: 200 });
    } catch (error) {
        console.error('deleteTax error:', error);
        return NextResponse.json({ message: 'Error deleting tax' }, { status: 500 });
    }
};
