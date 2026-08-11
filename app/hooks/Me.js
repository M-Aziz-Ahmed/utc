import { getSession } from '@/utils/auth'
import User from '@/models/User'
import dbConnect from '@/utils/dbConnection'

/**
 * Server-side hook — returns the current user with fresh role & permissions.
 * The session JWT only carries id/email/name/role, so we re-read the user from
 * the database to pick up permission changes without forcing a re-login.
 * Call this in Server Components and API routes.
 */
const Me = async () => {
    const session = await getSession()
    if (!session?.id) return { user: null }

    try {
        await dbConnect()
        const dbUser = await User.findById(session.id).select('email name role permissions').lean()
        if (!dbUser) return { user: null }

        return {
            user: {
                id: session.id,
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role,
                permissions: dbUser.permissions || [],
            },
        }
    } catch (err) {
        console.error('Me error:', err)
        return { user: null }
    }
}

export default Me
