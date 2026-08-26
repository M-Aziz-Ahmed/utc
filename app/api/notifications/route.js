import { NextResponse } from 'next/server'
import dbConnect from '@/utils/dbConnection'
import Notification from '@/models/Notification'
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'utc-secret-key'

const getUser = (req) => {
    try {
        const token = req.cookies.get('user')?.value
        if (!token) return null
        const decoded = jwt.verify(token, SECRET)
        return decoded
    } catch { return null }
}

export async function GET(req) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const query = { userId: user.id || user._id }
    if (unreadOnly) query.read = false

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()

    const unreadCount = await Notification.countDocuments({ userId: user.id || user._id, read: false })

    return NextResponse.json({ notifications, unreadCount })
}

export async function POST(req) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const body = await req.json()

    const notification = await Notification.create({
        userId: body.userId || user.id || user._id,
        type: body.type || 'general',
        message: body.message,
        vehicleId: body.vehicleId || undefined,
        link: body.link || undefined,
    })

    return NextResponse.json(notification)
}

export async function PATCH(req) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const body = await req.json()

    if (body.markAllRead) {
        await Notification.updateMany(
            { userId: user.id || user._id, read: false },
            { $set: { read: true } }
        )
        return NextResponse.json({ success: true })
    }

    if (body.notificationId) {
        await Notification.findOneAndUpdate(
            { _id: body.notificationId, userId: user.id || user._id },
            { $set: { read: true } }
        )
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ message: 'No action specified' }, { status: 400 })
}
