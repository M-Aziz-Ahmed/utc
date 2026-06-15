import auctionDetails from "@/models/AuctionGroup";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    await dbConnect();
    const body = await req.json();
    const name = (body.name?.trim()) || (body.options?.[0]?.group?.trim());
    if (!name) {
        return NextResponse.json(
            { error: 'Auction group name is required' },
            { status: 400 }
        );
    }
    const options = Array.isArray(body.options) ? body.options : [];

    try {
        await auctionDetails.create({ name, options });
        return NextResponse.json(
            { message: 'Auction details saved successfully' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error.message, details: error.errors || null },
            { status: 500 }
        );
    }
}

export const GET = async (req) => {
    await dbConnect();
    const auctionDetail = await auctionDetails.find();
    return NextResponse.json(auctionDetail, { status: 200 });
}