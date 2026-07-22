import GatePass from '@/models/GatePass'
import Vehicle from '@/models/Vehicle'
import dbConnect from '@/utils/dbConnection'
import { NextResponse } from 'next/server'

export const POST = async (req) => {
    try {
        await dbConnect()
        const { vehicleId, yardId } = await req.json()

        if (!vehicleId) {
            return NextResponse.json({ message: 'Vehicle ID is required' }, { status: 400 })
        }
        if (!yardId) {
            return NextResponse.json({ message: 'Yard is required' }, { status: 400 })
        }

        const vehicle = await Vehicle.findById(vehicleId).lean()
        if (!vehicle) {
            return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })
        }

        if (vehicle.physicalIn) {
            return NextResponse.json({
                message: 'Vehicle already checked in',
                status: 'duplicate',
                vehicle: {
                    _id: vehicle._id,
                    manufacturer: vehicle.manufacturer,
                    model: vehicle.model,
                    physicalInDate: vehicle.physicalInDate,
                    yard: vehicle.yard,
                },
            }, { status: 409 })
        }

        const count = await GatePass.countDocuments({ type: 'IGP' })
        const gatePassNumber = `IGP-${String(count + 1).padStart(4, '0')}`

        const gatePass = await GatePass.create({
            vehicle: vehicleId,
            type: 'IGP',
            gatePassNumber,
            yard: yardId,
            date: new Date(),
            status: 'completed',
        })

        await Vehicle.findByIdAndUpdate(vehicleId, {
            physicalIn: true,
            physicalInDate: new Date(),
            yard: yardId,
        })

        const populated = await GatePass.findById(gatePass._id)
            .populate('vehicle', 'manufacturer model auctionGroup auctionVenue')
            .populate('yard', 'name location')

        return NextResponse.json({
            message: 'Vehicle checked in successfully',
            gatePass: populated,
            vehicle: {
                _id: vehicle._id,
                manufacturer: vehicle.manufacturer,
                model: vehicle.model,
            },
        }, { status: 201 })
    } catch (error) {
        console.error('QR scan error:', error)
        return NextResponse.json({ message: 'Error processing scan' }, { status: 500 })
    }
}
