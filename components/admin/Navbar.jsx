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
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40" style={{borderBottomColor: 'var(--border)'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-12">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex">
                        {/* Logo */}
                        <Link href="/admin" className="flex items-center gap-3 mr-8">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm" style={{background: 'var(--accent)'}}>
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="font-bold text-gray-900" style={{fontSize:'var(--text-md)'}}>Admin Portal</h1>
                                <p className="text-gray-500" style={{fontSize:'var(--text-xs)'}}>Vehicle Management System</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:space-x-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
                                        isActive(item.href)
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side - User menu and mobile menu button */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition relative">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{background:'var(--accent)'}}></span>
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded transition"
                            >
                                <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold shrink-0" style={{background:'var(--accent)', fontSize:'var(--text-xs)'}}>
                                    {initials}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="font-semibold text-gray-900" style={{fontSize:'var(--text-sm)'}}>{displayName}</p>
                                    <p className="text-gray-500" style={{fontSize:'var(--text-xs)'}}>{displayRole}</p>
                                </div>
                                <svg className={`w-3 h-3 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-3 py-2 border-b border-gray-100">
                                        <p className="font-semibold text-gray-900" style={{fontSize:'var(--text-sm)'}}>{displayName}</p>
                                        <p className="text-gray-500" style={{fontSize:'var(--text-xs)'}}>{displayEmail}</p>
                                    </div>
                                    <Link href="/admin/profile" className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50" style={{fontSize:'var(--text-sm)'}}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                await fetch('/api/logout', { method: 'POST' })
                                                window.location.href = '/login'
                                            } catch (error) {
                                                console.error('Logout error:', error)
                                            }
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50"
                                        style={{fontSize:'var(--text-sm)', color:'var(--accent)'}}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 text-base font-medium rounded-lg transition ${
                                    isActive(item.href)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }`}
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
