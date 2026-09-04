import { readJson } from '@/utils/readJson'
import Vehicle from "@/models/Vehicle"
import dbConnect from "@/utils/dbConnection"
import { uploadToCloudinary } from "@/utils/cloudinary"
import { getSession } from '@/utils/auth'
import { notifyAdmins } from '@/utils/notify'
import { requirePortal } from '@/utils/apiAuth'
import { NextResponse } from "next/server"

// Extract a human-readable chassis number from a vehicle doc (dynamic fields
// store chassis under field _id / label, so we scan the keys defensively).
const chassisOf = (v) => {
    if (!v || typeof v !== 'object') return ''
    const staticKeys = ['chassisNumber', 'Chassis No.', 'Chassis No', 'Chassis Number', 'VIN', 'Chassis', 'chassis']
    for (const k of staticKeys) { const val = v[k]; if (val && String(val).trim()) return String(val).trim() }
    for (const [k, val] of Object.entries(v)) {
        if (!val || typeof val === 'object') continue
        const lk = k.toLowerCase().replace(/[\s._-]/g, '')
        if ((lk.includes('chassis') || lk === 'vin') && String(val).trim()) return String(val).trim()
    }
    return ''
}

export const POST = async (req) => {
    try {
        const { error } = await requirePortal('vehicles')
        if (error) return error

        const formData = await req.formData();
        const vehicleDataString = formData.get('vehicleData');
        const body = JSON.parse(vehicleDataString);

        await dbConnect();

        // Capture which admin created the vehicle (audit trail).
        const session = await getSession();
        const userId = session?.id || null;

        // Handle file uploads to Cloudinary
        const uploadedFiles = [];
        const dynamicFieldFiles = {};

        // Process all files
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const file = value;
                
                // Convert file to buffer
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                
                // Upload to Cloudinary
                const cloudinaryResult = await uploadToCloudinary(buffer, 'utc/vehicles');
                
                const fileInfo = {
                    name: file.name,
                    path: cloudinaryResult.secure_url, // Cloudinary URL
                    publicId: cloudinaryResult.public_id, // For deletion later
                    size: file.size,
                    type: file.type,
                    width: cloudinaryResult.width,
                    height: cloudinaryResult.height
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

        // Resolve mainImageUrl from mainImageIndex if provided
        // Format: "FieldLabel:index" e.g. "Vehicle Images:1"
        if (vehicleData.mainImageIndex && typeof vehicleData.mainImageIndex === 'string') {
            const [labelPart, idxPart] = vehicleData.mainImageIndex.split(':')
            const idx = parseInt(idxPart, 10)
            const fieldFiles = dynamicFieldFiles[labelPart]
            if (fieldFiles && !isNaN(idx) && fieldFiles[idx]) {
                vehicleData.mainImageUrl = fieldFiles[idx].path
            }
            delete vehicleData.mainImageIndex
        }

        // Add user reference if available
        if (userId) {
            vehicleData.createdBy = userId;
        }

        // Strip dots from all keys — MongoDB rejects field names containing dots
        const sanitizedData = {}
        for (const [k, v] of Object.entries(vehicleData)) {
            sanitizedData[k.replace(/\./g, '')] = v
        }

        // Assign the next sequential stock ID (1, 2, 3, ...) so every vehicle has
        // a short, human-friendly identifier that can be used across all searches.
        const lastStock = await Vehicle.findOne({}, { stockId: 1 }).sort({ stockId: -1 }).lean();
        sanitizedData.stockId = (lastStock?.stockId || 0) + 1;

        const newVehicle = await Vehicle.create(sanitizedData);

        // ── Notify all admins ──────────────────────────────────────────────────
        const vName = [sanitizedData.manufacturer, sanitizedData.model].filter(Boolean).join(' ')
        notifyAdmins({
            type: 'vehicle_added',
            message: `New vehicle added: ${vName || 'Unknown'} (Stock #${sanitizedData.stockId})`,
            vehicleId: String(newVehicle._id),
            link: `/admin/vehicles`,
        })
        // ──────────────────────────────────────────────────────────────────────

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
    const { error } = await requirePortal('vehicles')
    if (error) return error

    try {
        await dbConnect();
        const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
        return NextResponse.json(vehicles, { status: 200 });
    } catch (error) {
        console.error('getVehicles error:', error);
        return NextResponse.json({ message: 'Error fetching vehicles' }, { status: 500 });
    }
}

export const PATCH = async (req) => {
    try {
        const { error } = await requirePortal('vehicles')
        if (error) return error

        await dbConnect();
        const session = await getSession()
        const userId = session?.id || null
        const body = await readJson(req);
        const { vehicleId, ...updateData } = body;

        if (!vehicleId) {
            return NextResponse.json({ message: 'Vehicle ID is required' }, { status: 400 });
        }

        const sanitize = (obj) => {
            const out = {}
            for (const [k, v] of Object.entries(obj)) {
                const safeKey = k.replace(/\./g, '')
                out[safeKey] = v
            }
            return out
        }
        const safeUpdate = sanitize(updateData)

        // Capture old allocation before update for change detection
        const oldVehicle = await Vehicle.findById(vehicleId).select('allocation manufacturer model stockId rikusoCompanyName rikusoStatus').lean()

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { $set: safeUpdate },
            { new: true }
        );

        if (!updatedVehicle) {
            return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
        }

        // ── Notify on allocation change ────────────────────────────────────────
        if ('allocation' in updateData && updateData.allocation !== oldVehicle?.allocation) {
            const vName = [updatedVehicle?.manufacturer, updatedVehicle?.model].filter(Boolean).join(' ')
            const allocLabel = updatedVehicle.allocation === 'export' ? 'Export'
                : updatedVehicle.allocation === 'khitai' ? 'Khitai'
                : updatedVehicle.allocation === 'resale-to-auction' ? 'Resale'
                : 'Unallocated'
            const stockRef = updatedVehicle?.stockId ? `Stock #${updatedVehicle.stockId}` : ''
            const chassisRef = chassisOf(updatedVehicle)
            const refs = [stockRef, chassisRef ? `Chassis: ${chassisRef}` : ''].filter(Boolean).join(' · ')
            notifyAdmins({
                type: 'allocation_changed',
                message: `Allocation changed: ${vName || 'Vehicle'} → ${allocLabel}${refs ? ` (${refs})` : ''}`,
                vehicleId: vehicleId,
                link: `/admin/rikuso`,
            })
        }
        // ──────────────────────────────────────────────────────────────────────

        // ── Notify on Rikuso company change ────────────────────────────────────
        const newRikuso = updateData.rikusoCompanyName || updatedVehicle?.rikusoCompanyName
        const oldRikuso = oldVehicle?.rikusoCompanyName
        const rikusoChanged = (updateData.rikusoStatus !== undefined || 'rikusoCompany' in updateData || 'rikusoCompanyName' in updateData)
            && String(newRikuso || '') !== String(oldRikuso || '')
        if (rikusoChanged) {
            const vName = [updatedVehicle?.manufacturer, updatedVehicle?.model].filter(Boolean).join(' ')
            const stockRef = updatedVehicle?.stockId ? `Stock #${updatedVehicle.stockId}` : ''
            const chassisRef = chassisOf(updatedVehicle)
            const refs = [stockRef, chassisRef ? `Chassis: ${chassisRef}` : ''].filter(Boolean).join(' · ')
            notifyAdmins({
                type: 'rikuso_assigned',
                message: `Rikuso assigned: ${vName || 'Vehicle'} → ${newRikuso || 'None'}${refs ? ` (${refs})` : ''}`,
                vehicleId: vehicleId,
                link: `/admin/rikuso`,
            })
        }
        // ──────────────────────────────────────────────────────────────────────

        return NextResponse.json(updatedVehicle, { status: 200 });
    } catch (error) {
        console.error('updateVehicle error:', error);
        return NextResponse.json({ 
            message: 'Error updating vehicle',
            error: error.message 
        }, { status: 500 });
    }
}

// PUT — update existing vehicle (with optional new file uploads)
export const PUT = async (req) => {
    try {
        const { error } = await requirePortal('vehicles')
        if (error) return error

        const formData = await req.formData();
        const vehicleDataString = formData.get('vehicleData');
        const body = JSON.parse(vehicleDataString);
        const { vehicleId, ...updateFields } = body;

        if (!vehicleId) {
            return NextResponse.json({ message: 'Vehicle ID is required' }, { status: 400 });
        }

        await dbConnect();

        // Process any new file uploads
        const dynamicFieldFiles = {};
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const bytes = await value.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const cloudinaryResult = await uploadToCloudinary(buffer, 'utc/vehicles');
                const fileInfo = {
                    name: value.name,
                    path: cloudinaryResult.secure_url,
                    publicId: cloudinaryResult.public_id,
                    size: value.size,
                    type: value.type,
                    width: cloudinaryResult.width,
                    height: cloudinaryResult.height
                };
                if (key.startsWith('dynamic_')) {
                    const parts = key.split('_');
                    const fieldLabel = parts.slice(1, -1).join('_');
                    if (!dynamicFieldFiles[fieldLabel]) dynamicFieldFiles[fieldLabel] = [];
                    dynamicFieldFiles[fieldLabel].push(fileInfo);
                }
            }
        }

        // Merge new image arrays into updateFields (append to existing)
        if (Object.keys(dynamicFieldFiles).length > 0) {
            const existing = await Vehicle.findById(vehicleId).lean();
            Object.entries(dynamicFieldFiles).forEach(([label, newFiles]) => {
                const existingFiles = Array.isArray(existing?.[label]) ? existing[label] : [];
                updateFields[label] = [...existingFiles, ...newFiles];
            });
        }

        // Strip dots from keys — MongoDB rejects field names with dots in $set
        const sanitize = (obj) => {
            const out = {}
            for (const [k, v] of Object.entries(obj)) {
                out[k.replace(/\./g, '')] = v
            }
            return out
        }
        const safeFields = sanitize(updateFields)

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            vehicleId,
            { $set: safeFields },
            { new: true }
        );

        if (!updatedVehicle) {
            return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
        }

        return NextResponse.json(updatedVehicle, { status: 200 });
    } catch (error) {
        console.error('updateVehicle (PUT) error:', error);
        return NextResponse.json({ message: 'Error updating vehicle', error: error.message }, { status: 500 });
    }
}

export const DELETE = async (req) => {
    try {
        const { error } = await requirePortal('vehicles')
        if (error) return error

        await dbConnect();
        const { vehicleId } = await readJson(req);

        if (!vehicleId) {
            return NextResponse.json({ message: 'Vehicle ID is required' }, { status: 400 });
        }

        const existing = await Vehicle.findById(vehicleId).lean();
        if (!existing) {
            return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
        }

        if (existing.physicalIn) {
            return NextResponse.json({
                message: 'Vehicle has an Inward Gate Pass (IGP). Delete the IGP first before deleting this vehicle.',
            }, { status: 400 });
        }
        if (existing.physicalOut) {
            return NextResponse.json({
                message: 'Vehicle has an Outward Gate Pass (OGP). Delete the OGP first before deleting this vehicle.',
            }, { status: 400 });
        }

        const deleted = await Vehicle.findByIdAndDelete(vehicleId);
        if (!deleted) {
            return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Vehicle deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('deleteVehicle error:', error);
        return NextResponse.json({ message: 'Error deleting vehicle', error: error.message }, { status: 500 });
    }
}
