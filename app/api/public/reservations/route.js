import { NextResponse } from 'next/server'
import dbConnect from '@/utils/dbConnection'
import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  vehicleTitle: { type: String },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  customerCountry: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  reservationFee: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema)

export async function POST(req) {
  try {
    await dbConnect()
    const body = await req.json()
    const { vehicleId, vehicleTitle, customerName, customerEmail, customerPhone, customerCountry, notes } = body

    if (!vehicleId || !customerName || !customerEmail) {
      return NextResponse.json({ message: 'Vehicle ID, name, and email are required' }, { status: 400 })
    }

    const existing = await Reservation.findOne({ vehicleId, status: { $in: ['pending', 'confirmed'] } })
    if (existing) {
      return NextResponse.json({ message: 'This vehicle is already reserved' }, { status: 409 })
    }

    const reservation = await Reservation.create({
      vehicleId,
      vehicleTitle,
      customerName,
      customerEmail,
      customerPhone,
      customerCountry,
      notes,
    })

    return NextResponse.json({ message: 'Reservation submitted successfully', id: reservation._id }, { status: 201 })
  } catch (error) {
    console.error('Reservation API error:', error)
    return NextResponse.json({ message: 'Error submitting reservation' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    await dbConnect()
    const reservations = await Reservation.find({}).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json(reservations, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching reservations' }, { status: 500 })
  }
}
