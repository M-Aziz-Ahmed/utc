import Vehicle from "@/models/Vehicle"
import dbConnect from "@/utils/dbConnection"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { cookies } from "next/headers"

export const POST = async (req) => {
    try {
        const formData = await req.formData();
        const vehicleDataString = formData.get('vehicleData');
        const body = JSON.parse(vehicleDataString);

        await dbConnect();

        // Get user from cookie if available
        const cookieStore = await cookies();
        const userCookie = cookieStore.get('user');
        let userId = null;
        if (userCookie) {
            try {
                const userData = JSON.parse(decodeURIComponent(userCookie.value));
                userId = userData.id;
            } catch (e) {
                // Cookie parsing failed, continue without user
            }
        }

        // Handle file uploads
        const uploadedFiles = [];
        const dynamicFieldFiles = {};
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'vehicles');
        
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
                    path: `/uploads/vehicles/${fileName}`,
                    size: file.size,
                    type: file.type
                };

                // Check if this is a dynamic field file
                if (key.startsWith('dynamic_')) {
                    // Extract field label from key (format: dynamic_FieldLabel_index)
                    const parts = key.split('_');
                    const fieldLabel = parts.slice(1, -1).join('_');
                    
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

        // Create a clean object for vehicle data
        const vehicleData = {};
        Object.keys(body).forEach(key => {
            const value = body[key];
            // Skip any field that looks like it contains file data (arrays or stringified arrays)
            // These will be handled separately from the actual file uploads
            if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                try {
                    const parsed = JSON.parse(value);
                    // If it's an array of objects with file-like properties, skip it
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name && parsed[0].path) {
                        return; // Skip this field
                    }
                } catch (e) {
                    // Not JSON, include it
                }
            }
            // Skip 'files' field to avoid conflicts
            if (key !== 'files') {
                vehicleData[key] = value;
            }
        });

        // Add files to vehicle data only if we have uploaded files
        if (uploadedFiles.length > 0) {
            vehicleData.files = uploadedFiles;
        }

        // Add dynamic field files to vehicleData
        if (Object.keys(dynamicFieldFiles).length > 0) {
            Object.entries(dynamicFieldFiles).forEach(([fieldLabel, files]) => {
                vehicleData[fieldLabel] = files;
            });
        }

        // Add user reference if available
        if (userId) {
            vehicleData.createdBy = userId;
        }

        const newVehicle = await Vehicle.create(vehicleData);
        
        return NextResponse.json(
            { 
                message: 'Vehicle added successfully',
                vehicleId: newVehicle._id,
                filesUploaded: uploadedFiles.length,
                dynamicFilesUploaded: Object.keys(dynamicFieldFiles).length
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('addVehicle error:', error);
        return NextResponse.json({ 
            message: 'Error adding vehicle',
            error: error.message 
        }, { status: 500 });
    }
}

export const GET = async () => {
    try {
        await dbConnect();
        const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
        return NextResponse.json(vehicles, { status: 200 });
    } catch (error) {
        console.error('getVehicles error:', error);
        return NextResponse.json({ message: 'Error fetching vehicles' }, { status: 500 });
    }
}
