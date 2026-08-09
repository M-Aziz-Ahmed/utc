import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { uploadToCloudinary } from './cloudinary'

function safeName(name) {
    return String(name).replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function saveImage(file, folder = 'utc') {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
        const result = await uploadToCloudinary(buffer, `utc/${folder}`)
        return {
            name: file.name,
            path: result.secure_url,
            publicId: result.public_id,
            size: file.size,
            type: file.type,
            cloudinary: true,
        }
    } catch (error) {
        console.error(`Cloudinary upload failed for ${folder}, falling back to local storage:`, error.message)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
        await mkdir(uploadDir, { recursive: true })
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 11)
        const fileName = `${timestamp}_${randomStr}_${safeName(file.name)}`
        await writeFile(path.join(uploadDir, fileName), buffer)
        return {
            name: file.name,
            path: `/uploads/${folder}/${fileName}`,
            size: file.size,
            type: file.type,
            cloudinary: false,
        }
    }
}
