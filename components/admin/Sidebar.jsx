'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Sidebar = () => {
    const [toggle, setToggle] = useState(true);
    // Track open submenus individually using item names as keys
    const [openMenus, setOpenMenus] = useState({ 'Vehicle Mgm': true }); // Preset open for your current view

    const toggleSubMenu = (name) => {
        setOpenMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

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
            name: 'Vehicle Setup',
            href: '',
            icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ),
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
                    href: '/admin/vehicles/',
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

    const pathname = usePathname();

    return (
        <div className={`bg-white text-slate-700 h-screen transition-all duration-300 flex flex-col border-r border-slate-200 shadow-sm ${toggle ? 'w-64' : 'w-20'}`}>
            {/* Header Area */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 min-h-[70px]">
                {toggle && <span className="font-extrabold text-base text-slate-900 tracking-wider">ADMIN PANEL</span>}
                <button
                    onClick={() => setToggle(prev => !prev)}
                    className="p-2 ml-auto rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors focus:outline-none"
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

                    // Light Theme Variable Text Styles
                    const activeClass = "bg-blue-400 shadow-md shadow-blue-600/10 font-medium";
                    const inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

                    const useLinkElement = n.href && !n.subL;
                    const Element = useLinkElement ? Link : "button";

                    return (
                        <div key={n.name} className="flex flex-col w-full">
                            <Element
                                href={useLinkElement ? n.href : undefined}
                                onClick={() => n.subL && toggleSubMenu(n.name)}
                                className={`w-full group rounded-xl p-3 flex items-center transition-all duration-150 text-left focus:outline-none ${isActive ? activeClass : inactiveClass}`}
                            >
                                <span className={`flex-shrink-0 ${isActive ? 'text-[white!important]' : 'text-slate-500 group-hover:text-slate-800'}`}>
                                    {n.icon}
                                </span>

                                {toggle && (
                                    <div className="flex items-center justify-between w-full ml-3 overflow-hidden">
                                        <span className={`truncate text-sm font-medium tracking-wide ${isActive && 'text-[white!important]'}`}>{n.name}</span>
                                        {n.subL && (
                                            <svg
                                                className={`w-4 h-4 transform transition-transform duration-200 ${isActive ? 'text-[white!important]' : 'text-slate-400 group-hover:text-slate-600'} ${isMenuOpen ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </Element>

                            {/* Submenu Layout matches your UI layout */}
                            {n.subL && isMenuOpen && toggle && (
                                <div className="mt-1 ml-3 pl-1 space-y-1 border-l-2 border-gray-600">
                                    {n.subL.map((sl, index) => {
                                        const isSubActive = sl.href === pathname;
                                        return (
                                            <Link
                                                key={`${sl.name}-${index}`}
                                                href={sl.href}
                                                className={`w-full text-sm p-1.5 pl-4 flex items-center gap-3 transition-all ${isSubActive ? 'bg-gray-200 rounded-lg border-slate-400 text-white font-medium' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                                            >
                                                <span className={`flex-shrink-0 ${isSubActive ? '' : 'text-slate-400'}`}>{sl.icon}</span>
                                                <span className={`truncate ${isSubActive && ''}`}>{sl.name}</span>
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
