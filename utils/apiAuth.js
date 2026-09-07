import User from '@/models/User'
import dbConnect from '@/utils/dbConnection'
import { getSession } from '@/utils/auth'
import { isAdmin, canAccessPortal } from '@/utils/permissions'
import { NextResponse } from 'next/server'

// Fresh DB-backed lookup of the logged-in user (role + permissions).
export const getAuthUser = async () => {
    const session = await getSession()
    if (!session?.id) return null
    try {
        await dbConnect()
        return await User.findById(session.id).select('email name role permissions viewOnly').lean()
    } catch (err) {
        console.error('getAuthUser error:', err)
        return null
    }
}

// Admin-only guard. Returns { user } or { error } (a NextResponse to return).
export const requireAdmin = async () => {
    const user = await getAuthUser()
    if (!user) return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
    if (!isAdmin(user)) return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
    return { user }
}

// Portal-based guard. Returns { user } or { error }.
export const requirePortal = async (key) => {
    const user = await getAuthUser()
    if (!user) return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
    if (!canAccessPortal(user, key)) return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
    return { user }
}

// Shared data guard. Returns { user } or { error }.
// Any authenticated member of the admin portal (an Admin, or a user granted at
// least one portal key) may use the shared vehicle-workflow APIs. The Allocation,
// Accounts, Yard, Export, Gate-Pass etc. portals all render from the same core
// data (vehicles, fields, tax, manufacturers, consignees), so the page-level
// portal key alone must be enough to let their data load.
export const requireAnyPortal = async () => {
    const user = await getAuthUser()
    if (!user) return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
    if (!isAdmin(user) && !(Array.isArray(user.permissions) && user.permissions.length > 0)) {
        return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
    }
    return { user }
}
