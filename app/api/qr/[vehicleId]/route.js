import QRCode from 'qrcode'
import Vehicle from '@/models/Vehicle'
import dbConnect from '@/utils/dbConnection'
import { NextResponse } from 'next/server'

export const GET = async (req, { params }) => {
    try {
        const { vehicleId } = await params
        await dbConnect()

        const vehicle = await Vehicle.findById(vehicleId).lean()
        if (!vehicle) {
            return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })
        }

        // QR points at the public tracking page so a normal phone scan shows where the car is.
        // The yard scanner also understands this URL format (see /admin/yard/scan).
        const origin = new URL(req.url).origin
        const trackUrl = `${origin}/track/${vehicle._id.toString()}`

        const qrDataUrl = await QRCode.toDataURL(trackUrl, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        })

        return NextResponse.json({
            vehicleId: vehicle._id,
            manufacturer: vehicle.manufacturer,
            model: vehicle.model,
            trackUrl,
            qr: qrDataUrl,
        }, { status: 200 })
    } catch (error) {
        console.error('QR generation error:', error)
        return NextResponse.json({ message: 'Error generating QR code' }, { status: 500 })
    }
}
