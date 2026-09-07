/**
 * Notification helper — creates a Notification document for every staff account
 * that uses the admin portal bell. Recipients are:
 *   • every Admin (role matched case-insensitively), and
 *   • every other user granted portal access (non-empty `permissions` array),
 * so admins, allocation, accounts, gate-pass, export, etc. all see the event.
 *
 * Usage:
 *   import { notifyAdmins } from '@/utils/notify'
 *   await notifyAdmins({ type, message, vehicleId, link, excludeUserId })
 *
 * This is intentionally fire-and-forget — it never throws; errors are only
 * logged so that failures here never block the main API response.
 */

import dbConnect   from '@/utils/dbConnection'
import Notification from '@/models/Notification'
import User        from '@/models/User'

/**
 * @param {Object} opts
 * @param {'vehicle_added'|'allocation_changed'|'gate_pass'|'export_cert'|'rikuso_assigned'|'account_updated'|'general'} opts.type
 * @param {string}  opts.message
 * @param {string}  [opts.vehicleId]   — MongoDB ObjectId string
 * @param {string}  [opts.link]        — admin portal URL to navigate to on click
 * @param {string}  [opts.excludeUserId] — don't notify this user (usually the one who triggered it)
 */
export async function notifyAdmins({ type = 'general', message, vehicleId, link, excludeUserId } = {}) {
    try {
        await dbConnect()

        // Recipients = all Admins (case-insensitive, covers 'Admin'/'admin'/'ADMIN'…)
        // plus every portal user (someone with at least one permission). The same
        // bell lives in the shared /admin layout, so all of them must be notified.
        const recipients = await User.find({
            $or: [
                { role: { $regex: /^admin$/i } },
                { 'permissions.0': { $exists: true } },
            ],
        }).select('_id').lean()
        if (!recipients.length) return

        const docs = recipients
            .filter(r => !excludeUserId || String(r._id) !== String(excludeUserId))
            .map(r => ({
                userId:    r._id,
                type,
                message,
                vehicleId: vehicleId || undefined,
                link:      link      || undefined,
                read:      false,
            }))

        if (docs.length) {
            await Notification.insertMany(docs, { ordered: false })
        }
    } catch (err) {
        // Never block the calling API — just log
        console.error('[notify] failed to create notifications:', err.message)
    }
}

/**
 * Convenience: notify a single specific user.
 */
export async function notifyUser({ userId, type = 'general', message, vehicleId, link } = {}) {
    try {
        await dbConnect()
        await Notification.create({ userId, type, message, vehicleId: vehicleId || undefined, link: link || undefined })
    } catch (err) {
        console.error('[notify] failed to notify user:', err.message)
    }
}
