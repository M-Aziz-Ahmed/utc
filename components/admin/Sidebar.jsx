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
                    name: 'Management',
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
        <div className={`text-slate-200 h-screen transition-all duration-300 flex flex-col border-r shrink-0 z-40 ${toggle ? 'w-56' : 'w-14'}`} style={{background: 'var(--ink)', borderColor: 'var(--ink-light)'}}>
            {/* Header Area */}
            <div className="p-3 flex items-center justify-between border-b min-h-11" style={{borderColor: 'var(--ink-light)'}}>
                {toggle && <span className="font-black text-xs tracking-widest uppercase" style={{color: 'var(--accent)', letterSpacing: '0.15em'}}>UTC ADMIN</span>}
                <button
                    onClick={handleToggle}
                    className="p-1.5 ml-auto rounded text-slate-400 hover:text-white transition-colors focus:outline-none"
                    style={{background: 'rgba(255,255,255,0.08)'}}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navigation.map((n) => {
                    const isCurrentPath = n.href === pathname;
                    const isChildPathActive = n.subL?.some(sub => sub.href === pathname);
                    const isActive = isCurrentPath || isChildPathActive;
                    const isMenuOpen = openMenus[n.name];

                    // Active / inactive styles for dark sidebar
                    const activeClass = "font-semibold rounded text-white";
                    const inactiveClass = "text-slate-200 hover:text-white hover:bg-white/10 rounded";

                    const useLinkElement = n.href && !n.subL;
                    const Element = useLinkElement ? Link : "button";

                    return (
                        <div key={n.name} className="flex flex-col w-full">
                            <Element
                                href={useLinkElement ? n.href : undefined}
                                onClick={() => n.subL && toggleSubMenu(n.name)}
                                className={`w-full group rounded p-2 flex items-center transition-all duration-150 text-left focus:outline-none ${isActive ? activeClass : inactiveClass}`}
                                style={isActive ? {background: 'var(--accent)'} : {}}
                            >
                                <span className={`shrink-0 ${isActive ? 'text-[white!important]' : 'text-[white!important] group-hover:text-white'}`}>
                                    {n.icon}
                                </span>

                                {toggle && (
                                    <div className="flex items-center justify-between w-full ml-3 overflow-hidden">
                                        <span className={`truncate font-medium tracking-wide ${isActive ? 'text-[white!important]' : 'text-[white!important] group-hover:text-white'}`} style={{fontSize:'var(--text-sm)'}}>{n.name}</span>
                                        {n.subL && (
                                            <svg
                                                className={`w-3 h-3 transform transition-transform duration-200 ${isActive ? 'text-[white!important]' : 'text-[white!important] group-hover:text-white'} ${isMenuOpen ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </Element>

                            {/* Submenu */}
                            {n.subL && isMenuOpen && toggle && (
                                <div className="mt-0.5 ml-2 pl-2 space-y-0.5" style={{borderLeft: '2px solid rgba(192,57,43,0.4)'}}>
                                    {n.subL.map((sl, index) => {
                                        const isSubActive = sl.href === pathname;
                                        return (
                                            <Link
                                                key={`${sl.name}-${index}`}
                                                href={sl.href}
                                                className={`w-full p-1.5 pl-3 flex items-center gap-2 transition-all rounded ${isSubActive ? 'text-[white!important] font-semibold' : 'text-[white!important] hover:text-white hover:bg-white/10'}`}
                                                style={isSubActive ? {background:'var(--accent)', fontSize:'var(--text-sm)'} : {fontSize:'var(--text-sm)'}}
                                            >
                                                <span className={`shrink-0 ${isSubActive ? 'text-[white!important]' : 'text-[white!important]'}`}>{sl.icon}</span>
                                                <span className="truncate text-[white!important]">{sl.name}</span>
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
