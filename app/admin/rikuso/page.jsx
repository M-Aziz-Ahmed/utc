'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── same image helper as vehicles page ────────────────────────────────────────
const getVehicleImages = (vehicle) => {
    const all = []
    Object.entries(vehicle).forEach(([key, val]) => {
        if (key === 'files' || key === 'mainImageUrl') return
        if (Array.isArray(val)) {
            val.forEach(item => {
                if (item?.path && item?.type?.startsWith('image/')) all.push(item.path)
            })
        }
    })
    if (vehicle.files) {
        vehicle.files.forEach(f => { if (f?.type?.startsWith('image/')) all.push(f.path) })
    }
    const unique = [...new Set(all)]
    if (vehicle.mainImageUrl && unique.includes(vehicle.mainImageUrl))
        return [vehicle.mainImageUrl, ...unique.filter(u => u !== vehicle.mainImageUrl)]
    return unique
}

const ALLOC_OPTIONS = [
    { value: 'export',            label: 'Export' },
    { value: 'khitai',            label: 'Khitai' },
    { value: 'resale-to-auction', label: 'Resale to Auction' },
]

// ── compact allocation controls (shared by both views) ────────────────────────
const AllocControls = ({ vehicle, rikusoCompanies, consignees, allocations,
    onAllocChange, onRikusoChange, onPresold, onRemovePresold }) => {
    const alloc      = allocations[vehicle._id] || ''
    const rikusoVal  = vehicle.rikusoCompany || ''
    const isPresold  = vehicle.allocationStatus || false

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Allocation */}
            <select value={alloc} onChange={e => onAllocChange(vehicle._id, e.target.value)}
                style={{ width: '100%', padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', outline: 'none', background: '#fff', color: alloc ? '#202124' : '#9aa0a6' }}>
                <option value="">Allocation…</option>
                {ALLOC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Rikuso */}
            <select value={rikusoVal} onChange={e => onRikusoChange(vehicle._id, e.target.value)}
                style={{ width: '100%', padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', outline: 'none', background: '#fff', color: rikusoVal ? '#202124' : '#9aa0a6' }}>
                <option value="">Rikuso company…</option>
                {rikusoCompanies.map(c => <option key={c._id} value={c._id}>{c.companyName || c.name}</option>)}
            </select>

            {/* Presold label */}
            {vehicle.consignee && (
                <div style={{ padding: '4px 8px', background: '#e8f0fe', borderRadius: '6px', fontSize: '11px', color: '#1a73e8', fontWeight: 500 }}>
                    📋 {consignees.find(c => c._id === vehicle.consignee)?.label || 'Presold'}
                </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => onPresold(vehicle)}
                    style={{ flex: 1, padding: '5px', fontSize: '11px', fontWeight: 600, background: isPresold ? '#1a73e8' : '#e8f0fe', color: isPresold ? '#fff' : '#1a73e8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    {vehicle.consignee ? 'Update Presold' : '+ Presold'}
                </button>
                {isPresold && (
                    <button onClick={() => onRemovePresold(vehicle)}
                        style={{ padding: '5px 8px', fontSize: '11px', background: '#fce8e6', color: '#c5221f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}

// ── Grid card (same thumbnail/header as vehicles page) ─────────────────────────
const AllocCard = ({ vehicle, fields, rikusoCompanies, consignees, allocations,
    onAllocChange, onRikusoChange, onPresold, onRemovePresold }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const [hov, setHov]       = useState(false)
    const imgs = getVehicleImages(vehicle)

    const lotField   = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal     = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.auctionGroup, vehicle.auctionVenue, lotVal].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const descLine   = vehicle.modelDescription || vehicle.variant || ''
    const isPresold  = vehicle.allocationStatus || false

    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden',
                border: hov ? '1px solid #1a73e8' : '1px solid #e0e0e0',
                boxShadow: hov ? '0 4px 16px rgba(26,115,232,0.1)' : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.15s', display: 'flex', flexDirection: 'column' }}>

            {/* header bar */}
            <div style={{ background: hov ? '#1a73e8' : '#1e293b', padding: '5px 10px', transition: 'background 0.15s' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.03em' }}>
                    {headerLine || 'No Group / Venue'}
                </p>
            </div>

            {/* image */}
            <div style={{ position: 'relative', height: '140px', background: '#f1f5f9', flexShrink: 0 }}>
                {imgs.length > 0 ? (
                    <>
                        <img src={imgs[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9', display: 'block' }} />
                        {imgs.length > 1 && (
                            <>
                                <button onClick={e => { e.stopPropagation(); setImgIdx((imgIdx - 1 + imgs.length) % imgs.length) }}
                                    style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>‹</button>
                                <button onClick={e => { e.stopPropagation(); setImgIdx((imgIdx + 1) % imgs.length) }}
                                    style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>›</button>
                            </>
                        )}
                        {isPresold && (
                            <div style={{ position: 'absolute', top: -1, right: 0, overflow: 'hidden', width: '60px', height: '60px', pointerEvents: 'none' }}>
                                <div style={{ position: 'absolute', top: '13px', right: '-18px', width: '72px', background: '#1a3060', color: '#fff', fontSize: '8px', fontWeight: 800, fontStyle: 'italic', letterSpacing: '0.06em', textAlign: 'center', padding: '3px 0', transform: 'rotate(45deg)' }}>PRE-SOLD</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '10px' }}>No Image</div>
                )}
            </div>

            {/* title */}
            <div style={{ padding: '7px 10px 5px', borderBottom: '1px solid #f0f4f8' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>{nameLine || '—'}</p>
                {descLine && <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#64748b' }}>{descLine}</p>}
            </div>

            {/* allocation controls */}
            <div style={{ padding: '8px 10px', flex: 1 }}>
                <AllocControls vehicle={vehicle} rikusoCompanies={rikusoCompanies} consignees={consignees}
                    allocations={allocations} onAllocChange={onAllocChange} onRikusoChange={onRikusoChange}
                    onPresold={onPresold} onRemovePresold={onRemovePresold} />
            </div>
        </div>
    )
}

// ── List row ──────────────────────────────────────────────────────────────────
const AllocRow = ({ vehicle, fields, rikusoCompanies, consignees, allocations,
    onAllocChange, onRikusoChange, onPresold, onRemovePresold }) => {
    const imgs      = getVehicleImages(vehicle)
    const isPresold = vehicle.allocationStatus || false
    const alloc     = (allocations[vehicle._id] || '').toLowerCase()
    const rikuso    = !!vehicle.rikusoStatus

    const lotField   = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal     = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.auctionGroup, vehicle.auctionVenue, lotVal].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ')

    return (
        <tr style={{ borderBottom: '1px solid #f0f4f8', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            {/* Thumb */}
            <td style={{ padding: '5px 8px', width: '48px' }}>
                <div style={{ width: '42px', height: '32px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                    {imgs.length > 0
                        ? <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '9px' }}>—</div>
                    }
                </div>
            </td>
            {/* Group */}
            <td style={{ padding: '5px 8px', minWidth: '100px', maxWidth: '130px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{headerLine || '—'}</div>
            </td>
            {/* Name */}
            <td style={{ padding: '5px 8px', minWidth: '120px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{nameLine || '—'}</div>
                {vehicle.modelDescription && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{vehicle.modelDescription}</div>}
            </td>
            {/* Status dots */}
            <td style={{ padding: '5px 8px', width: '60px' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span title="Presold" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isPresold ? '#1a73e8' : '#e2e8f0', flexShrink: 0 }} />
                    <span title="Rikuso" style={{ width: '8px', height: '8px', borderRadius: '50%', background: rikuso ? '#34a853' : '#e2e8f0', flexShrink: 0 }} />
                    <span title="Alloc" style={{ width: '8px', height: '8px', borderRadius: '50%', background: alloc ? '#fbbc04' : '#e2e8f0', flexShrink: 0 }} />
                </div>
            </td>
            {/* Allocation select */}
            <td style={{ padding: '5px 8px', minWidth: '130px' }}>
                <select value={allocations[vehicle._id] || ''} onChange={e => onAllocChange(vehicle._id, e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', outline: 'none', background: '#fff' }}>
                    <option value="">Allocation…</option>
                    {ALLOC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </td>
            {/* Rikuso select */}
            <td style={{ padding: '5px 8px', minWidth: '130px' }}>
                <select value={vehicle.rikusoCompany || ''} onChange={e => onRikusoChange(vehicle._id, e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', outline: 'none', background: '#fff' }}>
                    <option value="">Rikuso…</option>
                    {rikusoCompanies.map(c => <option key={c._id} value={c._id}>{c.companyName || c.name}</option>)}
                </select>
            </td>
            {/* Presold */}
            <td style={{ padding: '5px 8px', width: '100px' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => onPresold(vehicle)}
                        style={{ flex: 1, padding: '4px 6px', fontSize: '10px', fontWeight: 600, background: isPresold ? '#1a73e8' : '#e8f0fe', color: isPresold ? '#fff' : '#1a73e8', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {vehicle.consignee ? 'Update' : '+ Presold'}
                    </button>
                    {isPresold && (
                        <button onClick={() => onRemovePresold(vehicle)}
                            style={{ padding: '4px 6px', fontSize: '10px', background: '#fce8e6', color: '#c5221f', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                    )}
                </div>
            </td>
        </tr>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const RikusoManagementPage = () => {
    const [vehicles, setVehicles]           = useState([])
    const [fields, setFields]               = useState([])
    const [loading, setLoading]             = useState(true)
    const [viewMode, setViewMode]           = useState('grid')
    const [search, setSearch]               = useState('')
    const [rikusoCompanies, setRikusoCompanies] = useState([])
    const [consignees, setConsignees]       = useState([])
    const [allocations, setAllocations]     = useState({})

    // presold modal
    const [selectedVehicle, setSelectedVehicle]   = useState(null)
    const [showPresoldModal, setShowPresoldModal]  = useState(false)
    const [presoldData, setPresoldData]            = useState({ consigneeName: '', label: '' })

    useEffect(() => {
        Promise.all([
            fetch('/api/vehicles').then(r => r.ok ? r.json() : []),
            fetch('/api/fields').then(r => r.ok ? r.json() : []),
            fetch('/api/manufacturer').then(r => r.ok ? r.json() : []),
            fetch('/api/consignee').then(r => r.ok ? r.json() : []),
        ]).then(([v, f, m, c]) => {
            const vs = Array.isArray(v) ? v : []
            setVehicles(vs)
            setFields(Array.isArray(f) ? f.filter(fi => fi.belongsto === 'add-vehicles') : [])
            setRikusoCompanies(Array.isArray(m) ? m.filter(x => x.isRikusoCompany) : [])
            setConsignees(Array.isArray(c) ? c : [])
            const init = {}
            vs.forEach(x => { init[x._id] = x.allocation || '' })
            setAllocations(init)
        }).finally(() => setLoading(false))
    }, [])

    const handleAllocChange = async (vehicleId, allocation) => {
        try {
            const res = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId, allocation }) })
            if (res.ok) {
                setAllocations(p => ({ ...p, [vehicleId]: allocation }))
                setVehicles(p => p.map(v => v._id === vehicleId ? { ...v, allocation } : v))
            }
        } catch (e) { alert('Failed to update allocation') }
    }

    const handleRikusoChange = async (vehicleId, rikusoCompanyId) => {
        try {
            const res = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId, rikusoCompany: rikusoCompanyId || null, rikusoStatus: rikusoCompanyId !== '' }) })
            if (res.ok) setVehicles(p => p.map(v => v._id === vehicleId ? { ...v, rikusoCompany: rikusoCompanyId || null, rikusoStatus: rikusoCompanyId !== '' } : v))
        } catch (e) { alert('Failed to update rikuso') }
    }

    const handlePresold = (vehicle) => {
        setSelectedVehicle(vehicle)
        if (vehicle.consignee) {
            const c = consignees.find(x => x._id === vehicle.consignee)
            setPresoldData({ consigneeName: c?.name || '', label: c?.label || '' })
        } else {
            setPresoldData({ consigneeName: '', label: '' })
        }
        setShowPresoldModal(true)
    }

    const handlePresoldSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/consignee', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(presoldData) })
            if (!res.ok) throw new Error('Failed to create consignee')
            const newConsignee = await res.json()
            const upd = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId: selectedVehicle._id, consignee: newConsignee._id, allocationStatus: true }) })
            if (!upd.ok) throw new Error('Failed to update vehicle')
            setVehicles(p => p.map(v => v._id === selectedVehicle._id ? { ...v, consignee: newConsignee._id, allocationStatus: true } : v))
            setConsignees(p => [...p, newConsignee])
            setShowPresoldModal(false)
        } catch (e) { alert(e.message) }
    }

    const handleRemovePresold = async (vehicle) => {
        if (!confirm('Remove presold status?')) return
        const res = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId: vehicle._id, consignee: null, allocationStatus: false }) })
        if (res.ok) setVehicles(p => p.map(v => v._id === vehicle._id ? { ...v, consignee: null, allocationStatus: false } : v))
    }

    const filtered = vehicles.filter(v => !search || JSON.stringify(v).toLowerCase().includes(search.toLowerCase()))

    const controlProps = { rikusoCompanies, consignees, allocations, onAllocChange: handleAllocChange, onRikusoChange: handleRikusoChange, onPresold: handlePresold, onRemovePresold: handleRemovePresold }

    return (
        <div style={{ padding: '20px 24px', minHeight: '100vh', background: '#f6f8fc' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: 0 }}>Vehicle Allocation</h1>
                    <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>Manage allocations, presold labels and Rikuso assignments</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* view toggle */}
                    <div style={{ display: 'flex', gap: '2px', padding: '2px', background: '#f1f3f4', borderRadius: '8px' }}>
                        {[['grid', 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'],
                         ['list', 'M4 6h16M4 10h16M4 14h16M4 18h16']].map(([mode, d]) => (
                            <button key={mode} onClick={() => setViewMode(mode)}
                                style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                                    background: viewMode === mode ? '#fff' : 'transparent',
                                    color: viewMode === mode ? '#1a73e8' : '#5f6368',
                                    boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>
                            </button>
                        ))}
                    </div>
                    <Link href="/admin/manage"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '20px', background: '#fff', border: '1px solid #e0e0e0', fontSize: '12px', fontWeight: 500, color: '#444746', textDecoration: 'none' }}>
                        ⚙ Rikuso Companies
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '280px', marginBottom: '14px' }}>
                <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#9aa0a6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', paddingLeft: '30px', padding: '7px 10px 7px 30px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: 0 }}>{search ? 'No vehicles match your search' : 'No vehicles yet'}</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                    {filtered.map(v => <AllocCard key={v._id} vehicle={v} fields={fields} {...controlProps} />)}
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f4f8', background: '#f8fafc' }}>
                                <th style={{ padding: '7px 8px', width: '48px' }}></th>
                                <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Group / Venue</th>
                                <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vehicle</th>
                                <th style={{ padding: '7px 8px', width: '60px', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                                <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Allocation</th>
                                <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rikuso</th>
                                <th style={{ padding: '7px 8px', width: '100px', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Presold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(v => <AllocRow key={v._id} vehicle={v} fields={fields} {...controlProps} />)}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Presold Modal */}
            {showPresoldModal && selectedVehicle && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowPresoldModal(false)}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>Presold Label</h3>
                            <button onClick={() => setShowPresoldModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', display: 'flex' }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handlePresoldSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Consignee Name *</label>
                                <input type="text" value={presoldData.consigneeName} onChange={e => setPresoldData(p => ({ ...p, consigneeName: e.target.value }))} required
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter consignee name…" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Label</label>
                                <input type="text" value={presoldData.label} onChange={e => setPresoldData(p => ({ ...p, label: e.target.value }))}
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter label…" />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button type="button" onClick={() => setShowPresoldModal(false)} style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '8px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

export default RikusoManagementPage
