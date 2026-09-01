'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CountrySelect from '@/components/CountrySelect'
import { VehicleFilterBar, applyVehicleFilters, EMPTY_FILTERS } from '@/components/VehicleFilters'

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

// Fields shown in the Quick Edit section of allocation cards:
// any field explicitly flagged showOnAdminCard, plus computed costing fields
// (sum / formula / tax) from the Vehicle Accounts form.
const adminCardFields = (fields) => fields.filter(f =>
    f.showOnAdminCard || (f.belongsto === 'accounts' && ['sum', 'formula', 'tax'].includes(f.type))
)

// The Quick Edit section only shows the two figures the user cares about:
// the cost price and the final price.
const quickEditFields = (fields) => adminCardFields(fields).filter(f => {
    const label = (f.label || '').toLowerCase()
    return label.includes('final price') || label.includes('cost')
})

// Format a number with thousands separators (e.g. 123456 -> "123,456"),
// preserving an in-progress decimal point so decimals can be typed.
const fmtNumInput = (v) => {
    if (v === '' || v === null || v === undefined) return ''
    const s = String(v).replace(/[^0-9.\-]/g, '')
    if (s === '' || s === '-' || s.endsWith('.') || /^-?\d*\.$/.test(s)) return s
    const parts = s.split('.')
    if (parts.length > 2) return s
    const intFmt = Number(parts[0]).toLocaleString('en-US')
    return parts.length === 1 ? intFmt : `${intFmt}.${parts[1]}`
}

// ── Export / Khitai details modal ──────────────────────────────────────────────
const ExportModal = ({ vehicle, mode, countries, onSave, onClose }) => {
    const [country, setCountry] = useState(vehicle.exportCountry || '')
    const [saving, setSaving]   = useState(false)
    const isKhitai = mode === 'khitai'

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
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>{isKhitai ? 'Khitai Details' : 'Export Details'}</h3>
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
                            {isKhitai ? 'Destination Country' : 'Export Country'} <span style={{ color: '#c5221f' }}>*</span>
                        </label>
                        <CountrySelect
                            value={country}
                            onChange={setCountry}
                            extraOptions={countries}
                            required
                            autoFocus
                            placeholder="Type or select a country…"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button type="button" onClick={onClose}
                            style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || !country.trim()}
                            style={{ flex: 1, padding: '8px', background: saving ? '#9aa0a6' : '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: !country.trim() ? 0.5 : 1 }}>
                            {saving ? 'Saving…' : isKhitai ? 'Save Khitai' : 'Save Export'}
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
                if (val === 'export' || val === 'khitai') {
                    // first set the allocation, then open the country modal
                    onAllocChange(vehicle._id, val)
                    onExportSelect(vehicle, val)
                } else {
                    onAllocChange(vehicle._id, val)
                }
            }}
                style={{ width: '100%', padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', outline: 'none', background: '#fff', color: alloc ? '#202124' : '#9aa0a6' }}>
                <option value="">Allocation…</option>
                {ALLOC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Warning if country not set */}
            {(alloc === 'export' || alloc === 'khitai') && !vehicle.exportCountry && (
                <button onClick={() => onExportSelect(vehicle, alloc)}
                    style={{ padding: '4px 8px', background: '#fce8e6', border: '1px dashed #f5c6c2', borderRadius: '6px', fontSize: '11px', color: '#c5221f', cursor: 'pointer', fontWeight: 500, textAlign: 'left' }}>
                    ⚠ Add {alloc === 'export' ? 'export' : 'khitai'} country
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
                    {(() => {
                        const c = consignees.find(c => c._id === vehicle.consignee)
                        if (!c) return '📋 Presold'
                        return `📋 ${c.name}${c.purchasedAmount ? ` · $${Number(c.purchasedAmount).toLocaleString()}` : ''}`
                    })()}
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
const AllocCard = ({ vehicle, fields, taxes = [], rikusoCompanies, consignees, allocations,
    onAllocChange, onRikusoChange, onPresold, onRemovePresold, onExportSelect, onZoom }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const [hov, setHov]       = useState(false)
    const [editableValues, setEditableValues] = useState({})
    const [editingField, setEditingField] = useState(null)
    const [saving, setSaving] = useState(false)
    const imgs = getVehicleImages(vehicle)

    // Initialize editable values from vehicle
    // For sum/formula fields, compute the value from linked fields
    useEffect(() => {
        const adminFields = quickEditFields(fields)
        
        const toNum = (v) => {
            if (v === null || v === undefined || v === '') return 0
            const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''))
            return isNaN(n) ? 0 : n
        }
        
        const findFieldByLabel = (label, context = null) => {
            if (!label) return null
            let f = fields.find(x => x.label === label && x.belongsto === context)
            if (!f) f = fields.find(x => x.label === label)
            return f
        }
        
        const computeFieldValue = (field, visited = new Set()) => {
            if (visited.has(field._id)) return 0
            visited.add(field._id)
            
            // Vehicle-linked field
            if (field.vehicleField && vehicle) {
                const raw = vehicle[field.vehicleField]
                return toNum(raw && typeof raw === 'object' ? raw.name : raw)
            }
            
            // Tax field - compute from linked source field × linked tax rate
            if (field.type === 'tax') {
                const lt = taxes.find(t => t._id === field.linkedTax)
                if (!lt) return 0
                const src = findFieldByLabel(field.linkedField, field.belongsto)
                if (!src) return 0
                const sv = computeFieldValue(src, new Set(visited))
                if (sv <= 0) return 0
                if (lt.type === 'percentage') return sv * lt.rate / 100
                if (lt.type === 'multiplier') return sv * lt.rate
                return toNum(lt.rate)
            }
            
            // Sum field - compute from linked fields
            if (field.type === 'sum') {
                return (field.linkedFields || []).reduce((acc, label) => {
                    const linked = findFieldByLabel(label, field.belongsto)
                    if (!linked) return acc
                    return acc + computeFieldValue(linked, new Set(visited))
                }, 0)
            }
            
            // Formula field - compute from formula fields
            if (field.type === 'formula') {
                let result = null
                for (const ff of (field.formulaFields || [])) {
                    const linked = findFieldByLabel(ff.field, field.belongsto)
                    if (!linked) continue
                    const val = computeFieldValue(linked, new Set(visited))
                    if (result === null) { result = val; continue }
                    switch (ff.operation || 'add') {
                        case 'add': result += val; break
                        case 'subtract': result -= val; break
                        case 'multiply': result *= val; break
                        case 'divide': result = val !== 0 ? result / val : 0; break
                    }
                }
                return result ?? 0
            }
            
            // Regular field - read from vehicle document
            const val = vehicle[field._id] ?? vehicle[field.label] ?? vehicle[field.label?.replace(/\./g, '')]
            return toNum(val)
        }
        
        const initial = {}
        adminFields.forEach(f => {
            if (f.type === 'sum' || f.type === 'formula' || f.type === 'tax') {
                const computed = computeFieldValue(f)
                initial[f._id] = computed > 0 ? computed : ''
            } else {
                initial[f._id] = vehicle[f._id] ?? vehicle[f.label] ?? vehicle[f.label?.replace(/\./g, '')] ?? ''
            }
        })
        const run = async () => { setEditableValues(initial) }
        run()
    }, [vehicle, fields, taxes])

    const handleFieldSave = async (fieldId, value) => {
        setSaving(true)
        try {
            const field = fields.find(f => f._id === fieldId)
            const payload = { vehicleId: vehicle._id, [fieldId]: value }
            if (field?.label) {
                payload[field.label] = value
                // Also save with sanitized label (dots removed) to match MongoDB storage
                const sanitizedLabel = field.label.replace(/\./g, '')
                if (sanitizedLabel !== field.label) {
                    payload[sanitizedLabel] = value
                }
            }
            
            const res = await fetch('/api/vehicles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error('Failed to save')
        } catch (e) {
            alert('Failed to save field: ' + e.message)
        } finally {
            setSaving(false)
        }
    }

    const lotField   = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal     = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.stockId ? `#${vehicle.stockId}` : '', vehicle.auctionGroup, vehicle.auctionVenue, lotVal].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const descLine   = vehicle.modelDescription || vehicle.variant || ''
    const isPresold  = vehicle.allocationStatus || false
    const chField    = fields.find(f => f.label?.toLowerCase().includes('chassis'))
    const chassisVal = chField ? (vehicle[chField._id] || vehicle[chField.label]) : null

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

    // Get admin editable fields - include all contexts to support fields from any form
    const adminFields = quickEditFields(fields).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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
            <div style={{ position: 'relative', height: '140px', background: '#f1f5f9', flexShrink: 0 }}>
                {imgs.length > 0 ? (
                    <>
                        <img src={imgs[imgIdx]} alt="" onClick={e => { e.stopPropagation(); if (onZoom) onZoom(imgs, imgIdx) }} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9', display: 'block', cursor: onZoom ? 'zoom-in' : 'default' }} />
                        {onZoom && imgs.length > 0 && (
                            <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '9px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', pointerEvents: 'none' }}>Click to zoom</div>
                        )}
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

            {/* Editable Admin Fields + Presold Info */}
            {(adminFields.length > 0 || isPresold) && (
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f4f8', background: '#fffbf0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <svg style={{ width: '10px', height: '10px', color: '#92400e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Edit</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {/* Show presold consignee info if vehicle is presold */}
                        {isPresold && vehicle.consignee && (() => {
                            const consignee = consignees.find(c => c._id === vehicle.consignee);
                            return consignee ? (
                                <div key="presold-info" style={{ padding: '6px 8px', background: '#e8f0fe', borderRadius: '6px', border: '1px solid #1a73e8' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Presold To</div>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                                                {consignee.name}
                                                {consignee.purchasedAmount && <span style={{ color: '#059669', marginLeft: '6px' }}>· ${Number(consignee.purchasedAmount).toLocaleString()}</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => onPresold(vehicle)} style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', fontSize: '10px', fontWeight: 600, padding: '2px 4px' }}>
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ) : null;
                        })()}
                        
                        {/* Regular admin fields */}
                        {adminFields.map(field => {
                            const isReadOnly = field.type === 'sum' || field.type === 'formula' || field.type === 'tax' || !!field.vehicleField
                            const currentVal = editableValues[field._id] ?? ''
                            const hasValue = currentVal !== '' && currentVal !== null && currentVal !== undefined
                            const isEditing = editingField === field._id
                            
                            const formatDisplayValue = (v) => {
                                if (v === '' || v === null || v === undefined) return null
                                const num = parseFloat(v)
                                if (!isNaN(num)) {
                                    if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
                                    if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.?0+$/, '')}K`
                                    return num.toLocaleString()
                                }
                                return String(v)
                            }
                            
                            return (
                            <div key={field._id}>
                                <label style={{ display: 'block', fontSize: '8px', fontWeight: 700, color: isReadOnly ? '#1e40af' : '#78350f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                                    {field.label}
                                    {isReadOnly && <span style={{ marginLeft: '4px', fontSize: '7px', background: '#dbeafe', color: '#1e40af', padding: '1px 4px', borderRadius: '3px', fontWeight: 600 }}>AUTO</span>}
                                </label>
                                
                                {isReadOnly ? (
                                    // Read-only display for calculated fields
                                    <div style={{ padding: '4px 8px', border: '1px solid #bfdbfe', borderRadius: '4px', background: '#eff6ff', minHeight: '28px', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: hasValue ? '#1e40af' : '#94a3b8' }}>
                                            {hasValue ? formatDisplayValue(currentVal) : '—'}
                                        </span>
                                    </div>
                                ) : hasValue && !isEditing ? (
                                    // Show value as read-only display with edit button
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', border: '1px solid #fcd34d', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                                        onClick={() => setEditingField(field._id)}>
                                        <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#92400e' }}>
                                            {formatDisplayValue(currentVal)}
                                        </span>
                                        <svg style={{ width: '10px', height: '10px', color: '#78350f', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                ) : (
                                    // Show editable input
                                    <input
                                        autoFocus={isEditing}
                                        type={field.type === 'date' ? 'date' : 'text'}
                                        value={currentVal !== '' && currentVal !== null ? fmtNumInput(currentVal) : ''}
                                        onChange={e => setEditableValues(p => ({ ...p, [field._id]: e.target.value.replace(/[^0-9.\-]/g, '') }))}
                                        onBlur={e => {
                                            setEditingField(null)
                                            const raw = String(e.target.value).replace(/[^0-9.\-]/g, '')
                                            const original = (vehicle[field._id] ?? vehicle[field.label] ?? '').toString()
                                            if (raw !== original) {
                                                handleFieldSave(field._id, raw)
                                            }
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') e.target.blur()
                                            if (e.key === 'Escape') { setEditingField(null); setEditableValues(p => ({ ...p, [field._id]: vehicle[field._id] ?? vehicle[field.label] ?? '' })) }
                                        }}
                                        disabled={saving}
                                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #fbbf24', borderRadius: '4px', fontSize: '11px', outline: 'none', background: '#fff', color: '#202124', fontWeight: 600, boxSizing: 'border-box' }}
                                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    />
                                )}
                            </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* specs grid */}
            {(entries.length > 0 || chassisVal) && (
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f4f8' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                        {(() => {
                            // Insert chassis after the mileage field (or at end if not found)
                            const rows = [...entries.slice(0, 12)]
                            if (chassisVal) {
                                const millageIdx = rows.findIndex(e =>
                                    e.label?.toLowerCase().includes('millage') ||
                                    e.label?.toLowerCase().includes('mileage') ||
                                    e.label?.toLowerCase().includes('odometer')
                                )
                                const insertAt = millageIdx >= 0 ? millageIdx + 1 : rows.length
                                // Don't add if chassis is already present as a dynamic field
                                const alreadyHas = rows.some(e => e.label?.toLowerCase().includes('chassis'))
                                if (!alreadyHas) {
                                    rows.splice(insertAt, 0, { label: 'Chassis No.', value: String(chassisVal), isChassis: true })
                                }
                            }
                            return rows.map((e, i) => (
                                <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #f4f4f4' }}>
                                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>{e.label}</div>
                                    <div style={{
                                        fontSize: '11px', fontWeight: 600,
                                        color: e.isChassis ? '#2563eb' : '#1e293b',
                                        fontFamily: e.isChassis ? 'monospace' : 'inherit',
                                        marginTop: '1px', lineHeight: 1.3,
                                    }}>{e.value}</div>
                                </div>
                            ))
                        })()}
                    </div>
                </div>
            )}

            {/* price summary */}
            {(() => {
                const priceFields = fields.filter(f => f.type === 'number' && f.belongsto === 'add-vehicles' && (f.label?.toLowerCase().includes('price') || f.label?.toLowerCase().includes('fob') || f.label?.toLowerCase().includes('total') || f.label?.toLowerCase().includes('cost')))
                const prices = priceFields.map(f => {
                    const val = parseFloat(vehicle[f._id] || vehicle[f.label])
                    return { label: f.label, value: isNaN(val) ? null : val }
                }).filter(p => p.value !== null)
                if (prices.length === 0) return null
                return (
                    <div style={{ padding: '6px 10px', borderBottom: '1px solid #f0f4f8', background: '#f0fdf4' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {prices.map((p, i) => (
                                <div key={i} style={{ fontSize: '10px' }}>
                                    <span style={{ color: '#6b7280', fontWeight: 500 }}>{p.label}: </span>
                                    <span style={{ color: '#059669', fontWeight: 700 }}>${p.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })()}

            {/* status dots — same as VehicleCard */}
            <div style={{ padding: '6px 10px', background: '#f8fafc', borderBottom: '1px solid #f0f4f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {[
                            { label: alloc === 'export' && vehicle.exportCountry ? `Export / ${vehicle.exportCountry}` : 'Export', active: alloc === 'export', onClick: alloc === 'export' && vehicle.exportCountry ? () => onExportSelect(vehicle, 'export') : undefined },
                            { label: alloc === 'khitai' && vehicle.exportCountry ? `Khitai / ${vehicle.exportCountry}` : 'Khitai', active: alloc === 'khitai', onClick: alloc === 'khitai' && vehicle.exportCountry ? () => onExportSelect(vehicle, 'khitai') : undefined },
                            { label: 'Resale', active: alloc === 'resale-to-auction' },
                            { label: 'Rikso',  active: rikuso },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: s.onClick ? 'pointer' : 'default' }} onClick={s.onClick}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: s.active ? '#ef4444' : '#e2e8f0' }} />
                                <span style={{ fontSize: '10px', fontWeight: s.active ? 700 : 400, color: s.active ? '#dc2626' : '#94a3b8' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {[
                            { label: 'IGP', active: !!vehicle.physicalIn, title: 'Inward Gate Pass' },
                            { label: 'OGP', active: !!vehicle.physicalOut, title: 'Outward Gate Pass' },
                            { label: 'EC', active: !!vehicle.exportCertNumber, title: vehicle.exportCertNumber ? 'Export Certificate added' : 'Export Certificate', ec: true },
                            { label: 'BL', active: !!vehicle.blNumber, title: 'Bill of Lading' },
                        ].map(s => (
                            <div key={s.label} title={s.title} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ width: s.ec ? '15px' : '7px', height: s.ec ? '15px' : '7px', borderRadius: '50%', flexShrink: 0, background: s.ec ? (s.active ? '#1a73e8' : '#e2e8f0') : (s.active ? '#22c55e' : '#e2e8f0'), color: '#fff', fontSize: '7px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: s.ec && s.active ? '0 0 5px rgba(26,115,232,0.5)' : 'none' }}>
                                    {s.ec && s.active ? '✓' : ''}
                                </span>
                                <span style={{ fontSize: '10px', fontWeight: s.active ? 700 : 400, color: s.ec ? (s.active ? '#1a73e8' : '#cbd5e1') : (s.active ? '#16a34a' : '#cbd5e1') }}>{s.label}</span>
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
const AllocRow = ({ vehicle, fields, taxes = [], rikusoCompanies, consignees, allocations,
    onAllocChange, onRikusoChange, onPresold, onRemovePresold, onExportSelect, onZoom }) => {
    const [editableValues, setEditableValues] = useState({})
    const [saving, setSaving] = useState(false)
    const imgs      = getVehicleImages(vehicle)
    const isPresold = vehicle.allocationStatus || false
    const alloc     = (allocations[vehicle._id] || '').toLowerCase()
    const rikuso    = !!vehicle.rikusoStatus

    const lotField   = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal     = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.stockId ? `#${vehicle.stockId}` : '', vehicle.auctionGroup, vehicle.auctionVenue, lotVal].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ')

    // Initialize editable values from vehicle
    useEffect(() => {
        const adminFields = quickEditFields(fields)
        const toNum = (v) => {
            if (v === null || v === undefined || v === '') return 0
            const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''))
            return isNaN(n) ? 0 : n
        }
        const findFieldByLabel = (label, context = null) => {
            if (!label) return null
            let f = fields.find(x => x.label === label && x.belongsto === context)
            if (!f) f = fields.find(x => x.label === label)
            return f
        }
        const computeFieldValue = (field, visited = new Set()) => {
            if (visited.has(field._id)) return 0
            visited.add(field._id)
            if (field.vehicleField && vehicle) {
                const raw = vehicle[field.vehicleField]
                return toNum(raw && typeof raw === 'object' ? raw.name : raw)
            }
            if (field.type === 'tax') {
                const lt = taxes.find(t => t._id === field.linkedTax)
                if (!lt) return 0
                const src = findFieldByLabel(field.linkedField, field.belongsto)
                if (!src) return 0
                const sv = computeFieldValue(src, new Set(visited))
                if (sv <= 0) return 0
                if (lt.type === 'percentage') return sv * lt.rate / 100
                if (lt.type === 'multiplier') return sv * lt.rate
                return toNum(lt.rate)
            }
            if (field.type === 'sum') {
                return (field.linkedFields || []).reduce((acc, label) => {
                    const linked = findFieldByLabel(label, field.belongsto)
                    if (!linked) return acc
                    return acc + computeFieldValue(linked, new Set(visited))
                }, 0)
            }
            if (field.type === 'formula') {
                let result = null
                for (const ff of (field.formulaFields || [])) {
                    const linked = findFieldByLabel(ff.field, field.belongsto)
                    if (!linked) continue
                    const val = computeFieldValue(linked, new Set(visited))
                    if (result === null) { result = val; continue }
                    switch (ff.operation || 'add') {
                        case 'add': result += val; break
                        case 'subtract': result -= val; break
                        case 'multiply': result *= val; break
                        case 'divide': result = val !== 0 ? result / val : 0; break
                    }
                }
                return result ?? 0
            }
            const val = vehicle[field._id] ?? vehicle[field.label] ?? vehicle[field.label?.replace(/\./g, '')]
            return toNum(val)
        }
        const initial = {}
        adminFields.forEach(f => {
            if (f.type === 'sum' || f.type === 'formula' || f.type === 'tax') {
                const computed = computeFieldValue(f)
                initial[f._id] = computed > 0 ? computed : ''
            } else {
                initial[f._id] = vehicle[f._id] ?? vehicle[f.label] ?? ''
            }
        })
        const run = async () => { setEditableValues(initial) }
        run()
    }, [vehicle, fields, taxes])

    const handleFieldSave = async (fieldId, value) => {
        setSaving(true)
        try {
            const field = fields.find(f => f._id === fieldId)
            const payload = { vehicleId: vehicle._id, [fieldId]: value }
            if (field?.label) {
                payload[field.label] = value
                // Also save with sanitized label (dots removed) to match MongoDB storage
                const sanitizedLabel = field.label.replace(/\./g, '')
                if (sanitizedLabel !== field.label) {
                    payload[sanitizedLabel] = value
                }
            }
            
            const res = await fetch('/api/vehicles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error('Failed to save')
        } catch (e) {
            alert('Failed to save field: ' + e.message)
        } finally {
            setSaving(false)
        }
    }

    const formatRowValue = (v) => {
        if (v === '' || v === null || v === undefined) return null
        const num = parseFloat(v)
        if (!isNaN(num)) {
            if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
            if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.?0+$/, '')}K`
            return num.toLocaleString()
        }
        return String(v)
    }
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

    // Get admin editable fields - include all contexts to support fields from any form
    const adminFields = quickEditFields(fields).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    return (
        <tr style={{ borderBottom: '1px solid #f0f4f8', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            {/* Thumb */}
            <td style={{ padding: '5px 8px', width: '48px' }}>
                <div style={{ width: '42px', height: '32px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, position: 'relative' }}>
                    {imgs.length > 0
                        ? <img src={imgs[0]} alt="" title="Click to zoom" onClick={e => { e.stopPropagation(); if (onZoom) onZoom(imgs, 0) }} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9', cursor: onZoom ? 'zoom-in' : 'default' }} />
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
            {/* Chassis */}
            <td style={{ padding: '5px 8px', minWidth: '80px' }}>
                {(() => {
                    const chField = fields.find(f => f.label?.toLowerCase().includes('chassis'))
                    const chVal = chField ? (vehicle[chField._id] || vehicle[chField.label]) : null
                    return chVal ? <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{String(chVal)}</span> : <span style={{ fontSize: '10px', color: '#cbd5e1' }}>—</span>
                })()}
            </td>
            {/* Dynamic field values */}
            {/* Show admin editable fields if any, otherwise show regular card fields */}
            {adminFields.length > 0 ? (
                <>
                    {adminFields.slice(0, 5).map(field => {
                        const isReadOnly = field.type === 'sum' || field.type === 'formula' || field.type === 'tax' || !!field.vehicleField
                        const currentVal = editableValues[field._id] ?? ''
                        const hasValue = currentVal !== '' && currentVal !== null && currentVal !== undefined
                        return (
                        <td key={field._id} style={{ padding: '5px 8px', minWidth: '70px', background: '#fffbf0' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2, marginBottom: '2px' }}>{field.label}</div>
                            {isReadOnly ? (
                                <div style={{ fontSize: '11px', fontWeight: 700, color: hasValue ? '#1e40af' : '#94a3b8', whiteSpace: 'nowrap', padding: '3px 2px' }}>
                                    {hasValue ? formatRowValue(currentVal) : '—'}
                                </div>
                            ) : (
                                <input
                                    type={field.type === 'date' ? 'date' : 'text'}
                                    value={currentVal !== '' && currentVal !== null ? fmtNumInput(currentVal) : ''}
                                    onChange={e => setEditableValues(p => ({ ...p, [field._id]: e.target.value.replace(/[^0-9.\-]/g, '') }))}
                                    onBlur={e => {
                                        const raw = String(e.target.value).replace(/[^0-9.\-]/g, '')
                                        const original = (vehicle[field._id] ?? vehicle[field.label] ?? '').toString()
                                        if (raw !== original) {
                                            handleFieldSave(field._id, raw)
                                        }
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.target.blur()
                                        }
                                    }}
                                    disabled={saving}
                                    style={{ width: '100%', padding: '3px 5px', border: '1px solid #fcd34d', borderRadius: '4px', fontSize: '11px', outline: 'none', background: '#fff', color: '#202124', fontWeight: 600 }}
                                    placeholder={`${field.label}...`}
                                />
                            )}
                        </td>
                        )
                    })}
                    {adminFields.length < 5 && Array.from({ length: 5 - adminFields.length }).map((_, i) => <td key={`p${i}`} style={{ padding: '5px 8px' }} />)}
                </>
            ) : (
                <>
                    {entries.slice(0, 5).map((e, i) => (
                        <td key={i} style={{ padding: '5px 8px', minWidth: '70px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2 }}>{e.label}</div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{e.value}</div>
                        </td>
                    ))}
                    {entries.length < 5 && Array.from({ length: 5 - entries.length }).map((_, i) => <td key={`p${i}`} style={{ padding: '5px 8px' }} />)}
                </>
            )}
            {/* Status dots */}
            <td style={{ padding: '5px 8px', width: '60px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[
                        { label: alloc === 'export' && vehicle.exportCountry ? `E/${vehicle.exportCountry}` : 'E', active: alloc === 'export', title: alloc === 'export' && vehicle.exportCountry ? `Export / ${vehicle.exportCountry}` : 'Export', onClick: alloc === 'export' && vehicle.exportCountry ? () => onExportSelect(vehicle, 'export') : undefined },
                        { label: alloc === 'khitai' && vehicle.exportCountry ? `K/${vehicle.exportCountry}` : 'K', active: alloc === 'khitai', title: alloc === 'khitai' && vehicle.exportCountry ? `Khitai / ${vehicle.exportCountry}` : 'Khitai', onClick: alloc === 'khitai' && vehicle.exportCountry ? () => onExportSelect(vehicle, 'khitai') : undefined },
                        { label: 'R', active: alloc === 'resale-to-auction', title: 'Resale' },
                        { label: '⚙', active: rikuso, title: 'Rikuso' },
                        { label: 'P', active: isPresold, title: 'Presold' },
                        { label: 'I', active: !!vehicle.physicalIn, title: 'IGP' },
                        { label: 'O', active: !!vehicle.physicalOut, title: 'OGP' },
                        { label: 'EC', active: !!vehicle.exportCertNumber, title: vehicle.exportCertNumber ? 'Export Certificate added' : 'Export Certificate', ec: true },
                    ].map((s, idx) => (
                        <span key={idx} title={s.title} onClick={s.onClick} style={{ width: s.label.includes('/') ? 'auto' : '14px', minWidth: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: s.ec ? '50%' : '3px', fontSize: '8px', fontWeight: 700, background: s.ec ? (s.active ? '#1a73e8' : '#e2e8f0') : (s.active ? '#dc2626' : '#e2e8f0'), color: s.active ? '#fff' : '#94a3b8', padding: s.label.includes('/') ? '0 3px' : '0', cursor: s.onClick ? 'pointer' : 'default', whiteSpace: 'nowrap', boxShadow: s.ec && s.active ? '0 0 5px rgba(26,115,232,0.5)' : 'none' }}>
                            {s.label}
                        </span>
                    ))}
                </div>
            </td>
            {/* Allocation select */}
            <td style={{ padding: '5px 8px', minWidth: '130px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <select value={allocations[vehicle._id] || ''} onChange={e => {
                        const val = e.target.value
                        onAllocChange(vehicle._id, val)
                        if (val === 'export' || val === 'khitai') onExportSelect(vehicle, val)
                    }}
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', outline: 'none', background: '#fff' }}>
                        <option value="">Allocation…</option>
                        {ALLOC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {(allocations[vehicle._id] === 'export' || allocations[vehicle._id] === 'khitai') && vehicle.exportCountry && (
                        <div style={{ fontSize: '10px', color: '#1a73e8', background: '#e8f0fe', padding: '2px 6px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{allocations[vehicle._id] === 'export' ? 'Export' : 'Khitai'} / {vehicle.exportCountry}</span>
                            <button onClick={() => onExportSelect(vehicle, allocations[vehicle._id])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a73e8', fontSize: '10px', fontWeight: 600, padding: 0 }}>Edit</button>
                        </div>
                    )}
                    {(allocations[vehicle._id] === 'export' || allocations[vehicle._id] === 'khitai') && !vehicle.exportCountry && (
                        <button onClick={() => onExportSelect(vehicle, allocations[vehicle._id])} style={{ padding: '2px 6px', background: '#fce8e6', border: 'none', borderRadius: '4px', fontSize: '10px', color: '#c5221f', cursor: 'pointer', textAlign: 'left' }}>⚠ Add country</button>
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
    const [taxes, setTaxes]                 = useState([])
    const [loading, setLoading]             = useState(true)
    const [viewMode, setViewMode]           = useState('grid')
    const [search, setSearch]               = useState('')
    const [rikusoCompanies, setRikusoCompanies] = useState([])
    const [consignees, setConsignees]       = useState([])
    const [allocations, setAllocations]     = useState({})

    // presold modal
    const [selectedVehicle, setSelectedVehicle]   = useState(null)
    const [showPresoldModal, setShowPresoldModal]  = useState(false)
    const [presoldData, setPresoldData]            = useState({ consigneeId: '', purchasedAmount: '' })
    const [showNewConsignee, setShowNewConsignee]  = useState(false)
    const [newConsigneeData, setNewConsigneeData]  = useState({ name: '', company: '', phone: '', email: '' })

    // export modal
    const [exportVehicle, setExportVehicle] = useState(null)
    const [exportMode, setExportMode] = useState('export')

    // shared filters
    const [filters, setFilters] = useState(EMPTY_FILTERS)
    const [allocFilter, setAllocFilter] = useState('all') // 'all' | 'allocated' | 'unallocated'

    // image zoom
    const [zoomImage, setZoomImage] = useState(null)
    const [zoomIndex, setZoomIndex] = useState(0)
    const [zoomList, setZoomList] = useState([])

    useEffect(() => {
        Promise.all([
            fetch('/api/vehicles').then(r => r.ok ? r.json() : []),
            fetch('/api/fields').then(r => r.ok ? r.json() : []),
            fetch('/api/tax').then(r => r.ok ? r.json() : []),
            fetch('/api/manufacturer').then(r => r.ok ? r.json() : []),
            fetch('/api/consignee').then(r => r.ok ? r.json() : []),
        ]).then(([v, f, t, m, c]) => {
            const vs = Array.isArray(v) ? v : []
            setVehicles(vs)
            setFields(Array.isArray(f) ? f : [])  // Load ALL fields regardless of belongsto
            setTaxes(Array.isArray(t) ? t : [])
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
            const company = rikusoCompanies.find(c => c._id === rikusoCompanyId)
            const companyName = rikusoCompanyId ? (company?.companyName || company?.name || '') : ''
            const res = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId, rikusoCompany: rikusoCompanyId || null, rikusoCompanyName: companyName, rikusoStatus: rikusoCompanyId !== '' }) })
            if (res.ok) setVehicles(p => p.map(v => v._id === vehicleId ? { ...v, rikusoCompany: rikusoCompanyId || null, rikusoCompanyName: companyName, rikusoStatus: rikusoCompanyId !== '' } : v))
        } catch (e) { alert('Failed to update rikuso') }
    }

    const handlePresold = (vehicle) => {
        setSelectedVehicle(vehicle)
        if (vehicle.consignee) {
            setPresoldData({ consigneeId: vehicle.consignee, purchasedAmount: consignees.find(c => c._id === vehicle.consignee)?.purchasedAmount || '' })
        } else {
            setPresoldData({ consigneeId: '', purchasedAmount: '' })
        }
        setShowPresoldModal(true)
    }

    const handlePresoldSubmit = async (e) => {
        e.preventDefault()
        try {
            let consigneeId = presoldData.consigneeId
            if (!consigneeId) {
                alert('Please select a client / consignee')
                return
            }
            if (presoldData.purchasedAmount) {
                await fetch(`/api/consignee/${consigneeId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purchasedAmount: Number(presoldData.purchasedAmount) }) })
            }
            const upd = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId: selectedVehicle._id, consignee: consigneeId, allocationStatus: true }) })
            if (!upd.ok) throw new Error('Failed to update vehicle')
            const updatedConsignee = await fetch('/api/consignee').then(r => r.ok ? r.json() : [])
            setConsignees(Array.isArray(updatedConsignee) ? updatedConsignee : [])
            setVehicles(p => p.map(v => v._id === selectedVehicle._id ? { ...v, consignee: consigneeId, allocationStatus: true } : v))
            setShowPresoldModal(false)
        } catch (e) { alert(e.message) }
    }

    const handleCreateConsignee = async () => {
        if (!newConsigneeData.name.trim()) return
        try {
            const res = await fetch('/api/consignee', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newConsigneeData) })
            if (!res.ok) throw new Error('Failed to create consignee')
            const created = await res.json()
            setConsignees(p => [...p, created])
            setPresoldData(p => ({ ...p, consigneeId: created._id }))
            setShowNewConsignee(false)
            setNewConsigneeData({ name: '', company: '', phone: '', email: '' })
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

    const filtered = applyVehicleFilters(vehicles, fields, search, filters)

    // Apply allocation status filter
    const allocFiltered = allocFilter === 'all' ? filtered
        : allocFilter === 'allocated' ? filtered.filter(v => v.allocation)
        : filtered.filter(v => !v.allocation)

    const exportCountries = [...new Set(vehicles.map(v => v.exportCountry).filter(Boolean))].sort((a, b) => a.localeCompare(b))

    const controlProps = { onZoom: (imgs, idx) => { setZoomList(imgs); setZoomIndex(idx || 0); setZoomImage(imgs[idx || 0] || null) }, rikusoCompanies, consignees, allocations, onAllocChange: handleAllocChange, onRikusoChange: handleRikusoChange, onPresold: handlePresold, onRemovePresold: handleRemovePresold, onExportSelect: (v, mode) => { setExportVehicle(v); setExportMode(mode || (v.allocation || '').toLowerCase()) } }

    // Helper to find chassis number from dynamic fields
    const chassisOf = (v) => {
        if (!v) return ''
        const staticKeys = ['chassisNumber', 'Chassis No.', 'Chassis No', 'Chassis Number', 'VIN', 'Chassis', 'chassis']
        for (const k of staticKeys) { const val = v[k]; if (val && String(val).trim()) return String(val).trim() }
        for (const [k, val] of Object.entries(v)) {
            if (!val || typeof val === 'object') continue
            const lk = k.toLowerCase().replace(/[\s._-]/g, '')
            if ((lk.includes('chassis') || lk === 'vin') && String(val).trim()) return String(val).trim()
        }
        return ''
    }

    return (
        <div style={{ padding: '12px', minHeight: '100vh', background: '#f6f8fc' }}>
            <style>{`
                @media (max-width: 640px) {
                    .alloc-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
                    .alloc-controls { flex-wrap: wrap !important; }
                    .alloc-filter-tabs { width: 100%; justify-content: stretch; }
                    .alloc-filter-tabs button { flex: 1; text-align: center; }
                }
            `}</style>
            {/* Header */}
            <div className="alloc-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: 0 }}>Vehicle Allocation</h1>
                    <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>Manage allocations, presold labels and Rikuso assignments</p>
                </div>
                <div className="alloc-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Allocation filter tabs */}
                    <div className="alloc-filter-tabs" style={{ display: 'flex', gap: '2px', padding: '2px', background: '#f1f3f4', borderRadius: '8px' }}>
                        {[{ key: 'all', label: 'All Vehicles' }, { key: 'allocated', label: 'Allocated' }, { key: 'unallocated', label: 'Unallocated' }].map(t => (
                            <button key={t.key} onClick={() => setAllocFilter(t.key)}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: allocFilter === t.key ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s',
                                    background: allocFilter === t.key ? '#fff' : 'transparent',
                                    color: allocFilter === t.key ? '#1a73e8' : '#5f6368',
                                    boxShadow: allocFilter === t.key ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
                                {t.label}
                            </button>
                        ))}
                    </div>
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

            {/* Search + Filters */}
            <VehicleFilterBar
                vehicles={vehicles}
                fields={fields}
                search={search}
                onSearchChange={setSearch}
                filters={filters}
                onFiltersChange={setFilters}
                searchPlaceholder="Search vehicles..."
            />

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : allocFiltered.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: 0 }}>{search ? 'No vehicles match your search' : allocFilter === 'allocated' ? 'No allocated vehicles' : allocFilter === 'unallocated' ? 'No unallocated vehicles' : 'No vehicles yet'}</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {allocFiltered.map(v => <AllocCard key={v._id} vehicle={v} fields={fields} taxes={taxes} {...controlProps} />)}
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f4f8', background: '#f8fafc' }}>
                                <th style={{ padding: '7px 8px', width: '48px' }}></th>
                                <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Group / Venue</th>
                                <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vehicle</th>
                                <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Chassis</th>
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
                            {allocFiltered.map(v => <AllocRow key={v._id} vehicle={v} fields={fields} taxes={taxes} {...controlProps} />)}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {/* ── Company-wise Report ── */}
            {allocFiltered.length > 0 && (() => {
                const priceFields = fields.filter(f => f.belongsto === 'add-vehicles' && (f.type === 'number' || f.type === 'tax' || f.type === 'formula' || f.type === 'sum') && /(price|fob|total|cost)/i.test(f.label || ''))
                const groups = {}
                allocFiltered.forEach(v => {
                    const linked = rikusoCompanies.find(c => c._id === (v.rikusoCompany || v.rikusoCompanyName))
                    const name = v.rikusoCompanyName || linked?.companyName || linked?.name || 'Unassigned'
                    if (!groups[name]) groups[name] = { vehicles: [], total: 0, priceBreakdown: {} }
                    groups[name].vehicles.push(v)
                    priceFields.forEach(pf => {
                        const val = Number(String(v[pf._id] || v[pf.label] || 0).replace(/[^0-9.\-]/g, '')) || 0
                        groups[name].total += val
                        groups[name].priceBreakdown[pf.label] = (groups[name].priceBreakdown[pf.label] || 0) + val
                    })
                })
                const sorted = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
                return (
                    <div style={{ marginTop: '16px', background: '#fff', borderRadius: '10px', border: '1px solid #e8eaed', overflow: 'hidden' }}>
                        <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg style={{ width: '14px', height: '14px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company-wise Summary</span>
                            <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '4px' }}>({sorted.length} compan{sorted.length !== 1 ? 'ies' : 'y'})</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                                        <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company</th>
                                        <th style={{ padding: '8px 14px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vehicles</th>
                                        {priceFields.map(pf => (
                                            <th key={pf._id} style={{ padding: '8px 14px', textAlign: 'right', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{pf.label}</th>
                                        ))}
                                        <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: '10px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map(([name, data]) => (
                                        <tr key={name} style={{ borderBottom: '1px solid #f0f4f8' }}>
                                            <td style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 700, color: name === 'Unassigned' ? '#94a3b8' : '#0f172a' }}>
                                                {name === 'Unassigned' ? <em>Unassigned</em> : name}
                                            </td>
                                            <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', background: '#e8f0fe', color: '#1a73e8', fontSize: '11px', fontWeight: 700 }}>{data.vehicles.length}</span>
                                            </td>
                                            {priceFields.map(pf => {
                                                const val = data.priceBreakdown[pf.label] || 0
                                                return <td key={pf._id} style={{ padding: '8px 14px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{val > 0 ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</td>
                                            })}
                                            <td style={{ padding: '8px 14px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                                                {data.total > 0 ? data.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })()}

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
                                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                    Client / Consignee *
                                    <button type="button" onClick={() => setShowNewConsignee(true)} style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', fontWeight: 600, textTransform: 'none', letterSpacing: 'normal', fontSize: '10px' }}>+ New Client</button>
                                </label>
                                <select value={presoldData.consigneeId} onChange={e => setPresoldData(p => ({ ...p, consigneeId: e.target.value }))} required
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff', color: presoldData.consigneeId ? '#202124' : '#9aa0a6' }}>
                                    <option value="">Select client / consignee...</option>
                                    {[...consignees].sort((a, b) => (a.name || '').localeCompare(b.name || '')).map(c => <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
                                </select>
                            </div>
                            {showNewConsignee && (
                                <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Client</span>
                                        <button type="button" onClick={() => setShowNewConsignee(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c5221f', fontSize: '10px', fontWeight: 600 }}>✕</button>
                                    </div>
                                    <input type="text" value={newConsigneeData.name} onChange={e => setNewConsigneeData(p => ({ ...p, name: e.target.value }))} placeholder="Client name *" autoFocus
                                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                        <input type="text" value={newConsigneeData.company} onChange={e => setNewConsigneeData(p => ({ ...p, company: e.target.value }))} placeholder="Company"
                                            style={{ padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                                        <input type="text" value={newConsigneeData.phone} onChange={e => setNewConsigneeData(p => ({ ...p, phone: e.target.value }))} placeholder="Phone"
                                            style={{ padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <button type="button" onClick={handleCreateConsignee} disabled={!newConsigneeData.name.trim()}
                                        style={{ padding: '6px', background: newConsigneeData.name.trim() ? '#1a73e8' : '#9aa0a6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: newConsigneeData.name.trim() ? 'pointer' : 'not-allowed' }}>
                                        Create & Select
                                    </button>
                                </div>
                            )}
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

            {/* Export / Khitai Modal */}
            {exportVehicle && (
                <ExportModal
                    vehicle={exportVehicle}
                    mode={exportMode}
                    countries={exportCountries}
                    onSave={handleExportSave}
                    onClose={() => setExportVehicle(null)}
                />
            )}

            {/* Image Zoom Modal */}
            {zoomImage && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }} onClick={() => setZoomImage(null)}>
                    <button onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '12px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    <div onClick={e => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <img src={zoomImage} alt="" style={{ maxWidth: '92vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }} />
                        {zoomList.length > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={e => { e.stopPropagation(); const ni = (zoomIndex - 1 + zoomList.length) % zoomList.length; setZoomIndex(ni); setZoomImage(zoomList[ni]) }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '34px', height: '34px', fontSize: '16px', cursor: 'pointer' }}>‹</button>
                                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{zoomIndex + 1} / {zoomList.length}</span>
                                <button onClick={e => { e.stopPropagation(); const ni = (zoomIndex + 1) % zoomList.length; setZoomIndex(ni); setZoomImage(zoomList[ni]) }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '34px', height: '34px', fontSize: '16px', cursor: 'pointer' }}>›</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

export default RikusoManagementPage
