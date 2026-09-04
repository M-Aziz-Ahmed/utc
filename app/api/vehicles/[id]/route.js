import { readJson } from '@/utils/readJson'
import Vehicle from "@/models/Vehicle"
import DynamicFields from "@/models/DynamicFeilds"
import dbConnect from "@/utils/dbConnection"
import { notifyAdmins } from '@/utils/notify'
import { requirePortal } from '@/utils/apiAuth'
import mongoose from 'mongoose'
import { NextResponse } from "next/server"

export const GET = async (req, { params }) => {
    try {
        const { error } = await requirePortal('vehicles')
        if (error) return error

        await dbConnect()
        const { id } = await params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        let vehicle
        try {
            vehicle = await Vehicle.findById(id).populate('rikusoCompany').lean()
        } catch (populateErr) {
            vehicle = await Vehicle.findById(id).lean()
        }
        if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })
        return NextResponse.json(vehicle, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching vehicle', error: error.message }, { status: 500 })
    }
}

export const PATCH = async (req, { params }) => {
    try {
        const { error } = await requirePortal('vehicles')
        if (error) return error

        await dbConnect()
        const { id } = await params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
        }
        const body = await readJson(req)

        // Strip dots from keys — MongoDB rejects field names with dots in $set
        const sanitized = {}
        for (const [k, v] of Object.entries(body)) {
            sanitized[k.replace(/\./g, '')] = v
        }

        const updated = await Vehicle.findByIdAndUpdate(
            id,
            { $set: sanitized },
            { new: true }
        )
        if (!updated) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })

        // ── Notify when account fields are saved ───────────────────────────────
        // The account save always includes 'mainImageUrl' in the payload.
        // We also check for at least one account-type field keyword.
        try {
            const isAccountSave = 'mainImageUrl' in body

            if (isAccountSave) {
                // Count how many account fields are now filled on the updated vehicle
                const accountFields = await DynamicFields.find({ belongsto: 'accounts' }).lean()
                const filled = accountFields.filter(f => {
                    const v = updated[f._id] ?? updated[f.label]
                    return v !== undefined && v !== null && v !== ''
                }).length
                const total = accountFields.length
                const pct = total > 0 ? Math.round((filled / total) * 100) : 0

                const vName = [updated.manufacturer, updated.model].filter(Boolean).join(' ')
                notifyAdmins({
                    type: 'account_updated',
                    message: `Account updated: ${vName || 'Vehicle'} — ${filled}/${total} fields (${pct}%)`,
                    vehicleId: id,
                    link: `/admin/vehicles/accounts/${id}`,
                })
            }
        } catch { /* non-blocking */ }
        // ──────────────────────────────────────────────────────────────────────

        return NextResponse.json(updated, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: 'Error updating vehicle', error: error.message }, { status: 500 })
    }
}
