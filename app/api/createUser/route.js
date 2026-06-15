import User from '@/models/User'
import dbConnect from '@/utils/dbConnection'
import { setSessionCookie } from '@/utils/auth'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'

export const POST = async (req) => {
    try {
        const formData = await req.formData()
        const userDataString = formData.get('userData')
        const body = JSON.parse(userDataString)
        const { email, pass } = body

        if (!email || !pass) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
        }

        await dbConnect()
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 })
        }

        // Hash password before storing
        body.pass = await bcrypt.hash(pass, 12)

        // Handle file uploads
        const uploadedFiles = []
        const dynamicFieldFiles = {}
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'users')

        await mkdir(uploadDir, { recursive: true })

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const file = value
                const timestamp = Date.now()
                const randomStr = Math.random().toString(36).substring(2, 11)
                const fileName = `${timestamp}_${randomStr}_${file.name}`
                const filePath = path.join(uploadDir, fileName)

                const bytes = await file.arrayBuffer()
                await writeFile(filePath, Buffer.from(bytes))

                const fileInfo = {
                    name: file.name,
                    path: `/uploads/users/${fileName}`,
                    size: file.size,
                    type: file.type,
                }

                if (key.startsWith('dynamic_')) {
                    const parts = key.split('_')
                    const fieldLabel = parts.slice(1, -1).join('_')
                    if (!dynamicFieldFiles[fieldLabel]) dynamicFieldFiles[fieldLabel] = []
                    dynamicFieldFiles[fieldLabel].push(fileInfo)
                } else if (key.startsWith('file_')) {
                    uploadedFiles.push(fileInfo)
                }
            }
        }

        if (uploadedFiles.length > 0) body.files = uploadedFiles
        Object.entries(dynamicFieldFiles).forEach(([label, files]) => {
            body[label] = files
        })

        const newUser = await User.create(body)

        await setSessionCookie({
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name,
            role: newUser.role || 'User',
        })

        return NextResponse.json({
            message: 'User created successfully',
            filesUploaded: uploadedFiles.length,
        }, { status: 200 })

    } catch (error) {
        console.error('createUser error:', error)
        return NextResponse.json({ message: 'Error creating user' }, { status: 500 })
    }
}
