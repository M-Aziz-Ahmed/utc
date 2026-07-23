import Vehicle from "@/models/Vehicle"
import dbConnect from "@/utils/dbConnection"
import { NextResponse } from "next/server"

export const GET = async (req, { params }) => {
    try {
        await dbConnect()
        const { id } = await params
        let vehicle
        try {
            vehicle = await Vehicle.findById(id).populate('rikusoCompany').lean()
        } catch (populateErr) {
            // If populate fails (e.g. rikusoCompany holds a non-ObjectId), fetch without it
            vehicle = await Vehicle.findById(id).lean()
        }
        if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })
        return NextResponse.json(vehicle, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching vehicle', error: error.message }, { status: 500 })
    }
}

export const PATCH = async (req, { params }) => {
    try {
        await dbConnect()
        const { id } = await params
        const body = await req.json()

        // Strip dots from keys — MongoDB rejects field names with dots in $set
        const sanitized = {}
        for (const [k, v] of Object.entries(body)) {
            sanitized[k.replace(/\./g, '')] = v
        }

        const updated = await Vehicle.findByIdAndUpdate(
            id,
            { $set: sanitized },
            { new: true }
        )
        if (!updated) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })
        return NextResponse.json(updated, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: 'Error updating vehicle', error: error.message }, { status: 500 })
    }
}
