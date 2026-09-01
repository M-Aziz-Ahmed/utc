import { readJson } from '@/utils/readJson'
import Yard from "@/models/Yard";
import dbConnect from "@/utils/dbConnection";
import { requirePortal } from '@/utils/apiAuth'
import { NextResponse } from "next/server";

export const GET = async () => {
    const { error } = await requirePortal('yard')
    if (error) return error

    try {
        await dbConnect();
        const yards = await Yard.find({}).sort({ createdAt: -1 });
        return NextResponse.json(yards, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching yards' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        const { error } = await requirePortal('yard')
        if (error) return error

        await dbConnect();
        const body = await readJson(req);
        if (!body.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        const yard = await Yard.create({
            name: body.name,
            location: body.location || '',
            address: body.address || '',
            city: body.city || '',
            country: body.country || '',
            capacity: body.capacity,
            notes: body.notes || '',
        });
        return NextResponse.json(yard, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating yard' }, { status: 500 });
    }
};
