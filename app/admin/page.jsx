'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalVehicles: 0, totalFields: 0, totalUsers: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchDashboardData() }, [])

    const fetchDashboardData = async () => {
        try {
            const [vRes, fRes, uRes] = await Promise.all([
                fetch('/api/vehicles'), fetch('/api/fields'), fetch('/api/users')
            ])
            const [v, f, u] = await Promise.all([vRes.json(), fRes.json(), uRes.json()])
            const vehiclesRes = await fetch('/api/vehicles')
            const vehiclesData = await vehiclesRes.json()
            const fieldsRes = await fetch('/api/fields')
            const fieldsData = await fieldsRes.json() 
            const usersRes = await fetch('/api/users')
            const usersData = await usersRes.json()
            setStats({
                totalVehicles: Array.isArray(v) ? v.length : 0,
                totalFields:   Array.isArray(f) ? f.length : 0,
                totalUsers:    Array.isArray(u) ? u.length : 0,
            })
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const statCards = [
        { name: 'Vehicles',      value: stats.totalVehicles, link: '/admin/vehicles', icon: '🚗', color: 'var(--accent)' },
        { name: 'Dynamic Fields',value: stats.totalFields,   link: '/admin/fields',   icon: '📋', color: '#2563eb' },
        { name: 'Users',         value: stats.totalUsers,    link: '/admin/users',    icon: '👤', color: '#16a34a' },
    ]

    const quickActions = [
        { name: 'Add Vehicle',    desc: 'Register a new vehicle',        link: '/admin/vehicles/add',    icon: '＋' },
        { name: 'Manage Fields',  desc: 'Configure dynamic form fields', link: '/admin/fields',          icon: '⚙' },
        { name: 'All Vehicles',   desc: 'Browse and manage inventory',   link: '/admin/vehicles',        icon: '☰' },
        { name: 'Auction Groups', desc: 'Manage auction groups',         link: '/admin/auctionDetails',  icon: '⊞' },
    ]

    return (
        <div className="px-6 py-5 max-w-6xl mx-auto">
            {/* Page title */}
            <div className="mb-5 flex items-center gap-2">
                <h1 className="font-medium" style={{fontSize:'var(--text-2xl)', color:'#202124'}}>Dashboard</h1>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {statCards.map(s => (
                    <Link key={s.name} href={s.link}
                        className="jp-card p-4 flex items-center gap-3 transition-all group"
                        style={{borderRadius:'8px'}}
                        onMouseEnter={e => e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)'}
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                             style={{background: s.color + '18', fontSize:'18px'}}>
                            {s.icon}
                        </div>
                        <div>
                            <p style={{fontSize:'var(--text-xs)', color:'#5f6368', fontWeight:500, marginBottom:'2px'}}>{s.name}</p>
                            <p className="font-medium" style={{fontSize:'var(--text-2xl)', color: s.color}}>
                                {loading ? <span className="inline-block w-8 h-5 bg-gray-200 rounded animate-pulse align-middle"></span> : s.value}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* Quick Actions */}
                <div className="col-span-2 jp-card p-4" style={{borderRadius:'8px'}}>
                    <h2 style={{fontSize:'var(--text-md)', fontWeight:600, color:'#202124', marginBottom:'16px'}}>Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map(a => (
                            <Link key={a.name} href={a.link}
                                className="flex items-start gap-3 p-3 rounded-lg transition"
                                style={{border:'1px solid #e0e0e0'}}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background='#f8f9fa';
                                    e.currentTarget.style.borderColor='#1a73e8';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background='transparent';
                                    e.currentTarget.style.borderColor='#e0e0e0';
                                }}
                            >
                                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold"
                                     style={{background:'#e8f0fe', color:'#1a73e8', fontSize:'var(--text-md)'}}>
                                    {a.icon}
                                </div>
                                <div>
                                    <p className="font-medium" style={{fontSize:'var(--text-sm)', color:'#202124'}}>{a.name}</p>
                                    <p style={{fontSize:'var(--text-xs)', color:'#5f6368'}}>{a.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* System info */}
                <div className="jp-card p-4" style={{borderRadius:'8px'}}>
                    <h2 style={{fontSize:'var(--text-md)', fontWeight:600, color:'#202124', marginBottom:'16px'}}>System</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Platform',  value: 'UTC Admin Portal' },
                            { label: 'Version',   value: '1.0.0' },
                            { label: 'Database',  value: 'MongoDB Atlas' },
                            { label: 'Storage',   value: 'Cloudinary' },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between items-center py-1.5" style={{borderBottom:'1px solid #f1f3f4'}}>
                                <span style={{fontSize:'var(--text-xs)', color:'#5f6368', fontWeight:500}}>{item.label}</span>
                                <span style={{fontSize:'var(--text-xs)', color:'#202124'}}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
