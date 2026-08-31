import { getSession } from '@/utils/auth'
import { NextResponse } from 'next/server'

export const GET = async () => {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ loggedIn: false }, { status: 200 })
    }
    return NextResponse.json({
        loggedIn: true,
        user: {
            id: session.id,
            name: session.name,
            email: session.email,
            role: session.role,
            permissions: session.permissions || [],
            viewOnly: !!session.viewOnly,
        },
    }, { status: 200 })
}
