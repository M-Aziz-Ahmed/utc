'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

const AuthContext = createContext({
    loggedIn: false,
    user: null,
    loading: true,
    openAuthModal: () => {},
    closeAuthModal: () => {},
    modalOpen: false,
    refreshAuth: () => {},
})

export function AuthProvider({ children }) {
    const [loggedIn, setLoggedIn] = useState(false)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const pathname = usePathname()

    const refreshAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/public/me')
            const data = await res.json()
            setLoggedIn(!!data.loggedIn)
            setUser(data.user || null)
        } catch {
            setLoggedIn(false)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshAuth()
    }, [refreshAuth])

    // On the "/" route: always pop the modal for guests (every visit, no dismissal memory).
    // On other routes: never auto-open (user can still trigger it manually via price lock).
    useEffect(() => {
        if (loading) return
        if (loggedIn) return
        if (pathname !== '/') return

        const t = setTimeout(() => setModalOpen(true), 600)
        return () => clearTimeout(t)
    }, [loading, loggedIn, pathname])

    const openAuthModal = useCallback(() => setModalOpen(true), [])

    // Closing just hides the modal — no sessionStorage flag,
    // so it will re-appear the next time they visit "/".
    const closeAuthModal = useCallback(() => {
        setModalOpen(false)
    }, [])

    return (
        <AuthContext.Provider value={{ loggedIn, user, loading, openAuthModal, closeAuthModal, modalOpen, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
