import { readJson } from '@/utils/readJson'
import HeroSlide from '@/models/HeroSlide'
import dbConnect from '@/utils/dbConnection'
import { deleteFromCloudinary } from '@/utils/cloudinary'
import { saveImage } from '@/utils/uploadImage'
import { requirePortal } from '@/utils/apiAuth'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

// PATCH — update a single slide (supports multipart for new image)
export const PATCH = async (req, { params }) => {
    try {
        const { error } = await requirePortal('website')
        if (error) return error

        await dbConnect()
        const { id } = await params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
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
            // Delete old Cloudinary image if present
            const existing = await HeroSlide.findById(id).lean()
            if (existing?.publicId) {
                try { await deleteFromCloudinary(existing.publicId) } catch {}
            }
            body.backgroundImage = uploadedImage.path
            body.publicId = uploadedImage.publicId || ''
        }

        const slide = await HeroSlide.findByIdAndUpdate(id, { $set: {
            order: body.order,
            active: body.active,
            backgroundImage: body.backgroundImage,
            publicId: body.publicId,
            overlay: body.overlay,
            textColor: body.textColor,
            badgeText: body.badgeText,
            heading: body.heading,
            headingAccent: body.headingAccent,
            subheading: body.subheading,
            ctaText: body.ctaText,
            ctaHref: body.ctaHref,
            features: Array.isArray(body.features) ? body.features : undefined,
        } }, { new: true })
        if (!slide) return NextResponse.json({ message: 'Slide not found' }, { status: 404 })
        return NextResponse.json(slide, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: 'Error updating slide' }, { status: 500 })
    }
}

// DELETE — remove a slide and its Cloudinary image
export const DELETE = async (req, { params }) => {
    try {
        const { error } = await requirePortal('website')
        if (error) return error

        await dbConnect()
        const { id } = await params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const slide = await HeroSlide.findByIdAndDelete(id)
        if (!slide) return NextResponse.json({ message: 'Slide not found' }, { status: 404 })
        if (slide.publicId) {
            try { await deleteFromCloudinary(slide.publicId) } catch {}
        }
        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: 'Error deleting slide' }, { status: 500 })
    }
}
