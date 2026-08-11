'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { hasAccess, getFirstPortalPath } from '@/utils/permissions'

/**
 * Client-side gate that blocks a logged-in user from opening admin pages
 * they don't have permission for. The user object is passed in fresh from
 * the server (Me hook), so permission changes apply immediately.
 */
const PortalGate = ({ user, children }) => {
    const pathname = usePathname()
    const router = useRouter()

    const allowed = hasAccess(user, pathname)

    useEffect(() => {
        if (!allowed) {
            const destination = getFirstPortalPath(user)
            if (destination !== pathname) {
                router.replace(destination)
            }
        }
    }, [allowed, user, pathname, router])

    if (allowed) return children

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <div
                    className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                    style={{ borderColor: '#E5E7EB', borderTopColor: '#DC2626' }}
                ></div>
                <p style={{ fontSize: 'var(--text-sm)', color: '#6B7280' }}>Redirecting...</p>
            </div>
        </div>
    )
}

export default PortalGate
