import { uploadToCloudinary } from "@/utils/cloudinary"
import { requirePortal } from "@/utils/apiAuth"
import { NextResponse } from "next/server"

export const POST = async (req) => {
    try {
        const { error } = await requirePortal('review')
        if (error) return error

        const formData = await req.formData()
        const file = formData.get('file')
        if (!file) return NextResponse.json({ message: 'No file provided' }, { status: 400 })

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const result = await uploadToCloudinary(buffer, 'utc/vehicles')

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        }, { status: 200 })
    } catch (error) {
        console.error('upload error:', error)
        return NextResponse.json({ message: 'Upload failed' }, { status: 500 })
    }
}
