// Shared JWT secret. In production the fallback MUST NOT be used — a missing
// JWT_SECRET is a hard error, never a silently-insecure default.
const getSecretValue = () => {
    const secret = process.env.JWT_SECRET
    if (secret && secret.length >= 32) return secret
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET env var is required in production (min 32 chars)')
    }
    // Dev-only fallback so local development still works out of the box.
    return 'dev-only-insecure-jwt-secret-do-not-use-in-production'
}

export const JWT_SECRET = new TextEncoder().encode(getSecretValue())
