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

// ── Export details modal ───────────────────────────────────────────────────────
const ExportModal = ({ vehicle, onSave, onClose }) => {
    const [country, setCountry] = useState(vehicle.exportCountry || '')
    const [saving, setSaving]   = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        await onSave(vehicle._id, { country: country.trim() })
        setSaving(false)
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '16px' }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>Export Details</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', display: 'flex' }}>
                        <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <p style={{ fontSize: '11px', color: '#9aa0a6', margin: '0 0 16px' }}>
                    {[vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ')}
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                            Export Country <span style={{ color: '#c5221f' }}>*</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                            required
                            placeholder="e.g. Kenya, Tanzania, Uganda…"
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={e => e.target.style.borderColor = '#1a73e8'}
                            onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button type="button" onClick={onClose}
                            style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || !country.trim()}
                            style={{ flex: 1, padding: '8px', background: saving ? '#9aa0a6' : '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: !country.trim() ? 0.5 : 1 }}>
                            {saving ? 'Saving…' : 'Save Export'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── compact allocation controls (shared by both views) ────────────────────────
const AllocControls = ({ vehicle, rikusoCompanies, consignees, allocations,
    onAllocChange, onRikusoChange, onPresold, onRemovePresold, onExportSelect }) => {
    const alloc      = allocations[vehicle._id] || ''
    const rikusoVal  = vehicle.rikusoCompany || ''
    const isPresold  = vehicle.allocationStatus || false

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Allocation */}
            <select value={alloc} onChange={e => {
                const val = e.target.value
                if (val === 'export') {
                    // first set the allocation, then open export modal
                    onAllocChange(vehicle._id, val)
                    onExportSelect(vehicle)
                } else {
                    onAllocChange(vehicle._id, val)
                }
            }}
                style={{ width: '100%', padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', outline: 'none', background: '#fff', color: alloc ? '#202124' : '#9aa0a6' }}>
                <option value="">Allocation…</option>
                {ALLOC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Export details badge — shown when export is set */}
            {alloc === 'export' && vehicle.exportCountry && (
                <div style={{ padding: '4px 8px', background: '#e8f0fe', borderRadius: '6px', fontSize: '11px', color: '#1a73e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>🌍 {vehicle.exportCountry}</span>
                    <button onClick={() => onExportSelect(vehicle)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a73e8', fontSize: '10px', fontWeight: 600, padding: '0 2px' }}>Edit</button>
                </div>
            )}
            {alloc === 'export' && !vehicle.exportCountry && (
                <button onClick={() => onExportSelect(vehicle)}
                    style={{ padding: '4px 8px', background: '#fce8e6', border: '1px dashed #f5c6c2', borderRadius: '6px', fontSize: '11px', color: '#c5221f', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}>
                    ⚠ Add export country
                </button>
            )}

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
    onAllocChange, onRikusoChange, onPresold, onRemovePresold, onExportSelect }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const [hov, setHov]       = useState(false)
    const imgs = getVehicleImages(vehicle)

    const lotField   = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal     = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.auctionGroup, vehicle.auctionVenue, lotVal].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const descLine   = vehicle.modelDescription || vehicle.variant || ''
    const isPresold  = vehicle.allocationStatus || false

    // build specs entries from dynamic fields (same logic as VehicleCard)
    const cardFields = fields
        .filter(f => f.showOnCard !== false && f.belongsto === 'add-vehicles')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const entries = cardFields.map(f => {
        let val = vehicle[f._id]
        if (val === undefined || val === '' || val === null) val = vehicle[f.label]
        if (val === undefined || val === '' || val === null) return null
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return null
        return { label: f.label, value: String(val) }
    }).filter(Boolean)

    // status dots
    const alloc  = (vehicle.allocation || '').toLowerCase()
    const rikuso = !!vehicle.rikusoStatus

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
            <div style={{ position: 'relative', height: '155px', background: '#f1f5f9', flexShrink: 0 }}>
                {imgs.length > 0 ? (
                    <>
                        <img src={imgs[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9', display: 'block' }} />
                        {imgs.length > 1 && (
                            <>
                                <button onClick={e => { e.stopPropagation(); setImgIdx((imgIdx - 1 + imgs.length) % imgs.length) }}
                                    style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>‹</button>
                                <button onClick={e => { e.stopPropagation(); setImgIdx((imgIdx + 1) % imgs.length) }}
                                    style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>›</button>
                                {/* dots */}
                                <div style={{ position: 'absolute', bottom: '6px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px' }}>
                                    {imgs.map((_, i) => (
                                        <span key={i} onClick={e => { e.stopPropagation(); setImgIdx(i) }}
                                            style={{ width: i === imgIdx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', cursor: 'pointer', display: 'block' }} />
                                    ))}
                                </div>
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

            {/* specs grid — same as VehicleCard */}
            {entries.length > 0 && (
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f4f8' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                        {entries.slice(0, 10).map((e, i) => (
                            <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f4f4f4' }}>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>{e.label}</div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', marginTop: '1px', lineHeight: 1.3 }}>{e.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* status dots — same as VehicleCard */}
            <div style={{ padding: '6px 10px', background: '#f8fafc', borderBottom: '1px solid #f0f4f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {[
                            { label: 'Export', active: alloc === 'export' },
                            { label: 'Khitai', active: alloc === 'khitai' },
                            { label: 'Resale', active: alloc === 'resale-to-auction' },
                            { label: 'Rikso',  active: rikuso },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: s.active ? '#ef4444' : '#e2e8f0' }} />
                                <span style={{ fontSize: '10px', fontWeight: s.active ? 700 : 400, color: s.active ? '#dc2626' : '#94a3b8' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {['Docs', 'EC', 'TBS', 'BL'].map(l => (
                            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: '#e2e8f0' }} />
                                <span style={{ fontSize: '10px', color: '#cbd5e1' }}>{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* allocation controls */}
            <div style={{ padding: '8px 10px', flex: 1 }}>
                <AllocControls vehicle={vehicle} rikusoCompanies={rikusoCompanies} consignees={consignees}
                    allocations={allocations} onAllocChange={onAllocChange} onRikusoChange={onRikusoChange}
                    onPresold={onPresold} onRemovePresold={onRemovePresold} onExportSelect={onExportSelect} />
            </div>
        </div>
    )
}

// ── List row ──────────────────────────────────────────────────────────────────
const AllocRow = ({ vehicle, fields, rikusoCompanies, consignees, allocations,
    onAllocChange, onRikusoChange, onPresold, onRemovePresold, onExportSelect }) => {
    const imgs      = getVehicleImages(vehicle)
    const isPresold = vehicle.allocationStatus || false
    const alloc     = (allocations[vehicle._id] || '').toLowerCase()
    const rikuso    = !!vehicle.rikusoStatus

    const lotField   = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal     = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.auctionGroup, vehicle.auctionVenue, lotVal].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ')

    // same card fields logic
    const cardFields = fields
        .filter(f => f.showOnCard !== false && f.belongsto === 'add-vehicles')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const entries = cardFields.map(f => {
        let val = vehicle[f._id]
        if (val === undefined || val === '' || val === null) val = vehicle[f.label]
        if (val === undefined || val === '' || val === null) return null
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return null
        return { label: f.label, value: String(val) }
    }).filter(Boolean)

    return (
        <tr style={{ borderBottom: '1px solid #f0f4f8', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            {/* Thumb */}
            <td style={{ padding: '5px 8px', width: '48px' }}>
                <div style={{ width: '42px', height: '32px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, position: 'relative' }}>
                    {imgs.length > 0
                        ? <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '9px' }}>—</div>
                    }
                    {isPresold && (
                        <div style={{ position: 'absolute', top: 0, right: 0, background: '#1a3060', color: '#fff', fontSize: '6px', fontWeight: 800, padding: '1px 3px', borderRadius: '0 4px 0 3px' }}>PRE</div>
                    )}
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
            {/* Dynamic field values */}
            {entries.slice(0, 5).map((e, i) => (
                <td key={i} style={{ padding: '5px 8px', minWidth: '70px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2 }}>{e.label}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{e.value}</div>
                </td>
            ))}
            {entries.length < 5 && Array.from({ length: 5 - entries.length }).map((_, i) => <td key={`p${i}`} style={{ padding: '5px 8px' }} />)}
            {/* Status dots */}
            <td style={{ padding: '5px 8px', width: '60px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[
                        { label: 'E', active: alloc === 'export', title: 'Export' },
                        { label: 'K', active: alloc === 'khitai', title: 'Khitai' },
                        { label: 'R', active: alloc === 'resale-to-auction', title: 'Resale' },
                        { label: '⚙', active: rikuso, title: 'Rikuso' },
                        { label: 'P', active: isPresold, title: 'Presold' },
                    ].map(s => (
                        <span key={s.label} title={s.title} style={{ width: '14px', height: '14px', borderRadius: '3px', fontSize: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.active ? '#1a73e8' : '#f1f3f4', color: s.active ? '#fff' : '#9aa0a6' }}>{s.label}</span>
                    ))}
                </div>
            </td>
            {/* Allocation select */}
            <td style={{ padding: '5px 8px', minWidth: '130px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <select value={allocations[vehicle._id] || ''} onChange={e => {
                        const val = e.target.value
                        onAllocChange(vehicle._id, val)
                        if (val === 'export') onExportSelect(vehicle)
                    }}
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', outline: 'none', background: '#fff' }}>
                        <option value="">Allocation…</option>
                        {ALLOC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {allocations[vehicle._id] === 'export' && vehicle.exportCountry && (
                        <div style={{ fontSize: '10px', color: '#1a73e8', background: '#e8f0fe', padding: '2px 6px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>🌍 {vehicle.exportCountry}</span>
                            <button onClick={() => onExportSelect(vehicle)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a73e8', fontSize: '10px', fontWeight: 600, padding: 0 }}>Edit</button>
                        </div>
                    )}
                    {allocations[vehicle._id] === 'export' && !vehicle.exportCountry && (
                        <button onClick={() => onExportSelect(vehicle)} style={{ padding: '2px 6px', background: '#fce8e6', border: 'none', borderRadius: '4px', fontSize: '10px', color: '#c5221f', cursor: 'pointer', textAlign: 'left' }}>⚠ Add country</button>
                    )}
                </div>
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
    const [presoldData, setPresoldData]            = useState({ clientName: '', purchasedAmount: '' })

    // export modal
    const [exportVehicle, setExportVehicle] = useState(null)

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
            setPresoldData({ clientName: c?.name || '', purchasedAmount: c?.purchasedAmount || '' })
        } else {
            setPresoldData({ clientName: '', purchasedAmount: '' })
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

    const handleExportSave = async (vehicleId, { country }) => {
        try {
            const res = await fetch('/api/vehicles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleId, exportCountry: country }),
            })
            if (res.ok) {
                setVehicles(p => p.map(v => v._id === vehicleId ? { ...v, exportCountry: country } : v))
                setExportVehicle(null)
            }
        } catch (e) { alert('Failed to save export details') }
    }

    const filtered = vehicles.filter(v => !search || JSON.stringify(v).toLowerCase().includes(search.toLowerCase()))

    const controlProps = { rikusoCompanies, consignees, allocations, onAllocChange: handleAllocChange, onRikusoChange: handleRikusoChange, onPresold: handlePresold, onRemovePresold: handleRemovePresold, onExportSelect: (v) => setExportVehicle(v) }

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
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
                                {fields.filter(f => f.showOnCard !== false && f.belongsto === 'add-vehicles').sort((a,b)=>(a.order??0)-(b.order??0)).slice(0,5).map(f => (
                                    <th key={f._id} style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{f.label}</th>
                                ))}
                                {fields.filter(f => f.showOnCard !== false && f.belongsto === 'add-vehicles').length < 5 &&
                                    Array.from({ length: 5 - fields.filter(f => f.showOnCard !== false && f.belongsto === 'add-vehicles').length }).map((_, i) => <th key={`ph${i}`} />)
                                }
                                <th style={{ padding: '7px 8px', width: '70px', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
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
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>Pre-Sold</h3>
                            <button onClick={() => setShowPresoldModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', display: 'flex' }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handlePresoldSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Client Name *</label>
                                <input type="text" value={presoldData.clientName} onChange={e => setPresoldData(p => ({ ...p, clientName: e.target.value }))} required
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter client name…" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Purchased Amount *</label>
                                <input type="number" value={presoldData.purchasedAmount} onChange={e => setPresoldData(p => ({ ...p, purchasedAmount: e.target.value }))} required
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="Enter amount…" />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button type="button" onClick={() => setShowPresoldModal(false)} style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '8px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {exportVehicle && (
                <ExportModal
                    vehicle={exportVehicle}
                    onSave={handleExportSave}
                    onClose={() => setExportVehicle(null)}
                />
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

export default RikusoManagementPage
