import AuctionGroup from '@/models/AuctionGroup'
import dbConnect from '@/utils/dbConnection'
import { NextResponse } from 'next/server'

export const GET = async () => {
    try {
        await dbConnect()
        const groups = await AuctionGroup.find().sort({ createdAt: -1 })
        return NextResponse.json(groups, { status: 200 })
    } catch (error) {
        console.error('getAuctionGroups error:', error)
        return NextResponse.json({ error: 'Error fetching auction groups' }, { status: 500 })
    }
}

export const POST = async (req) => {
    try {
        await dbConnect()
        const body = await req.json()
        const name = body.name?.trim() || body.options?.[0]?.group?.trim()

        if (!name) {
            return NextResponse.json({ error: 'Auction group name is required' }, { status: 400 })
        }

        const options = Array.isArray(body.options) ? body.options : []
        const group = await AuctionGroup.create({ name, options })
        return NextResponse.json({ message: 'Auction group saved successfully', group }, { status: 201 })
    } catch (error) {
        console.error('createAuctionGroup error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export const PATCH = async (req) => {
    try {
        await dbConnect()
        const { id, ...updates } = await req.json()
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const updated = await AuctionGroup.findByIdAndUpdate(id, updates, { new: true })
        if (!updated) return NextResponse.json({ error: 'Auction group not found' }, { status: 404 })

        return NextResponse.json({ message: 'Auction group updated', group: updated }, { status: 200 })
    } catch (error) {
        console.error('updateAuctionGroup error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export const DELETE = async (req) => {
    try {
        await dbConnect()
        const { id } = await req.json()
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const deleted = await AuctionGroup.findByIdAndDelete(id)
        if (!deleted) return NextResponse.json({ error: 'Auction group not found' }, { status: 404 })

        return NextResponse.json({ message: 'Auction group deleted' }, { status: 200 })
    } catch (error) {
        console.error('deleteAuctionGroup error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
