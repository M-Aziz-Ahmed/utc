import AuctionDetails from '@/models/AuctionDetails'
import dbConnect from '@/utils/dbConnection'
import { NextResponse } from 'next/server'

export const GET = async () => {
    try {
        await dbConnect()
        const details = await AuctionDetails.find().sort({ createdAt: -1 })
        return NextResponse.json(details, { status: 200 })
    } catch (error) {
        console.error('getAuctionDetails error:', error)
        return NextResponse.json({ error: 'Error fetching auction details' }, { status: 500 })
    }
}

export const POST = async (req) => {
    try {
        await dbConnect()
        const body = await req.json()

        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({ error: 'Request body is required' }, { status: 400 })
        }

        const newRecord = await AuctionDetails.create({ record: body })
        return NextResponse.json({ message: 'Auction details saved successfully', id: newRecord._id }, { status: 201 })
    } catch (error) {
        console.error('createAuctionDetails error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
