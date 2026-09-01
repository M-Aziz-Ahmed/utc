import { readJson } from '@/utils/readJson'
import Consignee from "@/models/Consignee";
import dbConnect from "@/utils/dbConnection";
import { requirePortal } from '@/utils/apiAuth'
import { NextResponse } from "next/server";

export const GET = async () => {
    const { error } = await requirePortal('manage')
    if (error) return error

    try {
        await dbConnect();
        const consignees = await Consignee.find({}).sort({ createdAt: -1 });
        return NextResponse.json(consignees, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching consignees' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        const { error } = await requirePortal('manage')
        if (error) return error

        await dbConnect();
        const body = await readJson(req);
        if (!body.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        const consignee = await Consignee.create({
            name: body.name,
            email: body.email || '',
            phone: body.phone || '',
            company: body.company || '',
            vat: body.vat || '',
            address: body.address || '',
            city: body.city || '',
            country: body.country || '',
            notes: body.notes || '',
            label: body.label || '',
            purchasedAmount: body.purchasedAmount === undefined ? undefined : Number(body.purchasedAmount),
        });
        return NextResponse.json(consignee, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating consignee' }, { status: 500 });
    }
};
