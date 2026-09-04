import { readJson } from '@/utils/readJson'
import User from "@/models/User"
import dbConnect from "@/utils/dbConnection"
import { getSession } from '@/utils/auth'
import { NextResponse } from "next/server"

export const PATCH = async (req) => {
    try {
        const session = await getSession()
        if (!session?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        const body = await readJson(req)

        const update = {}
        if (body.name !== undefined) update.name = String(body.name).trim()
        if (body.email !== undefined) update.email = String(body.email).trim()

        // Allow a password change only when a new password + current password are given.
        if (body.newPassword) {
            const user = await User.findById(session.id).select('pass password')
            const existing = user?.pass || user?.password
            if (existing) {
                const bcrypt = (await import('bcryptjs')).default
                const ok = await bcrypt.compare(body.currentPassword || '', existing)
                if (!ok) return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 })
            }
            const bcrypt = (await import('bcryptjs')).default
            update.pass = await bcrypt.hash(body.newPassword, 12)
        }

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ message: 'No changes to save' }, { status: 400 })
        }

        const updatedUser = await User.findByIdAndUpdate(session.id, update, { new: true, runValidators: true })
            .select('name email role permissions viewOnly')
            .lean()

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: session.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                permissions: updatedUser.permissions || [],
                viewOnly: !!updatedUser.viewOnly,
            },
        }, { status: 200 })
    } catch (error) {
        console.error('updateProfile error:', error)
        return NextResponse.json({ message: 'Error updating profile', error: error.message }, { status: 500 })
    }
}
