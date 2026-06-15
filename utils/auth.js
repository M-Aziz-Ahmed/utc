import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'utc-fallback-secret-change-in-production'
)

/**
 * Sign a JWT and set it as an httpOnly cookie.
 */
export async function setSessionCookie(payload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(SECRET)

    const cookieStore = await cookies()
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    })
}

/**
 * Read and verify the session cookie.
 * Returns the payload or null if missing / invalid.
 */
export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null

    try {
        const { payload } = await jwtVerify(token, SECRET)
        return payload
    } catch {
        return null
    }
}

/**
 * Delete the session cookie (logout).
 */
export async function clearSessionCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}
