import DynamicFeilds from "@/models/DynamicFeilds";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

// PATCH /api/fields/reorder
// Body: { updates: [{ id, order, showOnCard? }] }
export const PATCH = async (req) => {
    try {
        await dbConnect();
        const { updates } = await req.json();
        if (!Array.isArray(updates)) {
            return NextResponse.json({ message: 'updates array required' }, { status: 400 });
        }

        await Promise.all(updates.map(({ id, order, showOnCard }) => {
            const set = {};
            if (order !== undefined) set.order = order;
            if (showOnCard !== undefined) set.showOnCard = showOnCard;
            return DynamicFeilds.findByIdAndUpdate(id, { $set: set });
        }));

        return NextResponse.json({ message: 'Fields updated' }, { status: 200 });
    } catch (error) {
        console.error('reorder error:', error);
        return NextResponse.json({ message: 'Error updating fields' }, { status: 500 });
    }
};
