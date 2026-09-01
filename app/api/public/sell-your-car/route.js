import { NextResponse } from 'next/server'
import dbConnect from '@/utils/dbConnection'
import mongoose from 'mongoose'
import { uploadToCloudinary } from '@/utils/cloudinary'
import { requireAdmin } from '@/utils/apiAuth'

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
    }

    const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    const MAX_BYTES = 5 * 1024 * 1024
    const MAX_PHOTOS = 8

    const photoFiles = formData.getAll('photos').filter(f => f && typeof f === 'object' && f.size > 0)
    if (photoFiles.length > MAX_PHOTOS) {
      return NextResponse.json({ message: `You can upload at most ${MAX_PHOTOS} photos` }, { status: 400 })
    }
    for (const file of photoFiles) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ message: 'Each photo must be 5MB or smaller' }, { status: 400 })
      }
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json({ message: 'Only JPG, PNG, WEBP, and GIF images are allowed' }, { status: 400 })
      }
    }

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

    const cap = (v, n) => (v ? String(v).trim().slice(0, n) : '')
    const submission = await SellCarSubmission.create({
      make: cap(make, 100),
      model: cap(model, 100),
      year: cap(formData.get('year'), 20),
      mileage: cap(formData.get('mileage'), 30),
      condition: cap(formData.get('condition'), 50),
      priceExpectation: cap(formData.get('priceExpectation'), 50),
      contactName: cap(contactName, 200),
      email: String(email).trim().toLowerCase(),
      phone: cap(formData.get('phone'), 50),
      country: cap(formData.get('country'), 100),
      message: cap(formData.get('message'), 2000),
      photos: photoUrls,
    })

    return NextResponse.json({ message: 'Submission received successfully', id: submission._id }, { status: 201 })
  } catch (error) {
    console.error('Sell your car API error:', error)
    return NextResponse.json({ message: 'Error submitting your details' }, { status: 500 })
  }
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error
  try {
    await dbConnect()
    const submissions = await SellCarSubmission.find({}).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json(submissions, { status: 200 })
  } catch (error) {
    console.error('Sell your car GET error:', error)
    return NextResponse.json({ message: 'Error fetching submissions' }, { status: 500 })
  }
}
