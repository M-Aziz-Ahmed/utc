import auctionDetails from "@/models/AuctionGroup";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    await dbConnect();
    const body = await req.json();
    const newAuctionDetail = await auctionDetails.create(body);
    return NextResponse.json({ message: 'Auction details saved successfully' }, { status: 200 });
}

export const GET = async (req) => {
    await dbConnect();
    const auctionDetail = await auctionDetails.findOne();
    return NextResponse.json(auctionDetail, { status: 200 });
}