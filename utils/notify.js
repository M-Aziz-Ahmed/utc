/**
 * Notification helper — creates a Notification document for every Admin user
 * (so all admins see the event in their bell).
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
 * @param {'vehicle_added'|'allocation_changed'|'gate_pass'|'export_cert'|'account_updated'|'general'} opts.type
 * @param {string}  opts.message
 * @param {string}  [opts.vehicleId]   — MongoDB ObjectId string
 * @param {string}  [opts.link]        — admin portal URL to navigate to on click
 * @param {string}  [opts.excludeUserId] — don't notify this user (usually the one who triggered it)
 */
export async function notifyAdmins({ type = 'general', message, vehicleId, link, excludeUserId } = {}) {
    try {
        await dbConnect()

        // Find all admin users
        const admins = await User.find({ role: 'Admin' }).select('_id').lean()
        if (!admins.length) return

        const docs = admins
            .filter(a => !excludeUserId || String(a._id) !== String(excludeUserId))
            .map(a => ({
                userId:    a._id,
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
