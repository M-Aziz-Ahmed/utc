'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

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

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch {}
    }

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
            vehicle_added: '🚗', allocation_changed: '📋', gate_pass: '🚧',
            export_cert: '📄', account_updated: '💰', general: '🔔',
        }
        return icons[type] || '🔔'
    }

    return (
        <nav className="sticky top-0 z-40" style={{background:'#FFFFFF', borderBottom:'1px solid #E5E7EB', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="px-4 sm:px-6">
                <div className="flex justify-between" style={{height:'56px'}}>
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        {/* Mobile sidebar toggle */}
                        <button
                            onClick={() => window.dispatchEvent(new Event('toggle-sidebar-mobile'))}
                            className="md:hidden p-2 rounded-lg transition-colors"
                            style={{color:'#6B7280'}}
                            onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Breadcrumb-like page indicator */}
                        <div className="hidden sm:flex items-center gap-2">
                            <Link href="/admin" className="flex items-center gap-1.5" style={{textDecoration:'none'}}>
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 9, color: '#fff', letterSpacing: 0.5 }}>
                                    UTC
                                </div>
                                <span style={{fontSize:'var(--text-md)', fontWeight:700, color:'#111827'}}>Admin Portal</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Bell Icon — Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications() }}
                                className="p-1.5 rounded-lg relative transition-colors"
                                style={{color:'#6B7280'}}
                                onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'}
                                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                            >
                                <svg style={{width:'28px',height:'28px'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-white text-[11px] font-bold" style={{background:'#DC2626', lineHeight:1, border:'2px solid #fff', boxShadow:'0 1px 4px rgba(220,38,38,0.5)'}}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 rounded-xl z-50" style={{background:'#fff', border:'1px solid #E5E7EB', boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}}>
                                    <div className="flex items-center justify-between px-4 py-3" style={{borderBottom:'1px solid #E5E7EB'}}>
                                        <h3 style={{fontSize:'14px', fontWeight:700, color:'#111827'}}>Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} style={{fontSize:'11px', color:'#1a73e8', fontWeight:600, background:'none', border:'none', cursor:'pointer'}}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div style={{maxHeight:'360px', overflowY:'auto'}}>
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
                                                    <p style={{fontSize:'10px', color:'#9CA3AF', marginTop:'3px', margin:0, marginTop:'3px'}}>
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

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                                onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'}
                                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                            >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                                    style={{background:'#DC2626', fontSize:'var(--text-sm)'}}>
                                    {initials}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="font-medium" style={{fontSize:'var(--text-sm)', color:'#111827'}}>{displayName}</p>
                                    <p style={{fontSize:'var(--text-xs)', color:'#6B7280'}}>{displayRole}</p>
                                </div>
                                <svg className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'#9CA3AF'}}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-1 w-56 rounded-xl py-2 z-50"
                                    style={{background:'#fff', border:'1px solid #E5E7EB', boxShadow:'0 4px 16px rgba(0,0,0,0.12)'}}>
                                    <div className="px-4 py-2.5" style={{borderBottom:'1px solid #E5E7EB'}}>
                                        <p className="font-semibold" style={{fontSize:'var(--text-sm)', color:'#111827'}}>{displayName}</p>
                                        <p style={{fontSize:'var(--text-xs)', color:'#6B7280'}}>{displayEmail}</p>
                                    </div>
                                    <Link href="/admin/profile"
                                        className="flex items-center gap-3 px-4 py-2 transition-colors"
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
                                        className="w-full flex items-center gap-3 px-4 py-2 transition-colors"
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
