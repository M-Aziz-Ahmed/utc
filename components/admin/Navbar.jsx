'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const Navbar = ({ user }) => {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const navigation = []

    const displayName = user?.name || user?.email || 'Admin'
    const displayEmail = user?.email || ''
    const displayRole = user?.role || 'User'
    const initials = displayName.charAt(0).toUpperCase()

    const isActive = (href) => {
        if (href === '/admin') {
            return pathname === '/admin'
        }
        return pathname.startsWith(href)
    }

    return (
        <nav className="sticky top-0 z-40" style={{background:'#fff', borderBottom:'1px solid #e0e0e0'}}>
            <div className="px-4 sm:px-6">
                <div className="flex justify-between" style={{height:'56px'}}>
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/admin" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:'var(--accent)'}}>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-semibold" style={{fontSize:'var(--text-md)', color:'#202124'}}>Admin Portal</h1>
                                <p style={{fontSize:'var(--text-xs)', color:'#5f6368'}}>Vehicle Management System</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:space-x-1 ml-6">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    style={{
                                        display:'inline-flex', alignItems:'center', gap:'6px',
                                        padding:'6px 12px', fontSize:'var(--text-sm)', fontWeight:500,
                                        borderRadius:'20px', transition:'background 0.15s',
                                        color: isActive(item.href) ? '#1a73e8' : '#444746',
                                        background: isActive(item.href) ? '#e8f0fe' : 'transparent',
                                    }}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-1">
                        {/* Notifications */}
                        <button
                            className="p-2 rounded-full relative transition-colors"
                            style={{color:'#5f6368'}}
                            onMouseEnter={e => e.currentTarget.style.background='#f1f3f4'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{background:'var(--accent)'}}></span>
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-full transition-colors"
                                onMouseEnter={e => e.currentTarget.style.background='#f1f3f4'}
                                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                            >
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                                    style={{background:'var(--accent)', fontSize:'var(--text-sm)'}}>
                                    {initials}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="font-medium" style={{fontSize:'var(--text-sm)', color:'#202124'}}>{displayName}</p>
                                    <p style={{fontSize:'var(--text-xs)', color:'#5f6368'}}>{displayRole}</p>
                                </div>
                                <svg className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'#9aa0a6'}}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-1 w-56 rounded-2xl py-2 z-50"
                                    style={{background:'#fff', border:'1px solid #e0e0e0', boxShadow:'0 4px 12px rgba(0,0,0,0.12)'}}>
                                    <div className="px-4 py-2.5" style={{borderBottom:'1px solid #e0e0e0'}}>
                                        <p className="font-semibold" style={{fontSize:'var(--text-sm)', color:'#202124'}}>{displayName}</p>
                                        <p style={{fontSize:'var(--text-xs)', color:'#5f6368'}}>{displayEmail}</p>
                                    </div>
                                    <Link href="/admin/profile"
                                        className="flex items-center gap-3 px-4 py-2 transition-colors"
                                        style={{fontSize:'var(--text-sm)', color:'#444746'}}
                                        onMouseEnter={e => e.currentTarget.style.background='#f1f3f4'}
                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <div style={{borderTop:'1px solid #e0e0e0', margin:'4px 0'}}></div>
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
                                        style={{fontSize:'var(--text-sm)', color:'#c5221f'}}
                                        onMouseEnter={e => e.currentTarget.style.background='#fce8e6'}
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

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-full transition-colors"
                            style={{color:'#5f6368'}}
                            onMouseEnter={e => e.currentTarget.style.background='#f1f3f4'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden" style={{borderTop:'1px solid #e0e0e0', background:'#fff'}}>
                    <div className="px-3 py-2 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display:'flex', alignItems:'center', gap:'10px',
                                    padding:'8px 12px', borderRadius:'20px',
                                    fontSize:'var(--text-sm)', fontWeight:500,
                                    color: isActive(item.href) ? '#1a73e8' : '#444746',
                                    background: isActive(item.href) ? '#e8f0fe' : 'transparent',
                                }}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
