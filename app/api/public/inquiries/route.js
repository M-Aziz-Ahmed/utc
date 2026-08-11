import { readJson } from '@/utils/readJson'
import { NextResponse } from 'next/server'
import dbConnect from '@/utils/dbConnection'
import mongoose from 'mongoose'

const inquirySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  country: { type: String },
  message: { type: String },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehicleTitle: { type: String },
  status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
})

const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema)

export async function POST(req) {
  try {
    await dbConnect()
    const body = await readJson(req)
    const { fullName, email, phone, country, message, vehicleId, vehicleTitle } = body

    if (!fullName || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 })
    }

    const inquiry = await Inquiry.create({
      fullName,
      email,
      phone,
      country,
      message,
      vehicleId,
      vehicleTitle,
    })

    return NextResponse.json({ message: 'Inquiry submitted successfully', id: inquiry._id }, { status: 201 })
  } catch (error) {
    console.error('Inquiry API error:', error)
    return NextResponse.json({ message: 'Error submitting inquiry' }, { status: 500 })
  }
}

export async function GET(req) {
  try {
    await dbConnect()
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json(inquiries, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching inquiries' }, { status: 500 })
  }
}
