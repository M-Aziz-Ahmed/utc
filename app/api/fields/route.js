import { readJson } from '@/utils/readJson'
import DynamicFeilds from "@/models/DynamicFeilds";
import dbConnect from "@/utils/dbConnection";
import { requirePortal } from '@/utils/apiAuth'
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await dbConnect();
        const fields = await DynamicFeilds.find({}).sort({ order: 1 });
        return NextResponse.json(fields, { status: 200 });
    } catch (error) {
        console.error('getFields error:', error);
        return NextResponse.json({ message: 'error fetching fields' }, { status: 500 });
    }
};

export const POST = async (req) => {
    const { error } = await requirePortal('fields')
    if (error) return error

    const body = await readJson(req);
    const { belongsto } = body;
    try {
        await dbConnect();
        const fields = await DynamicFeilds.find({ belongsto }).sort({ order: 1 });
        return NextResponse.json(fields, { status: 200 });
    } catch (error) {
        console.error('getFields error:', error);
        return NextResponse.json({ message: 'error fetching fields' }, { status: 500 });
    }
};
