'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { canAccessPortal, isAdmin } from "@/utils/permissions";

const getCookie = (name) => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
}
const setCookie = (name, value, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`
}

const Sidebar = ({ user }) => {
    const [toggle, setToggle] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({ 'Vehicles Management': true });
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = getCookie('sidebar_open')
        if (saved !== null) setToggle(saved === 'true')
        setMounted(true)
    }, [])

    useEffect(() => {
        const handler = () => setMobileOpen(prev => !prev)
        window.addEventListener('toggle-sidebar-mobile', handler)
        return () => window.removeEventListener('toggle-sidebar-mobile', handler)
    }, [])

    useEffect(() => {
        setMobileOpen(false)
    }, [])

    const handleToggle = () => {
        const next = !toggle
        setToggle(next)
        setCookie('sidebar_open', String(next))
    }

    const navigation = [
        {
            name: 'Dashboard',
            href: '/admin/',
            perm: 'dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Vehicles Management',
            href: '',
            perm: 'vehicles',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            subL: [
                { name: 'Vehicle Entry Form', href: '/admin/vehicles', perm: 'vehicles', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>) },
                { name: 'Vehicle Allocation', href: '/admin/rikuso/', perm: 'allocation', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>) },
                { name: 'Vehicle Accounts', href: '/admin/vehicles/accounts', perm: 'accounts', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
                { name: 'Export Cars', href: '/admin/export', perm: 'export', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
                { name: 'Auction Details', href: '/admin/auctionDetails/', perm: 'auction', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>) },
                { name: 'Gate Pass (IGP/OGP)', href: '/admin/gatePass', perm: 'igp', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>) },
                { name: 'Photo Review Portal', href: '/admin/gatePass/review', perm: 'review', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>) },
            ],
        },
        {
            name: 'Rikuso Management',
            href: '/admin/rikuso',
            perm: 'allocation',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            subL: [
                { name: 'Orders', href: '/admin/rikuso/orders', perm: 'allocation', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>) },
                { name: 'Manage Rikso Companies', href: '/admin/manage', perm: 'manage', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>) }
            ],
        },
        {
            name: 'Auction Details',
            href: '',
            perm: 'auction',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            subL: [
                { name: 'Manage Auction Groups', href: '/admin/auctionDetails/', perm: 'auction', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>) },
            ],
        },
        {
            name: 'Dynamic Fields',
            href: '/admin/fields',
            perm: 'fields',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'Vehicle Setup',
            href: '',
            perm: 'setup',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            subL: [
                { name: 'Manufacturers & Models', href: '/admin/setup', perm: 'setup', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
                { name: 'Tax Setup', href: '/admin/setup/tax', perm: 'setup', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
                { name: 'Yard Management', href: '/admin/yard', perm: 'yard', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>) },
                { name: 'Yard QR Scanner', href: '/admin/yard/scan', perm: 'yard', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>) },
                { name: 'Clients / Consignees', href: '/admin/manage', perm: 'manage', icon: (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>) },
            ],
        },
        {
            name: 'Users',
            href: '/admin/users',
            perm: 'users',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
    ];

    const toggleSubMenu = (name) => {
        setOpenMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    // Only show navigation items the current user is allowed to open.
    let visibleNavigation = navigation
    if (user && !isAdmin(user)) {
        visibleNavigation = []
        navigation.forEach((item) => {
            if (item.subL) {
                const subL = item.subL.filter((sl) => canAccessPortal(user, sl.perm))
                if (subL.length > 0) visibleNavigation.push({ ...item, subL })
            } else if (canAccessPortal(user, item.perm)) {
                visibleNavigation.push(item)
            }
        })
    }

    const pathname = usePathname();

    return (
        <>
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            <div className={`h-screen transition-all duration-300 flex flex-col shrink-0 z-50
                fixed md:relative md:z-40
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${toggle ? 'w-64' : 'w-14'}`}
                style={{ background: '#0F172A', borderRight: '1px solid #1E293B' }}>

            {/* UTC Logo Header */}
            <div className="flex items-center justify-between min-h-[56px] px-3" style={{ borderBottom: '1px solid #1E293B' }}>
                {toggle && (
                    <div className="flex items-center gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#fff', letterSpacing: 1 }}>
                            UTC
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#F9FAFB', letterSpacing: '0.02em' }}>Admin Portal</div>
                            <div style={{ fontSize: 9, color: '#64748B', letterSpacing: '0.05em' }}>MANAGEMENT SYSTEM</div>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleToggle}
                    className="p-1.5 rounded transition-colors focus:outline-none ml-auto"
                    style={{ color: '#94A3B8' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
                {visibleNavigation.map((n) => {
                    const isCurrentPath = n.href === pathname;
                    const isChildPathActive = n.subL?.some(sub => sub.href === pathname);
                    const isActive = isCurrentPath || isChildPathActive;
                    const isMenuOpen = openMenus[n.name];

                    const useLinkElement = n.href && !n.subL;
                    const Element = useLinkElement ? Link : "button";

                    return (
                        <div key={n.name} className="flex flex-col w-full">
                            <Element
                                href={useLinkElement ? n.href : undefined}
                                onClick={() => n.subL && toggleSubMenu(n.name)}
                                className="w-full group flex items-center transition-all duration-150 text-left focus:outline-none"
                                style={{
                                    padding: toggle ? '6px 10px' : '8px',
                                    borderRadius: '8px',
                                    background: isActive ? '#DC2626' : 'transparent',
                                    justifyContent: toggle ? 'flex-start' : 'center',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1E293B' }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                            >
                                <span style={{
                                    color: isActive ? '#FFFFFF' : '#94A3B8',
                                    flexShrink: 0,
                                    display: 'flex',
                                }}>
                                    {n.icon}
                                </span>

                                {toggle && (
                                    <div className="flex items-center justify-between w-full ml-3 overflow-hidden">
                                        <span className="truncate font-medium"
                                            style={{ fontSize: 'var(--text-sm)', color: isActive ? '#FFFFFF' : '#CBD5E1' }}>
                                            {n.name}
                                        </span>
                                        {n.subL && (
                                            <svg
                                                className={`w-3 h-3 transform transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                style={{ color: isActive ? '#FCA5A5' : '#64748B', flexShrink: 0 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </Element>

                            {/* Submenu */}
                            {n.subL && isMenuOpen && toggle && (
                                <div className="mt-0.5 ml-3 pl-3 space-y-0.5" style={{ borderLeft: '2px solid #334155' }}>
                                    {n.subL.map((sl, index) => {
                                        const isSubActive = sl.href === pathname;
                                        return (
                                            <Link
                                                key={`${sl.name}-${index}`}
                                                href={sl.href}
                                                className="w-full flex items-center gap-2 transition-all"
                                                style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '8px',
                                                    background: isSubActive ? 'rgba(220,38,38,0.2)' : 'transparent',
                                                    fontSize: 'var(--text-sm)',
                                                }}
                                                onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = '#1E293B' }}
                                                onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = isSubActive ? 'rgba(220,38,38,0.2)' : 'transparent' }}
                                            >
                                                <span style={{ color: isSubActive ? '#FCA5A5' : '#64748B', flexShrink: 0 }}>{sl.icon}</span>
                                                <span className="truncate" style={{ color: isSubActive ? '#FEE2E2' : '#94A3B8', fontWeight: isSubActive ? 600 : 400 }}>{sl.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Sidebar Footer — View Website */}
            {toggle && (
                <div className="p-3" style={{ borderTop: '1px solid #1E293B' }}>
                    <a href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                        style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Website
                    </a>
                </div>
            )}
        </div>
        </>
    );
};

export default Sidebar;
