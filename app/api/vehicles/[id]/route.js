import { readJson } from '@/utils/readJson'
import Vehicle from "@/models/Vehicle"
import DynamicFields from "@/models/DynamicFeilds"
import dbConnect from "@/utils/dbConnection"
import { notifyAdmins } from '@/utils/notify'
import { requirePortalAny } from '@/utils/apiAuth'
import mongoose from 'mongoose'
import { NextResponse } from "next/server"

export const GET = async (req, { params }) => {
    try {
        const { error } = await requirePortalAny(['vehicles', 'accounts'])
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
        const { error } = await requirePortalAny(['vehicles', 'accounts'])
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

        // Read the previous costing state so we only notify on a real transition
        // (pending → complete), not on every periodic save.
        const prev = await Vehicle.findById(id).select('costingComplete manufacturer model stockId').lean()

        const updated = await Vehicle.findByIdAndUpdate(
            id,
            { $set: sanitized },
            { new: true }
        )
        if (!updated) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })

        // ── Notify when the approximate costing is finalised ───────────────────
        // Triggered by "costingComplete: true" from the accounts portal. The
        // costing total is resolved from the vehicle's stored fields so the
        // message and the Allocation form can show the approximate costing.
        const completing = sanitized.costingComplete === true && !prev?.costingComplete
        try {
            if (completing) {
                const accountFields = await DynamicFields.find({ belongsto: 'accounts' }).lean()

                // Resolve the final / costing price from the vehicle document.
                // The account form already stores computed sum/formula/tax values
                // under both the field label and the field _id — we scan for a
                // field whose label reads like the costing total.
                const costLabels = ['final price', 'costing price', 'total costing', 'approximate costing', 'costing']
                let costingTotal = null
                const readVal = (f) => updated[f._id] ?? updated[f.label] ?? updated[f.label?.replace(/\./g, '')]
                for (const f of accountFields) {
                    const label = (f.label || '').toLowerCase().trim()
                    if (costLabels.some(cl => label.includes(cl))) {
                        const num = Number(String(readVal(f) ?? '').replace(/[^0-9.\-]/g, ''))
                        if (!isNaN(num) && num !== 0) { costingTotal = num; break }
                    }
                }

                const vName = [updated.manufacturer, updated.model].filter(Boolean).join(' ')
                const stockRef = updated?.stockId ? ` Stock #${updated.stockId}` : ''
                const costPart = costingTotal !== null
                    ? ` — Approx. costing ${costingTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : ''

                // The costing is needed by the people who will allocate / price
                // the car: every admin, the accounts team and the allocation team.
                notifyAdmins({
                    type: 'costing_complete',
                    message: `Costing complete: ${vName || 'Vehicle'}${costPart}${stockRef}`,
                    vehicleId: id,
                    link: `/admin/rikuso`,
                    permissions: ['allocation', 'accounts'],
                })
            }
        } catch { /* non-blocking */ }
        // ──────────────────────────────────────────────────────────────────────

        // ── Notify when account fields are saved ───────────────────────────────
        // The account save always includes 'mainImageUrl' in the payload.
        // We also check for at least one account-type field keyword.
        try {
            const isAccountSave = 'mainImageUrl' in body

            if (isAccountSave && !completing) {
                // Count how many account fields are now filled on the updated vehicle
                const accountFields = await DynamicFields.find({ belongsto: 'accounts' }).lean()
                const filled = accountFields.filter(f => {
                    const v = updated[f._id] ?? updated[f.label]
                    return v !== undefined && v !== null && v !== ''
                }).length
                const total = accountFields.length
                const pct = total > 0 ? Math.round((filled / total) * 100) : 0

                const vName = [updated.manufacturer, updated.model].filter(Boolean).join(' ')
                const stockRef = updated?.stockId ? ` Stock #${updated.stockId}` : ''
                notifyAdmins({
                    type: 'account_updated',
                    message: `Account updated: ${vName || 'Vehicle'} — ${filled}/${total} fields (${pct}%)${stockRef}`,
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
