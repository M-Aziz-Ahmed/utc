'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'

// ── helpers ───────────────────────────────────────────────────────────────────
const getVehicleImages = (vehicle) => {
    const all = []
    for (const [k, val] of Object.entries(vehicle || {})) {
        if (k === 'mainImageUrl') continue
        if (Array.isArray(val)) val.forEach(item => { if (item?.path && item?.type?.startsWith('image/')) all.push(item.path) })
    }
    const unique = [...new Set(all)]
    if (vehicle?.mainImageUrl && unique.includes(vehicle.mainImageUrl))
        return [vehicle.mainImageUrl, ...unique.filter(u => u !== vehicle.mainImageUrl)]
    return unique
}

const getExistingImagesForField = (vehicle, field) => {
    const keys = [field._id, field.label, field.label?.replace(/\./g, ''), field.label?.replace(/\s+/g, '_')].filter(Boolean)
    for (const key of keys) {
        const val = vehicle?.[key]
        if (Array.isArray(val) && val.length > 0 && val[0]?.path) return val.filter(f => f?.path)
    }
    for (const [k, v] of Object.entries(vehicle || {})) {
        if (Array.isArray(v) && v.length > 0 && v[0]?.path && v[0]?.type?.startsWith('image/')) {
            const nk = k.toLowerCase().replace(/[\s._-]/g, '')
            const nl = field.label?.toLowerCase().replace(/[\s._-]/g, '')
            if (nl && nk === nl) return v.filter(f => f?.path)
        }
    }
    return []
}

// ── Generic editable field input ──────────────────────────────────────────────
const FieldInput = ({ field, value, onChange, accent = '#1a73e8' }) => {
    const base = {
        width: '100%', padding: '8px 11px', border: '1px solid #e0e0e0',
        borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
        background: '#fff', color: '#202124',
    }
    const onFocus = e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}1a` }
    const onBlur  = e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none' }

    if (field.type === 'dropdown') return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.isRequired}
            style={{ ...base }} onFocus={onFocus} onBlur={onBlur}>
            <option value="">Select...</option>
            {field.options?.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
    )
    if (field.type === 'boolean') return (
        <div style={{ display: 'flex', gap: '6px' }}>
            {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                <label key={String(val)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px', borderRadius: '8px', border: `2px solid ${value === val ? accent : '#e0e0e0'}`, background: value === val ? `${accent}14` : '#fff', fontSize: '12px', fontWeight: value === val ? 700 : 400, color: value === val ? accent : '#5f6368', transition: 'all 0.12s' }}>
                    <input type="radio" style={{ display: 'none' }} checked={value === val} onChange={() => onChange(val)} />
                    {label}
                </label>
            ))}
        </div>
    )
    return (
        <input
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.isRequired}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            style={base} onFocus={onFocus} onBlur={onBlur}
        />
    )
}

// ── Read-only display for core vehicle identity ───────────────────────────────
const InfoRow = ({ label, value }) => (
    <div style={{ paddingBottom: '10px', borderBottom: '1px solid #f0f4f8' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginTop: '3px', textTransform: 'uppercase' }}>{value || '—'}</div>
    </div>
)

// ── Main page ─────────────────────────────────────────────────────────────────
const VehicleAccountPage = ({ params }) => {
    const { id } = use(params)

    const [vehicle, setVehicle]             = useState(null)
    const [vehicleFields, setVehicleFields] = useState([])
    const [accountFields, setAccountFields] = useState([])

    // editable vehicle field data
    const [vehicleData, setVehicleData]     = useState({})
    // editable account data
    const [accountData, setAccountData]     = useState({})

    // image management
    const [imgIdx, setImgIdx]               = useState(0)
    const [newImages, setNewImages]         = useState({})      // fieldId → File[]
    const [deletedImages, setDeletedImages] = useState({})      // fieldId → Set<idx>
    const [mainImageUrl, setMainImageUrl]   = useState('')

    const [loading, setLoading]   = useState(true)
    const [saving, setSaving]     = useState(false)
    const [saveMsg, setSaveMsg]   = useState(null)

    useEffect(() => {
        Promise.all([
            fetch(`/api/vehicles/${id}`).then(r => r.json()),
            fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'add-vehicles' }) }).then(r => r.json()),
            fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'accounts' }) }).then(r => r.json()),
        ]).then(([v, vf, af]) => {
            setVehicle(v)
            setMainImageUrl(v.mainImageUrl || '')

            const vFields = Array.isArray(vf) ? vf.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
            setVehicleFields(vFields)

            // Pre-fill vehicle data
            const vInit = {}
            vFields.forEach(f => {
                const val = v[f._id] ?? v[f.label]
                if (val !== undefined && val !== null && !Array.isArray(val) && typeof val !== 'object') {
                    vInit[f._id] = val
                }
            })
            setVehicleData(vInit)

            const aFields = Array.isArray(af) ? af.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
            setAccountFields(aFields)

            // Pre-fill account data
            const aInit = {}
            aFields.forEach(f => {
                const val = v[f._id] ?? v[f.label]
                if (val !== undefined && val !== null) aInit[f._id] = val
            })
            setAccountData(aInit)
        }).catch(console.error)
        .finally(() => setLoading(false))
    }, [id])

    const toggleDeleteImage = (fieldId, idx) => {
        setDeletedImages(prev => {
            const s = new Set(prev[fieldId] || [])
            s.has(idx) ? s.delete(idx) : s.add(idx)
            return { ...prev, [fieldId]: s }
        })
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true); setSaveMsg(null)
        try {
            const payload = {}

            // Vehicle fields (both by _id and label for compatibility)
            vehicleFields.forEach(f => {
                if (f.type === 'file' || f.type === 'image') return // handled separately
                const val = vehicleData[f._id]
                if (val !== undefined && val !== '') {
                    payload[f._id]   = val
                    payload[f.label] = val
                }
            })

            // Account fields
            accountFields.forEach(f => {
                const val = accountData[f._id]
                if (val !== undefined) {
                    payload[f._id]   = val
                    payload[f.label] = val
                }
            })

            // Surviving images (existing minus deleted)
            vehicleFields.filter(f => f.type === 'file' || f.type === 'image').forEach(field => {
                const existing = getExistingImagesForField(vehicle, field)
                if (existing.length > 0) {
                    const deleted   = deletedImages[field._id] || new Set()
                    const surviving = existing.filter((_, i) => !deleted.has(i))
                    payload[field.label.replace(/\./g, '')] = surviving
                }
            })

            payload.mainImageUrl = mainImageUrl || ''

            const hasNewImages = Object.keys(newImages).length > 0

            if (hasNewImages) {
                const fd = new FormData()
                fd.append('vehicleData', JSON.stringify({ vehicleId: id, ...payload }))
                Object.entries(newImages).forEach(([fieldId, files]) => {
                    const field = vehicleFields.find(f => f._id === fieldId)
                    const label = field?.label || fieldId
                    files.forEach((file, i) => fd.append(`dynamic_${label}_${i}`, file))
                })
                const res = await fetch('/api/vehicles', { method: 'PUT', body: fd })
                if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Error ${res.status}`) }
                const updated = await res.json()
                setVehicle(updated)
            } else {
                const res = await fetch(`/api/vehicles/${id}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Error ${res.status}`) }
                const updated = await res.json()
                setVehicle(updated)
            }

            setSaveMsg({ type: 'success', text: 'Saved successfully.' })
            setTimeout(() => setSaveMsg(null), 3000)
        } catch (err) {
            setSaveMsg({ type: 'error', text: err.message })
        } finally { setSaving(false) }
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    )

    if (!vehicle || vehicle.message) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: '#c5221f', marginBottom: '12px' }}>Vehicle not found.</p>
            <Link href="/admin/vehicles/accounts" style={{ fontSize: '13px', color: '#1a73e8' }}>← Back to Accounts</Link>
        </div>
    )

    const imgs        = getVehicleImages(vehicle)
    const nameLine    = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const subtitle    = vehicle.modelDescription || vehicle.variant || ''
    const headerCrumbs = [vehicle.auctionGroup, vehicle.auctionVenue, vehicle.manufacturer, vehicle.model].filter(Boolean)

    const textVehicleFields  = vehicleFields.filter(f => f.type !== 'file' && f.type !== 'image' && f.label?.toLowerCase().trim() !== 'description')
    const imageVehicleFields = vehicleFields.filter(f => f.type === 'file' || f.type === 'image')

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh', background: '#f6f8fc' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* ── Header ── */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Link href="/admin/vehicles/accounts"
                        style={{ fontSize: '12px', color: '#9aa0a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onMouseEnter={e => e.currentTarget.style.color='#1a73e8'} onMouseLeave={e => e.currentTarget.style.color='#9aa0a6'}>
                        <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Vehicle Accounts
                    </Link>
                    {headerCrumbs.map((c, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <span style={{ color: '#dadce0' }}>›</span>
                            <span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{c}</span>
                        </span>
                    ))}
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#202124', margin: 0 }}>{nameLine || 'Vehicle Account'}</h1>
                {subtitle && <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '3px 0 0' }}>{subtitle}</p>}
            </div>

            {/* ── Two-column form ── */}
            <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

                    {/* ══ LEFT: Vehicle Information (editable) ══ */}
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ background: '#62748e', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>Vehicle Information</p>
                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>Edit vehicle fields · add from Vehicle Entry Form</p>
                            </div>
                        </div>

                        {/* Image carousel (existing, read-only view — editing below) */}
                        {imgs.length > 0 && (
                            <div style={{ position: 'relative', height: '210px', background: '#0f172a' }}>
                                <img src={imgs[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                                {imgs.length > 1 && (
                                    <>
                                        <button type="button" onClick={() => setImgIdx((imgIdx - 1 + imgs.length) % imgs.length)}
                                            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                                        <button type="button" onClick={() => setImgIdx((imgIdx + 1) % imgs.length)}
                                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                                        <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                            {imgs.map((_, i) => <span key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? '16px' : '6px', height: '6px', borderRadius: '4px', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', cursor: 'pointer', display: 'inline-block' }} />)}
                                        </div>
                                        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px' }}>{imgIdx + 1}/{imgs.length}</div>
                                    </>
                                )}
                            </div>
                        )}

                        <div style={{ padding: '18px' }}>
                            {/* Core identity — read-only (set at creation) */}
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Identity</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                                    {[
                                        { label: 'Auction Group', value: vehicle.auctionGroup },
                                        { label: 'Venue',         value: vehicle.auctionVenue },
                                        { label: 'Manufacturer',  value: vehicle.manufacturer },
                                        { label: 'Model',         value: vehicle.model },
                                        { label: 'Variant',       value: vehicle.variant || vehicle.modelDescription },
                                    ].filter(e => e.value).map(e => <InfoRow key={e.label} {...e} />)}
                                </div>
                            </div>

                            {/* Dynamic vehicle text fields — EDITABLE */}
                            {textVehicleFields.length > 0 && (
                                <div style={{ borderTop: '1px solid #f0f4f8', paddingTop: '14px', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Details</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                                        {textVehicleFields.map(field => (
                                            <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                                                    {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                                </label>
                                                <FieldInput field={field} value={vehicleData[field._id]} onChange={v => setVehicleData(p => ({ ...p, [field._id]: v }))} accent="#62748e" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image fields — EDITABLE */}
                            {imageVehicleFields.length > 0 && (
                                <div style={{ borderTop: '1px solid #f0f4f8', paddingTop: '14px' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                                        Files &amp; Images
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {imageVehicleFields.map(field => {
                                            const existing  = getExistingImagesForField(vehicle, field)
                                            const keptCount = existing.length - (deletedImages[field._id]?.size || 0)
                                            return (
                                                <div key={field._id}>
                                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                                                        {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                                    </label>
                                                    {existing.length > 0 && (
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <p style={{ fontSize: '10px', color: '#9aa0a6', marginBottom: '6px', fontWeight: 600 }}>
                                                                {keptCount}/{existing.length} kept
                                                                {(deletedImages[field._id]?.size || 0) > 0 && <span style={{ color: '#ef4444', marginLeft: '6px' }}>· {deletedImages[field._id].size} to remove</span>}
                                                                {' · '}★ cover · × remove
                                                            </p>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                {existing.map((f, idx) => {
                                                                    const deleted = !!(deletedImages[field._id]?.has(idx))
                                                                    const isMain  = mainImageUrl === f.path
                                                                    return (
                                                                        <div key={idx} style={{ position: 'relative', width: '76px', height: '58px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${isMain ? '#f59e0b' : deleted ? '#ef4444' : '#e5e7eb'}`, opacity: deleted ? 0.35 : 1, flexShrink: 0, transition: 'all 0.15s' }}>
                                                                            <img src={f.path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                                            {!deleted && (
                                                                                <button type="button" onClick={() => setMainImageUrl(isMain ? '' : f.path)}
                                                                                    style={{ position: 'absolute', top: '2px', left: '2px', width: '18px', height: '18px', borderRadius: '50%', background: isMain ? '#f59e0b' : 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>★</button>
                                                                            )}
                                                                            <button type="button" onClick={() => toggleDeleteImage(field._id, idx)}
                                                                                style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', background: deleted ? '#16a34a' : '#ef4444', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                                                                                {deleted ? '↺' : '×'}
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <input type="file" multiple accept={field.type === 'image' ? 'image/*' : '*'}
                                                        onChange={e => setNewImages(prev => ({ ...prev, [field._id]: Array.from(e.target.files) }))}
                                                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '12px', boxSizing: 'border-box' }} />
                                                    {newImages[field._id]?.length > 0 && (
                                                        <p style={{ fontSize: '10px', color: '#1a73e8', marginTop: '4px', fontWeight: 600 }}>{newImages[field._id].length} new file{newImages[field._id].length > 1 ? 's' : ''} selected</p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ══ RIGHT: Account Details (editable) ══ */}
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #1a73e8, #1557b0)', padding: '14px 18px' }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Account Details
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
                                {accountFields.length} field{accountFields.length !== 1 ? 's' : ''} · save when done
                            </p>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {accountFields.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                        <svg style={{ width: '24px', height: '24px', color: '#1a73e8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#5f6368', margin: '0 0 6px' }}>No account fields yet</p>
                                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '0 0 14px' }}>Add account fields from the Add Vehicle form or Dynamic Fields page</p>
                                    <Link href="/admin/fields" style={{ fontSize: '12px', color: '#1a73e8', fontWeight: 600, textDecoration: 'none' }}>
                                        Go to Dynamic Fields →
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px' }}>
                                    {accountFields.filter(f => f.type !== 'file' && f.type !== 'image').map(field => (
                                        <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                                                {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                            </label>
                                            <FieldInput field={field} value={accountData[field._id]} onChange={v => setAccountData(p => ({ ...p, [field._id]: v }))} accent="#1a73e8" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Save message + button pinned to bottom of right card */}
                        <div style={{ padding: '0 20px 20px' }}>
                            {saveMsg && (
                                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: saveMsg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: saveMsg.type === 'success' ? '#137333' : '#c5221f', border: `1px solid ${saveMsg.type === 'success' ? '#b7dfbe' : '#f5c6c2'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {saveMsg.type === 'success'
                                        ? <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        : <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
                                    {saveMsg.text}
                                </div>
                            )}
                            <button type="submit" disabled={saving}
                                style={{ width: '100%', padding: '11px 20px', fontSize: '14px', fontWeight: 600, color: '#fff', background: saving ? '#9aa0a6' : '#1a73e8', border: 'none', borderRadius: '24px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 2px 8px rgba(26,115,232,0.3)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {saving && <svg style={{ width: '14px', height: '14px', animation: 'spin 0.8s linear infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                                {saving ? 'Saving...' : 'Save Account Details →'}
                            </button>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    )
}

export default VehicleAccountPage
