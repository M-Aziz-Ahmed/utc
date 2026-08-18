import { readJson } from '@/utils/readJson'
import HeroSlide from '@/models/HeroSlide'
import dbConnect from '@/utils/dbConnection'
import { saveImage } from '@/utils/uploadImage'
import { NextResponse } from 'next/server'

// GET — return all slides (sorted by order), optionally filter active only
export const GET = async (req) => {
    try {
        await dbConnect()
        const { searchParams } = new URL(req.url)
        const filter = {}
        if (searchParams.get('active') === 'true') filter.active = true
        const slides = await HeroSlide.find(filter).sort({ order: 1, createdAt: 1 })
        return NextResponse.json(slides, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: 'Error fetching hero slides', error: err.message }, { status: 500 })
    }
}

// POST — create a new slide (supports multipart for background image upload)
export const POST = async (req) => {
    try {
        await dbConnect()
        const contentType = req.headers.get('content-type') || ''
        let body = {}
        let uploadedImage = null

        if (contentType.includes('multipart/form-data')) {
            const fd = await req.formData()
            const raw = fd.get('slide')
            body = raw ? JSON.parse(raw) : {}
            const file = fd.get('backgroundImage')
            if (file && file.size > 0) {
                uploadedImage = await saveImage(file, 'hero')
            }
        } else {
            body = await readJson(req)
        }

        if (uploadedImage) {
            body.backgroundImage = uploadedImage.path
            body.publicId = uploadedImage.publicId || ''
        }

        // Auto-assign order if not provided
        if (body.order === undefined || body.order === null) {
            const count = await HeroSlide.countDocuments()
            body.order = count
        }

        const slide = await HeroSlide.create(body)
        return NextResponse.json(slide, { status: 201 })
    } catch (err) {
        return NextResponse.json({ message: 'Error creating hero slide', error: err.message }, { status: 500 })
    }
}

// PATCH — bulk reorder: body = { order: [id, id, id, ...] }
export const PATCH = async (req) => {
    try {
        await dbConnect()
        const body = await readJson(req)
        if (Array.isArray(body.order)) {
            await Promise.all(body.order.map((id, idx) =>
                HeroSlide.findByIdAndUpdate(id, { order: idx })
            ))
            return NextResponse.json({ ok: true })
        }
        return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
    } catch (err) {
        return NextResponse.json({ message: 'Error reordering slides', error: err.message }, { status: 500 })
    }
}
