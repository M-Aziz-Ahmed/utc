import { readJson } from '@/utils/readJson'
import Manufacturer from "@/models/Manufacturer";
import dbConnect from "@/utils/dbConnection";
import { requirePortal } from '@/utils/apiAuth'
import { NextResponse } from "next/server";

export const GET = async () => {
    const { error } = await requirePortal('setup')
    if (error) return error

    try {
        await dbConnect();
        const manufacturers = await Manufacturer.find({}).sort({ createdAt: -1 });
        return NextResponse.json(manufacturers, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching manufacturers' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        const { error } = await requirePortal('setup')
        if (error) return error

        await dbConnect();
        const body = await readJson(req);
        if (!body.name) return NextResponse.json({ message: 'Manufacturer name is required' }, { status: 400 });
        const manufacturer = await Manufacturer.create({
            name: body.name,
            country: body.country || '',
            models: Array.isArray(body.models) ? body.models : [],
            companyName: body.companyName || '',
            contactPerson: body.contactPerson || '',
            tel: body.tel || '',
            bankName: body.bankName || '',
            accountTitle: body.accountTitle || '',
            accountNumber: body.accountNumber || '',
            mob: body.mob || '',
            telSharp: body.telSharp || '',
            fax: body.fax || '',
            email: body.email || '',
            address: body.address || '',
            isRikusoCompany: !!body.isRikusoCompany,
        });
        return NextResponse.json(manufacturer, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating manufacturer' }, { status: 500 });
    }
};
