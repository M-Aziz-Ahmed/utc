import { getSession } from '@/utils/auth'

/**
 * Server-side hook — returns the current session payload.
 * Does NOT hit the database; the session JWT contains id/email/name/role.
 * Call this in Server Components and API routes.
 */
const Me = async () => {
    const session = await getSession()
    if (!session) return { user: null }
    return { user: session }
}

export default Me
