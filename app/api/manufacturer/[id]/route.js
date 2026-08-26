import { readJson } from '@/utils/readJson'
import Manufacturer from "@/models/Manufacturer";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const item = await Manufacturer.findById(id);
        if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching manufacturer' }, { status: 500 });
    }
};

export const PATCH = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await readJson(req);

        // Cast dimension values to numbers if models are being updated
        if (body.models && Array.isArray(body.models)) {
            body.models = body.models.map(m => ({
                ...m,
                dimensions: m.dimensions ? {
                    length:      m.dimensions.length !== '' && m.dimensions.length != null ? Number(m.dimensions.length) : undefined,
                    width:       m.dimensions.width !== '' && m.dimensions.width != null ? Number(m.dimensions.width) : undefined,
                    height:      m.dimensions.height !== '' && m.dimensions.height != null ? Number(m.dimensions.height) : undefined,
                    weight:      m.dimensions.weight !== '' && m.dimensions.weight != null ? Number(m.dimensions.weight) : undefined,
                    unit_size:   m.dimensions.unit_size || 'cm',
                    unit_weight: m.dimensions.unit_weight || 'kg',
                } : {},
                defaults: m.defaults || {},
            }))
        }

        const updated = await Manufacturer.findByIdAndUpdate(id, { $set: body }, { new: true });
        if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating manufacturer' }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await Manufacturer.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting manufacturer' }, { status: 500 });
    }
};
