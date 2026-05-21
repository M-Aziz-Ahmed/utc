import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const POST = async (req) => {
    try {
        const formData = await req.formData();
        const userDataString = formData.get('userData');
        const body = JSON.parse(userDataString);
        const { email } = body;

        await dbConnect();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'user already exists' }, { status: 400 });
        }

        // Handle file uploads
        const uploadedFiles = [];
        const dynamicFieldFiles = {};
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'users');
        
        // Create upload directory if it doesn't exist
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Directory might already exist
        }

        // Process all files
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const file = value;
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substr(2, 9);
                const fileName = `${timestamp}_${randomStr}_${file.name}`;
                const filePath = path.join(uploadDir, fileName);
                
                // Convert file to buffer and save
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await writeFile(filePath, buffer);
                
                const fileInfo = {
                    name: file.name,
                    path: `/uploads/users/${fileName}`,
                    size: file.size,
                    type: file.type
                };

                // Check if this is a dynamic field file
                if (key.startsWith('dynamic_')) {
                    // Extract field label from key (format: dynamic_FieldLabel_index)
                    const parts = key.split('_');
                    const fieldLabel = parts.slice(1, -1).join('_'); // Get everything between 'dynamic_' and the last '_index'
                    
                    if (!dynamicFieldFiles[fieldLabel]) {
                        dynamicFieldFiles[fieldLabel] = [];
                    }
                    dynamicFieldFiles[fieldLabel].push(fileInfo);
                } else if (key.startsWith('file_')) {
                    // Regular file upload
                    uploadedFiles.push(fileInfo);
                }
            }
        }

        // Add files to user data if any were uploaded
        if (uploadedFiles.length > 0) {
            body.files = uploadedFiles;
        }

        // Add dynamic field files to body
        if (Object.keys(dynamicFieldFiles).length > 0) {
            Object.entries(dynamicFieldFiles).forEach(([fieldLabel, files]) => {
                body[fieldLabel] = files;
            });
        }

        const newUser = await User.create(body);
        const cookieValue = `user=${encodeURIComponent(JSON.stringify({ id: newUser._id }))}; Path=/; HttpOnly; SameSite=Lax`;
        
        return NextResponse.json(
            { 
                message: 'user created successfully',
                filesUploaded: uploadedFiles.length,
                dynamicFilesUploaded: Object.keys(dynamicFieldFiles).length
            },
            {
                status: 200,
                headers: {
                    'Set-Cookie': cookieValue,
                },
            }
        );
    } catch (error) {
        console.error('createUser error:', error);
        return NextResponse.json({ message: 'error creating user' }, { status: 500 });
    }
}