'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { VehicleFilterBar, applyVehicleFilters, EMPTY_FILTERS } from '@/components/VehicleFilters'

const AdminDashboard = () => {
    const [vehicles, setVehicles] = useState([])
    const [fields, setFields] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState(EMPTY_FILTERS)
    const [filterAlloc, setFilterAlloc] = useState('all')

    useEffect(() => {
        let active = true
        const load = async () => {
            try {
                const [vRes, fRes, uRes] = await Promise.all([
                    fetch('/api/vehicles'), fetch('/api/fields'), fetch('/api/users')
                ])
                const [v, f, u] = await Promise.all([vRes.json(), fRes.json(), uRes.json()])
                if (!active) return
                setVehicles(Array.isArray(v) ? v : [])
                setFields(Array.isArray(f) ? f : [])
                setUsers(Array.isArray(u) ? u : [])
            } catch (e) { console.error(e) }
            finally { if (active) setLoading(false) }
        }
        load()
        return () => { active = false }
    }, [])

    const filteredVehicles = useMemo(() => {
        return applyVehicleFilters(vehicles, fields, search, filters).filter(v => {
            const alloc = (v.allocation || '').toLowerCase()
            return filterAlloc === 'all' || alloc === filterAlloc
        })
    }, [vehicles, fields, search, filters, filterAlloc])

    const allocCounts = useMemo(() => {
        const counts = { all: vehicles.length, export: 0, khitai: 0, 'resale-to-auction': 0 }
        vehicles.forEach(v => {
            const a = (v.allocation || '').toLowerCase()
            if (counts[a] !== undefined) counts[a]++
        })
        return counts
    }, [vehicles])

    const recentVehicles = filteredVehicles.slice(0, 10)

    const statCards = [
        { name: 'Total Vehicles', value: vehicles.length, link: '/admin/vehicles', bg: '#FEE2E2', color: '#DC2626', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        )},
        { name: 'Exported', value: allocCounts.export, link: '/admin/export', bg: '#DCFCE7', color: '#16A34A', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )},
        { name: 'Dynamic Fields', value: fields.length, link: '/admin/fields', bg: '#DBEAFE', color: '#2563EB', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        )},
        { name: 'Users', value: users.length, link: '/admin/users', bg: '#FEF3C7', color: '#D97706', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )},
    ]

    const quickActions = [
        { name: 'Add Vehicle', desc: 'Register a new vehicle', link: '/admin/vehicles/add', color: '#DC2626' },
        { name: 'All Vehicles', desc: 'Browse full inventory', link: '/admin/vehicles', color: '#374151' },
        { name: 'Export Cars', desc: 'View exported vehicles', link: '/admin/export', color: '#16A34A' },
        { name: 'Auction Groups', desc: 'Manage auction data', link: '/admin/auctionDetails', color: '#2563EB' },
        { name: 'Yard Management', desc: 'Track vehicle locations', link: '/admin/yard', color: '#D97706' },
        { name: 'Gate Pass', desc: 'IGP / OGP management', link: '/admin/gatePass', color: '#7C3AED' },
    ]

    const getVehicleName = (v) => {
        const name = [v.manufacturer, v.model].filter(Boolean).join(' ').toUpperCase()
        return name || 'Unnamed Vehicle'
    }

    const getAllocBadge = (alloc) => {
        const a = (alloc || '').toLowerCase()
        const map = {
            'export': { bg: '#DCFCE7', color: '#166534', label: 'Export' },
            'khitai': { bg: '#DBEAFE', color: '#1E40AF', label: 'Khitai' },
            'resale-to-auction': { bg: '#FEF3C7', color: '#92400E', label: 'Resale' },
        }
        return map[a] || null
    }

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'

    return (
        <div className="px-4 md:px-6 py-5">
            {/* Header with Search */}
            <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="font-bold" style={{fontSize:'var(--text-2xl)', color:'#111827'}}>Dashboard</h1>
                    <p style={{fontSize:'var(--text-xs)', color:'#6B7280', marginTop:2}}>Welcome back. Here&apos;s your vehicle management overview.</p>
                </div>
                <Link href="/admin/vehicles/add"
                    className="flex items-center gap-1.5 shrink-0"
                    style={{padding:'8px 16px', borderRadius:8, background:'#DC2626', color:'#fff', fontSize:13, fontWeight:600, textDecoration:'none'}}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Vehicle
                </Link>
            </div>

            {/* Search + Filters */}
            <div style={{ marginBottom: 16 }}>
                <VehicleFilterBar
                    vehicles={vehicles}
                    fields={fields}
                    search={search}
                    onSearchChange={setSearch}
                    filters={filters}
                    onFiltersChange={setFilters}
                    searchPlaceholder="Search vehicles, chassis, LOT..."
                />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {statCards.map(s => (
                    <Link key={s.name} href={s.link}
                        className="p-4 flex items-center gap-3 transition-all group"
                        style={{borderRadius:10, background:'#fff', border:'1px solid #E5E7EB', textDecoration:'none'}}
                        onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                             style={{background: s.bg, color: s.color}}>
                            {s.icon}
                        </div>
                        <div>
                            <p style={{fontSize:11, color:'#6B7280', fontWeight:500}}>{s.name}</p>
                            <p className="font-bold" style={{fontSize:22, color:s.color, lineHeight:1.2}}>
                                {loading ? <span className="inline-block w-8 h-5 bg-gray-200 rounded animate-pulse"></span> : s.value}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Vehicle Search + List (2 cols) */}
                <div className="lg:col-span-2" style={{background:'#fff', borderRadius:10, border:'1px solid #E5E7EB', overflow:'hidden'}}>
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 px-4 pt-3 pb-0" style={{borderBottom:'1px solid #F3F4F6'}}>
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'export', label: 'Export' },
                            { key: 'khitai', label: 'Khitai' },
                            { key: 'resale-to-auction', label: 'Resale' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilterAlloc(tab.key)}
                                className="px-3 py-2 rounded-t-lg font-medium transition-colors"
                                style={{
                                    fontSize: 12,
                                    color: filterAlloc === tab.key ? '#DC2626' : '#6B7280',
                                    background: filterAlloc === tab.key ? '#FEF2F2' : 'transparent',
                                    borderBottom: filterAlloc === tab.key ? '2px solid #DC2626' : '2px solid transparent',
                                }}
                            >
                                {tab.label}
                                <span style={{marginLeft:6, fontSize:10, fontWeight:600, padding:'1px 5px', borderRadius:999, background:filterAlloc===tab.key?'#FEE2E2':'#F3F4F6', color:filterAlloc===tab.key?'#DC2626':'#6B7280'}}>
                                    {tab.key === 'all' ? allocCounts.all : (allocCounts[tab.key] || 0)}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:'1px solid #F3F4F6'}}>
                        <span style={{fontSize:13, color:'#374151', fontWeight:600}}>
                            {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''}
                        </span>
                        <Link href="/admin/vehicles" style={{fontSize:12, color:'#DC2626', fontWeight:600, textDecoration:'none'}}>View All →</Link>
                    </div>

                    {/* Vehicle list */}
                    <div style={{maxHeight:420, overflowY:'auto'}}>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{borderColor:'#FEE2E2', borderTopColor:'#DC2626'}}></div>
                            </div>
                        ) : recentVehicles.length === 0 ? (
                            <div className="text-center py-12">
                                <p style={{fontSize:13, color:'#9CA3AF'}}>No vehicles found</p>
                            </div>
                        ) : (
                            recentVehicles.map(v => {
                                const badge = getAllocBadge(v.allocation)
                                return (
                                    <Link key={v._id} href={`/admin/vehicles/edit/${v._id}`}
                                        className="flex items-center gap-3 px-4 py-3 transition-colors"
                                        style={{borderBottom:'1px solid #F9FAFB', textDecoration:'none'}}
                                        onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                    >
                                        <div style={{width:40, height:40, borderRadius:8, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'#9CA3AF'}}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate" style={{fontSize:13, color:'#111827'}}>{getVehicleName(v)}</p>
                                            <p style={{fontSize:11, color:'#9CA3AF'}}>{fmtDate(v.createdAt)}</p>
                                        </div>
                                        {badge && (
                                            <span style={{fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999, background:badge.bg, color:badge.color}}>
                                                {badge.label}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Quick Actions */}
                    <div style={{background:'#fff', borderRadius:10, border:'1px solid #E5E7EB', padding:16}}>
                        <h3 style={{fontSize:14, fontWeight:700, color:'#111827', marginBottom:12}}>Quick Actions</h3>
                        <div className="space-y-2">
                            {quickActions.map(a => (
                                <Link key={a.name} href={a.link}
                                    className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                                    style={{textDecoration:'none', border:'1px solid #F3F4F6'}}
                                    onMouseEnter={e => { e.currentTarget.style.background='#F9FAFB'; e.currentTarget.style.borderColor='#E5E7EB' }}
                                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#F3F4F6' }}
                                >
                                    <div style={{width:8, height:8, borderRadius:'50%', background:a.color, flexShrink:0}}></div>
                                    <div>
                                        <p style={{fontSize:13, fontWeight:600, color:'#111827'}}>{a.name}</p>
                                        <p style={{fontSize:11, color:'#9CA3AF'}}>{a.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* System Info */}
                    <div style={{background:'#fff', borderRadius:10, border:'1px solid #E5E7EB', padding:16}}>
                        <h3 style={{fontSize:14, fontWeight:700, color:'#111827', marginBottom:12}}>System</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Platform', value: 'UTC Admin' },
                                { label: 'Database', value: 'MongoDB Atlas' },
                                { label: 'Storage', value: 'Cloudinary' },
                                { label: 'Status', value: 'Online', dot: '#16A34A' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-1.5" style={{borderBottom:'1px solid #F9FAFB'}}>
                                    <span style={{fontSize:12, color:'#6B7280'}}>{item.label}</span>
                                    <span className="flex items-center gap-1.5" style={{fontSize:12, color:'#111827', fontWeight:500}}>
                                        {item.dot && <span style={{width:6, height:6, borderRadius:'50%', background:item.dot}}></span>}
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
