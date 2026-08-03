import { NextResponse } from 'next/server'
import dbConnect from '@/utils/dbConnection'
import mongoose from 'mongoose'
import { uploadToCloudinary } from '@/utils/cloudinary'

const sellCarSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String },
  mileage: { type: String },
  condition: { type: String },
  priceExpectation: { type: String },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  country: { type: String },
  message: { type: String },
  photos: [{ type: String }],
  status: { type: String, enum: ['new', 'reviewed', 'contacted', 'closed'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
})

const SellCarSubmission = mongoose.models.SellCarSubmission || mongoose.model('SellCarSubmission', sellCarSchema)

export async function POST(req) {
  try {
    await dbConnect()
    const formData = await req.formData()

    const make = formData.get('make') || ''
    const model = formData.get('model') || ''
    const contactName = formData.get('contactName') || ''
    const email = formData.get('email') || ''

    if (!make || !model || !contactName || !email) {
      return NextResponse.json({ message: 'Make, model, name, and email are required' }, { status: 400 })
    }

    const photoFiles = formData.getAll('photos').filter(f => f && typeof f === 'object' && f.size > 0)
    const photoUrls = []
    for (const file of photoFiles) {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const result = await uploadToCloudinary(buffer, 'utc/sell-your-car')
        photoUrls.push(result.secure_url)
      } catch (e) {
        console.error('Sell car photo upload error:', e)
      }
    }

    const submission = await SellCarSubmission.create({
      make,
      model,
      year: formData.get('year') || '',
      mileage: formData.get('mileage') || '',
      condition: formData.get('condition') || '',
      priceExpectation: formData.get('priceExpectation') || '',
      contactName,
      email,
      phone: formData.get('phone') || '',
      country: formData.get('country') || '',
      message: formData.get('message') || '',
      photos: photoUrls,
    })

    return NextResponse.json({ message: 'Submission received successfully', id: submission._id }, { status: 201 })
  } catch (error) {
    console.error('Sell your car API error:', error)
    return NextResponse.json({ message: 'Error submitting your details' }, { status: 500 })
  }
}

export async function GET() {
  try {
    await dbConnect()
    const submissions = await SellCarSubmission.find({}).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json(submissions, { status: 200 })
  } catch (error) {
    console.error('Sell your car API error:', error)
    return NextResponse.json({ message: 'Error fetching submissions' }, { status: 500 })
  }
}
