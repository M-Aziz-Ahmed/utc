'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

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

    // Show the modal once per browser session for guests.
    // Uses sessionStorage so closing it won't re-open on page navigations,
    // but will show again on a fresh tab / browser open.
    useEffect(() => {
        if (loading) return
        if (loggedIn) return
        const dismissed = sessionStorage.getItem('utc_modal_dismissed')
        if (!dismissed) {
            // Small delay so page content renders first
            const t = setTimeout(() => setModalOpen(true), 800)
            return () => clearTimeout(t)
        }
    }, [loading, loggedIn])

    const openAuthModal = useCallback(() => setModalOpen(true), [])

    const closeAuthModal = useCallback(() => {
        setModalOpen(false)
        sessionStorage.setItem('utc_modal_dismissed', '1')
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
