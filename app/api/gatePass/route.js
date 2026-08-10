import GatePass from "@/models/GatePass";
import Vehicle from "@/models/Vehicle";
import Yard from "@/models/Yard";
import Consignee from "@/models/Consignee";
import dbConnect from "@/utils/dbConnection";
import { saveImage } from "@/utils/uploadImage";
import { deleteFromCloudinary } from "@/utils/cloudinary";
import { unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

async function removeStoredImage(img) {
    if (!img || !img.path) return;
    try {
        if (img.cloudinary && img.publicId) {
            await deleteFromCloudinary(img.publicId);
        } else if (img.path.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', img.path);
            await unlink(filePath);
        }
    } catch (error) {
        console.error('Failed to remove image file:', img.path, error.message);
    }
}

async function nextGatePassNumber(type) {
    const prefix = type === 'IGP' ? 'IGP' : 'OGP';
    const counter = await GatePass.db.collection('counters').findOneAndUpdate(
        { _id: `gatePass_${prefix}` },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
    );
    return `${prefix}-${String(counter.seq).padStart(4, '0')}`;
}

export const GET = async (req) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const vehicleId = searchParams.get('vehicle');
        const filter = {};
        if (type) filter.type = type;
        if (vehicleId) filter.vehicle = vehicleId;
        const gatePasses = await GatePass.find(filter)
            .populate('vehicle', 'manufacturer model auctionGroup auctionVenue')
            .populate('yard', 'name location')
            .populate('consignee', 'name company')
            .sort({ createdAt: -1 });
        return NextResponse.json(gatePasses, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching gate passes' }, { status: 500 });
    }
};

export const POST = async (req) => {
    try {
        await dbConnect();

        const contentType = req.headers.get('content-type') || '';
        let body;
        let uploadedImages = [];

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const jsonRaw = formData.get('gatePass');
            body = jsonRaw ? JSON.parse(jsonRaw) : {};
            const files = formData.getAll('images');
            for (const file of files) {
                const image = await saveImage(file, 'gatePass');
                uploadedImages.push({ ...image, approved: null });
            }
        } else {
            body = await req.json();
        }

        if (!body.vehicle) return NextResponse.json({ message: 'Vehicle is required' }, { status: 400 });
        if (!body.type) return NextResponse.json({ message: 'Type is required' }, { status: 400 });

        if (uploadedImages.length > 0) {
            body.images = uploadedImages;
        }

        const vehicle = await Vehicle.findById(body.vehicle).lean();
        if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });

        if (body.type === 'IGP' && vehicle.physicalIn) {
            return NextResponse.json({
                message: 'Vehicle already checked in (IGP exists)',
                status: 'duplicate',
                physicalInDate: vehicle.physicalInDate,
            }, { status: 409 });
        }

        if (body.type === 'OGP' && !vehicle.physicalIn) {
            return NextResponse.json({ message: 'Vehicle must be checked in (IGP) before OGP' }, { status: 400 });
        }

        if (body.type === 'OGP' && vehicle.physicalOut) {
            return NextResponse.json({
                message: 'Vehicle already shipped (OGP exists)',
                status: 'duplicate',
                physicalOutDate: vehicle.physicalOutDate,
            }, { status: 409 });
        }

        body.gatePassNumber = await nextGatePassNumber(body.type);

        const gatePass = await GatePass.create(body);

        if (body.type === 'IGP') {
            const update = {
                physicalIn: true,
                physicalInDate: body.date || new Date(),
                yard: body.yard || undefined,
            };
            if (uploadedImages.length > 0) {
                const existing = Array.isArray(vehicle.gatePassImages) ? vehicle.gatePassImages : [];
                update.gatePassImages = [...existing, ...uploadedImages];
            }
            await Vehicle.findByIdAndUpdate(body.vehicle, update);
        }
        if (body.type === 'OGP') {
            await Vehicle.findByIdAndUpdate(body.vehicle, {
                physicalOut: true,
                physicalOutDate: body.date || new Date(),
                containerNumber: body.containerNumber || undefined,
                blNumber: body.blNumber || undefined,
            });
        }

        const populated = await GatePass.findById(gatePass._id)
            .populate('vehicle', 'manufacturer model auctionGroup auctionVenue')
            .populate('yard', 'name location')
            .populate('consignee', 'name company');
        return NextResponse.json(populated, { status: 201 });
    } catch (error) {
        console.error('Error creating gate pass:', error);
        return NextResponse.json({ message: 'Error creating gate pass', error: error.message }, { status: 500 });
    }
};

const VALID_STATUS_TRANSITIONS = {
    pending:   ['approved', 'cancelled'],
    approved:  ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

export const PATCH = async (req) => {
    try {
        await dbConnect();

        const contentType = req.headers.get('content-type') || '';
        let body;
        let uploadedImages = [];

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const jsonRaw = formData.get('gatePass');
            body = jsonRaw ? JSON.parse(jsonRaw) : {};
            const files = formData.getAll('images');
            for (const file of files) {
                const image = await saveImage(file, 'gatePass');
                uploadedImages.push({ ...image, approved: null });
            }
        } else {
            body = await req.json();
        }

        const { gatePassId, status, removeImages, approveImages, rejectImages } = body;

        if (!gatePassId) {
            return NextResponse.json({ message: 'Gate Pass ID is required' }, { status: 400 });
        }
        const hasReview = (Array.isArray(approveImages) && approveImages.length > 0) || (Array.isArray(rejectImages) && rejectImages.length > 0);
        if (!status && uploadedImages.length === 0 && !(Array.isArray(removeImages) && removeImages.length > 0) && !hasReview) {
            return NextResponse.json({ message: 'Status is required' }, { status: 400 });
        }

        const gatePass = await GatePass.findById(gatePassId).lean();
        if (!gatePass) {
            return NextResponse.json({ message: 'Gate pass not found' }, { status: 404 });
        }

        if (status) {
            const allowed = VALID_STATUS_TRANSITIONS[gatePass.status] || [];
            if (!allowed.includes(status)) {
                return NextResponse.json({
                    message: `Cannot transition from "${gatePass.status}" to "${status}". Allowed: ${allowed.join(', ') || 'none'}`,
                }, { status: 400 });
            }
        }

        const set = {};
        if (status) set.status = status;

        const removedSet = Array.isArray(removeImages) ? new Set(removeImages) : new Set();
        const approveSet = Array.isArray(approveImages) ? new Set(approveImages) : new Set();
        const rejectSet  = Array.isArray(rejectImages) ? new Set(rejectImages) : new Set();

        // ── Upload / remove photos ─────────────────────────────────────────────
        if (uploadedImages.length > 0 || removedSet.size > 0) {
            const currentImages = Array.isArray(gatePass.images) ? gatePass.images : [];
            const remaining = removedSet.size > 0 ? currentImages.filter(img => !removedSet.has(img?.path)) : currentImages;
            set.images = [...remaining, ...uploadedImages];

            if (removedSet.size > 0) {
                for (const img of currentImages) {
                    if (removedSet.has(img?.path)) await removeStoredImage(img);
                }
            }

            if (gatePass.vehicle) {
                const veh = await Vehicle.findById(gatePass.vehicle).lean();
                if (veh) {
                    const vehCurrent = Array.isArray(veh.gatePassImages) ? veh.gatePassImages : [];
                    const vehRemaining = removedSet.size > 0 ? vehCurrent.filter(img => !removedSet.has(img?.path)) : vehCurrent;
                    await Vehicle.findByIdAndUpdate(gatePass.vehicle, {
                        $set: { gatePassImages: [...vehRemaining, ...uploadedImages] },
                    });
                }
            }
        }

        // ── Approve / reject photos (review portal) ────────────────────────────
        if (hasReview) {
            const applyReview = (imgs = []) => imgs.map(img => {
                if (approveSet.has(img?.path)) return { ...img, approved: true };
                if (rejectSet.has(img?.path)) return { ...img, approved: false };
                return img;
            });
            set.images = applyReview(Array.isArray(set.images) ? set.images : (gatePass.images || []));

            if (gatePass.vehicle) {
                const veh = await Vehicle.findById(gatePass.vehicle).lean();
                if (veh) {
                    const vehImages = applyReview(Array.isArray(veh.gatePassImages) ? veh.gatePassImages : []);
                    const vehicleUpdate = { gatePassImages: vehImages };
                    // Publishing the vehicle to the website happens once any photo is approved.
                    if (approveSet.size > 0 && vehImages.some(img => img?.approved === true)) {
                        vehicleUpdate.published = true;
                    }
                    await Vehicle.findByIdAndUpdate(gatePass.vehicle, { $set: vehicleUpdate });
                }
            }
        }

        const updated = await GatePass.findByIdAndUpdate(
            gatePassId,
            { $set: set },
            { new: true }
        )
            .populate('vehicle', 'manufacturer model auctionGroup auctionVenue')
            .populate('yard', 'name location')
            .populate('consignee', 'name company');

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error('Error updating gate pass:', error);
        return NextResponse.json({ message: 'Error updating gate pass', error: error.message }, { status: 500 });
    }
};

export const DELETE = async (req) => {
    try {
        await dbConnect();
        const { gatePassId } = await req.json();
        if (!gatePassId) {
            return NextResponse.json({ message: 'Gate Pass ID is required' }, { status: 400 });
        }

        const gatePass = await GatePass.findById(gatePassId).lean();
        if (!gatePass) {
            return NextResponse.json({ message: 'Gate pass not found' }, { status: 404 });
        }

        for (const img of gatePass.images || []) {
            await removeStoredImage(img);
        }

        await GatePass.findByIdAndDelete(gatePassId);

        if (gatePass.vehicle) {
            if (gatePass.type === 'IGP') {
                await Vehicle.findByIdAndUpdate(gatePass.vehicle, {
                    $set: { physicalIn: false, physicalInDate: null, gatePassImages: [] },
                });
            } else if (gatePass.type === 'OGP') {
                await Vehicle.findByIdAndUpdate(gatePass.vehicle, {
                    $set: { physicalOut: false, physicalOutDate: null, containerNumber: '', blNumber: '' },
                });
            }
        }

        return NextResponse.json({ message: 'Gate pass deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting gate pass:', error);
        return NextResponse.json({ message: 'Error deleting gate pass', error: error.message }, { status: 500 });
    }
};
