import { readJson } from '@/utils/readJson'
import Consignee from "@/models/Consignee";
import dbConnect from "@/utils/dbConnection";
import { requirePortal } from '@/utils/apiAuth'
import mongoose from 'mongoose'
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        const { error } = await requirePortal('manage')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const item = await Consignee.findById(id);
        if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching consignee' }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        const { error } = await requirePortal('manage')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const body = await readJson(req);
        const updates = {}
        for (const key of ['name', 'email', 'phone', 'company', 'vat', 'address', 'city', 'country', 'notes', 'label']) {
            if (body[key] !== undefined) updates[key] = body[key]
        }
        if (body.purchasedAmount !== undefined) updates.purchasedAmount = Number(body.purchasedAmount)
        const updated = await Consignee.findByIdAndUpdate(id, { $set: updates }, { new: true });
        if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating consignee' }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        const { error } = await requirePortal('manage')
        if (error) return error

        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const deleted = await Consignee.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting consignee' }, { status: 500 });
    }
};
