import DynamicFeilds from "@/models/DynamicFeilds";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    const body = await req.json();
    const { label, type, isRequired, belongsto, options } = body;

    if (!label || !type) {
        return NextResponse.json({ message: 'Label and type are required' }, { status: 400 });
    }

    try {
        await dbConnect();

        const existing = await DynamicFeilds.findOne({ label });
        if (existing) {
            return NextResponse.json({ message: 'A field with this label already exists' }, { status: 400 });
        }

        // Auto-assign next order value within the same form
        const lastField = await DynamicFeilds.findOne({ belongsto }).sort({ order: -1 });
        const nextOrder = lastField ? (lastField.order ?? 0) + 1 : 0;

        const fieldData = {
            label,
            type,
            isRequired: isRequired ?? false,
            belongsto,
            order: nextOrder,
            showOnCard: true,
        };

        if (options && Array.isArray(options)) {
            fieldData.options = options;
        }

        const created = await DynamicFeilds.create(fieldData);
        return NextResponse.json({ message: 'Field created successfully', field: created }, { status: 201 });
    } catch (error) {
        console.error('newField error:', error);
        return NextResponse.json({ message: 'Error creating field' }, { status: 500 });
    }
};
