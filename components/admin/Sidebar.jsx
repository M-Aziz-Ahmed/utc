'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// ── tiny cookie helpers ────────────────────────────────────────────────────────
const getCookie = (name) => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
}
const setCookie = (name, value, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`
}

const Sidebar = () => {
    const [toggle, setToggle] = useState(true);
    const [openMenus, setOpenMenus] = useState({ 'Vehicles Management': true });
    const [mounted, setMounted] = useState(false)

    // Restore sidebar state from cookie after mount
    useEffect(() => {
        const saved = getCookie('sidebar_open')
        if (saved !== null) setToggle(saved === 'true')
        setMounted(true)
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
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Vehicles Management',
            href: '',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            subL: [
                {
                    name: 'Vehicle Entry Form',
                    href: '/admin/vehicles',
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    )
                },
                {
                    name: 'Vehicle Allocation',
                    href: '/admin/rikuso/',
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    )
                },
                {
                    name: 'purchase details',
                    href: '#1',
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    )
                },
                {
                    name: 'Auction Details',
                    href: '/admin/auctionDetails/',
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    )
                },
            ],
        },
        {
            name: 'Rikuso Management',
            href: '/admin/rikuso',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            subL: [
                {
                    name: 'Orders',
                    href: '/admin/rikuso/orders',
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    )
                },
                {
                    name: 'Manage Rikso Companies',
                    href: '#',
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    )
                }
            ],
        },
        {
            name: 'Auction Details',
            href: '',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            subL: [
                {
                    name: 'Manage Auction Groups',
                    href: '/admin/auctionDetails/',
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    )
                },
            ],
        },
        {
            name: 'Dynamic Fields',
            href: '/admin/fields',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'Vehicle Setup',
            href: '/admin/setup',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            name: 'Users',
            href: '/admin/users',
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

    const pathname = usePathname();

    return (
        <div className={`h-screen transition-all duration-300 flex flex-col shrink-0 z-40 ${toggle ? 'w-64' : 'w-14'}`}
            style={{ background: '#f0f4f9', borderRight: '1px solid #e0e0e0' }}>
            {/* Header Area */}
            <div className="flex items-center justify-between min-h-[56px] px-3" style={{ borderBottom: '1px solid #e0e0e0' }}>
                {toggle && (
                    <span className="font-bold tracking-widest uppercase select-none"
                        style={{ fontSize: '11px', color: '#444746', letterSpacing: '0.12em' }}>
                        UTC ADMIN
                    </span>
                )}
                <button
                    onClick={handleToggle}
                    className="p-1.5 rounded-full transition-colors focus:outline-none ml-auto"
                    style={{ color: '#444746' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e2e5e9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
                {navigation.map((n) => {
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
                                    borderRadius: '20px',
                                    background: isActive ? '#d3e3fd' : 'transparent',
                                    justifyContent: toggle ? 'flex-start' : 'center',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#e2e5e9' }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                            >
                                <span style={{
                                    color: isActive ? '#0842a0' : '#444746',
                                    flexShrink: 0,
                                    display: 'flex',
                                }}>
                                    {n.icon}
                                </span>

                                {toggle && (
                                    <div className="flex items-center justify-between w-full ml-3 overflow-hidden">
                                        <span className="truncate font-medium"
                                            style={{ fontSize: 'var(--text-sm)', color: isActive ? '#0842a0' : '#444746' }}>
                                            {n.name}
                                        </span>
                                        {n.subL && (
                                            <svg
                                                className={`w-3 h-3 transform transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                style={{ color: isActive ? '#0842a0' : '#80868b', flexShrink: 0 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </Element>

                            {/* Submenu */}
                            {n.subL && isMenuOpen && toggle && (
                                <div className="mt-0.5 ml-3 pl-3 space-y-0.5" style={{ borderLeft: '2px solid #c4c7c5' }}>
                                    {n.subL.map((sl, index) => {
                                        const isSubActive = sl.href === pathname;
                                        return (
                                            <Link
                                                key={`${sl.name}-${index}`}
                                                href={sl.href}
                                                className="w-full flex items-center gap-2 transition-all"
                                                style={{
                                                    padding: '5px 10px',
                                                    borderRadius: '20px',
                                                    background: isSubActive ? '#d3e3fd' : 'transparent',
                                                    fontSize: 'var(--text-sm)',
                                                }}
                                                onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = '#e2e5e9' }}
                                                onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = 'transparent' }}
                                            >
                                                <span style={{ color: isSubActive ? '#0842a0' : '#444746', flexShrink: 0 }}>{sl.icon}</span>
                                                <span className="truncate" style={{ color: isSubActive ? '#0842a0' : '#444746', fontWeight: isSubActive ? 600 : 400 }}>{sl.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sidebar;
