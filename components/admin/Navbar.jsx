'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'

const Navbar = ({ user }) => {
    const pathname = usePathname()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const notifRef = useRef(null)

    const displayName = user?.name || user?.email || 'Admin'
    const displayEmail = user?.email || ''
    const displayRole = user?.role || 'User'
    const initials = displayName.charAt(0).toUpperCase()

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch {}
    }, [])

    useEffect(() => {
        let active = true
        const load = async () => {
            const res = await fetch('/api/notifications')
            if (!active || !res.ok) return
            const data = await res.json()
            setNotifications(data.notifications || [])
            setUnreadCount(data.unreadCount || 0)
        }
        load()
        const interval = setInterval(load, 30000)
        return () => { active = false; clearInterval(interval) }
    }, [])

    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const markAsRead = async (id) => {
        await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationId: id }) })
        fetchNotifications()
    }

    const markAllRead = async () => {
        await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) })
        fetchNotifications()
    }

    const notifTypeIcon = (type) => {
        const icons = {
            vehicle_added: '🚗', allocation_changed: '📋', gate_pass: '🚧', rikuso_assigned: '🤝',
            export_cert: '📄', account_updated: '💰', general: '🔔',
        }
        return icons[type] || '🔔'
    }

    return (
        <nav className="sticky top-0 z-40" style={{background:'#FFFFFF', borderBottom:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="px-5 sm:px-8 lg:px-12" style={{maxWidth:'1920px', margin:'0 auto'}}>
                <div className="flex justify-between items-center" style={{height:'64px'}}>
                    {/* Left side */}
                    <div className="flex items-center gap-3">
                        {/* Mobile sidebar toggle */}
                        <button
                            onClick={() => window.dispatchEvent(new Event('toggle-sidebar-mobile'))}
                            className="md:hidden p-2 rounded-lg transition-colors"
                            style={{color:'#6B7280'}}
                            onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        {/* Brand mark for larger screens */}
                        <span className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
                            style={{background:'#FEF2F2', border:'1px solid #FECACA'}}>
                            <span className="w-2 h-2 rounded-full" style={{background:'#DC2626'}} />
                            <span style={{fontSize:'13px', fontWeight:700, color:'#991B1B', letterSpacing:'0.01em'}}>UTC Portal</span>
                        </span>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Bell Icon — Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications() }}
                                className="flex items-center p-2 rounded-lg relative transition-colors"
                                style={{color:'#374151', border:'1px solid transparent'}}
                                onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                            >
                                <svg style={{width:'24px',height:'24px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-white text-[11px] font-bold" style={{background:'#DC2626', lineHeight:1, border:'2px solid #fff', boxShadow:'0 1px 4px rgba(220,38,38,0.5)'}}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-96 rounded-2xl z-50" style={{background:'#fff', border:'1px solid #E5E7EB', boxShadow:'0 12px 40px rgba(0,0,0,0.15)'}}>
                                    <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:'1px solid #E5E7EB', borderRadius:'1rem 1rem 0 0'}}>
                                        <h3 style={{fontSize:'14px', fontWeight:700, color:'#111827'}}>Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} style={{fontSize:'11px', color:'#1a73e8', fontWeight:600, background:'none', border:'none', cursor:'pointer'}}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div style={{maxHeight:'380px', overflowY:'auto'}}>
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <p style={{fontSize:'13px', color:'#9CA3AF'}}>No notifications yet</p>
                                            </div>
                                        ) : notifications.map(n => (
                                            <button key={n._id} onClick={() => { markAsRead(n._id); if (n.link) window.location.href = n.link; setNotifOpen(false) }}
                                                className="w-full text-left px-4 py-3 transition-colors flex gap-3"
                                                style={{borderBottom:'1px solid #F3F4F6', background: n.read ? '#fff' : '#F0F7FF', cursor:'pointer'}}
                                                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                                onMouseLeave={e => e.currentTarget.style.background = n.read ? '#fff' : '#F0F7FF'}
                                            >
                                                <span style={{fontSize:'16px', flexShrink:0, marginTop:'2px'}}>{notifTypeIcon(n.type)}</span>
                                                <div className="min-w-0 flex-1">
                                                    <p style={{fontSize:'12px', color:'#111827', fontWeight: n.read ? 400 : 600, lineHeight:1.4, margin:0}}>{n.message}</p>
                                                    <p style={{fontSize:'10px', color:'#9CA3AF'}}>
                                                        {new Date(n.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                                                    </p>
                                                </div>
                                                {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{background:'#1a73e8'}} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Vertical divider */}
                        <div className="hidden sm:block" style={{width:'1px', height:'32px', background:'#E5E7EB'}} />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-colors"
                                onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'}
                                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                            >
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                                    style={{background:'linear-gradient(135deg,#DC2626,#9F1239)', fontSize:'var(--text-sm)', boxShadow:'0 2px 6px rgba(220,38,38,0.35)'}}>
                                    {initials}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="font-semibold leading-tight" style={{fontSize:'var(--text-sm)', color:'#111827'}}>{displayName}</p>
                                    <p style={{fontSize:'var(--text-xs)', color:'#6B7280'}}>{displayRole}</p>
                                </div>
                                <svg className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'#9CA3AF'}}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-60 rounded-2xl py-2 z-50"
                                    style={{background:'#fff', border:'1px solid #E5E7EB', boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}}>
                                    <div className="px-4 py-3" style={{borderBottom:'1px solid #E5E7EB'}}>
                                        <p className="font-semibold" style={{fontSize:'var(--text-sm)', color:'#111827'}}>{displayName}</p>
                                        <p style={{fontSize:'var(--text-xs)', color:'#6B7280'}}>{displayEmail}</p>
                                    </div>
                                    <Link href="/admin/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                                        style={{fontSize:'var(--text-sm)', color:'#374151', textDecoration:'none'}}
                                        onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <div style={{borderTop:'1px solid #E5E7EB', margin:'4px 0'}}></div>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await fetch('/api/logout', { method: 'POST' })
                                                window.location.href = '/login'
                                            } catch (error) {
                                                console.error('Logout error:', error)
                                            }
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                                        style={{fontSize:'var(--text-sm)', color:'#DC2626'}}
                                        onMouseEnter={e => e.currentTarget.style.background='#FEF2F2'}
                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
