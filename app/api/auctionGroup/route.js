import { readJson } from '@/utils/readJson'
import AuctionGroup from '@/models/AuctionGroup'
import dbConnect from '@/utils/dbConnection'
import { requirePortal } from '@/utils/apiAuth'
import { NextResponse } from 'next/server'

export const GET = async () => {
    const { error } = await requirePortal('auction')
    if (error) return error

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
        const { error } = await requirePortal('auction')
        if (error) return error

        await dbConnect()
        const body = await readJson(req)
        const name = body.name?.trim() || body.options?.[0]?.group?.trim()

        if (!name) {
            return NextResponse.json({ error: 'Auction group name is required' }, { status: 400 })
        }

        const options = Array.isArray(body.options) ? body.options : []
        const group = await AuctionGroup.create({ name, options })
        return NextResponse.json({ message: 'Auction group saved successfully', group }, { status: 201 })
    } catch (error) {
        console.error('createAuctionGroup error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export const PATCH = async (req) => {
    try {
        const { error } = await requirePortal('auction')
        if (error) return error

        await dbConnect()
        const body = await readJson(req)
        const id = body.id
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const updates = {}
        if (body.name !== undefined) updates.name = body.name
        if (body.options !== undefined) updates.options = body.options

        const updated = await AuctionGroup.findByIdAndUpdate(id, updates, { new: true })
        if (!updated) return NextResponse.json({ error: 'Auction group not found' }, { status: 404 })

        return NextResponse.json({ message: 'Auction group updated', group: updated }, { status: 200 })
    } catch (error) {
        console.error('updateAuctionGroup error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export const DELETE = async (req) => {
    try {
        const { error } = await requirePortal('auction')
        if (error) return error

        await dbConnect()
        const { id } = await readJson(req)
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const deleted = await AuctionGroup.findByIdAndDelete(id)
        if (!deleted) return NextResponse.json({ error: 'Auction group not found' }, { status: 404 })

        return NextResponse.json({ message: 'Auction group deleted' }, { status: 200 })
    } catch (error) {
        console.error('deleteAuctionGroup error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
