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

        const qrData = JSON.stringify({
            type: 'UTC_VEHICLE',
            id: vehicle._id.toString(),
            manufacturer: vehicle.manufacturer || '',
            model: vehicle.model || '',
        })

        const qrDataUrl = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        })

        return NextResponse.json({
            vehicleId: vehicle._id,
            manufacturer: vehicle.manufacturer,
            model: vehicle.model,
            qr: qrDataUrl,
        }, { status: 200 })
    } catch (error) {
        console.error('QR generation error:', error)
        return NextResponse.json({ message: 'Error generating QR code' }, { status: 500 })
    }
}
