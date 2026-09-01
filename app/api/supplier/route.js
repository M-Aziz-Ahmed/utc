import { readJson } from '@/utils/readJson'
import Supplier from "@/models/Supplier";
import dbConnect from "@/utils/dbConnection";
import { requirePortal } from '@/utils/apiAuth'
import { NextResponse } from "next/server";

export const GET = async () => {
    const { error } = await requirePortal('setup')
    if (error) return error

    try {
        await dbConnect();
        const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
        return NextResponse.json(suppliers, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching suppliers' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        const { error } = await requirePortal('setup')
        if (error) return error

        await dbConnect();
        const body = await readJson(req);
        if (!body.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        const supplier = await Supplier.create({
            name: body.name,
            email: body.email || '',
            phone: body.phone || '',
            company: body.company || '',
            vat: body.vat || '',
            address: body.address || '',
            city: body.city || '',
            country: body.country || '',
            notes: body.notes || '',
        });
        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating supplier' }, { status: 500 });
    }
};
