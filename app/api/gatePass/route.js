import GatePass from "@/models/GatePass";
import Vehicle from "@/models/Vehicle";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

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
        const body = await req.json();
        if (!body.vehicle) return NextResponse.json({ message: 'Vehicle is required' }, { status: 400 });
        if (!body.type) return NextResponse.json({ message: 'Type is required' }, { status: 400 });

        const count = await GatePass.countDocuments({ type: body.type });
        const prefix = body.type === 'IGP' ? 'IGP' : 'OGP';
        body.gatePassNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;

        const gatePass = await GatePass.create(body);

        if (body.type === 'IGP') {
            await Vehicle.findByIdAndUpdate(body.vehicle, {
                physicalIn: true,
                physicalInDate: body.date || new Date(),
                yard: body.yard || undefined,
            });
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
        return NextResponse.json({ message: 'Error creating gate pass' }, { status: 500 });
    }
};
