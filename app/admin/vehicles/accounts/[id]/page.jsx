'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'

// ── helpers ───────────────────────────────────────────────────────────────────
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

const getAllImages = (vehicle) => {
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

// ── Shared field input ────────────────────────────────────────────────────────
const FieldInput = ({ field, value, onChange, taxes = [], accountData, accountFields }) => {
    const base = { width: '100%', padding: '8px 11px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }
    const focus = e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)' }
    const blur  = e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none' }
    if (field.type === 'dropdown' || field.type === 'select-year' || field.type === 'select-country') return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.isRequired} style={{ ...base }} onFocus={focus} onBlur={blur}>
            <option value="">Select...</option>
            {[...(field.options || [])].sort((a, b) => { const na = Number(a), nb = Number(b); if (!isNaN(na) && !isNaN(nb)) return na - nb; return a.localeCompare(b) }).map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
    )
    if (field.type === 'boolean') return (
        <div style={{ display: 'flex', gap: '6px' }}>
            {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                <label key={String(val)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px', borderRadius: '8px', border: `2px solid ${value === val ? '#1a73e8' : '#e0e0e0'}`, background: value === val ? '#e8f0fe' : '#fff', fontSize: '12px', fontWeight: value === val ? 700 : 400, color: value === val ? '#1a73e8' : '#5f6368', transition: 'all 0.12s' }}>
                    <input type="radio" style={{ display: 'none' }} checked={value === val} onChange={() => onChange(val)} /> {label}
                </label>
            ))}
        </div>
    )
    if (field.type === 'tax') {
        const linkedTax = taxes.find(t => t._id === field.linkedTax)
        const sourceField = accountFields?.find(f => f.label === field.linkedField)
        const sourceVal = sourceField ? parseFloat(accountData?.[sourceField._id]) || 0 : 0
        let taxAmount = 0
        if (linkedTax && sourceVal > 0) {
            taxAmount = linkedTax.type === 'percentage'
                ? (sourceVal * linkedTax.rate / 100)
                : linkedTax.rate
        }
        const display = taxAmount > 0 ? taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
        return (
            <div style={{ position: 'relative' }}>
                <input readOnly value={display} style={{ ...base, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontWeight: 700, fontSize: '14px', cursor: 'default' }} />
                {linkedTax && <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', padding: '1px 5px', borderRadius: '6px', background: linkedTax.type === 'percentage' ? '#fef3c7' : '#e0e7ff', color: linkedTax.type === 'percentage' ? '#92400e' : '#3730a3', fontWeight: 600, pointerEvents: 'none' }}>{linkedTax.type === 'percentage' ? `${linkedTax.rate}%` : 'Fixed'}</span>}
            </div>
        )
    }
    if (field.type === 'sum') {
        const linkedFieldLabels = field.linkedFields || []
        let sum = 0
        const parts = []
        linkedFieldLabels.forEach(label => {
            const src = accountFields?.find(f => f.label === label)
            if (src) {
                const val = parseFloat(accountData?.[src._id]) || 0
                sum += val
                if (val !== 0) parts.push({ label: src.label, val })
            }
        })
        const display = sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        return (
            <div style={{ position: 'relative' }}>
                <input readOnly value={display} style={{ ...base, background: '#f5f3ff', border: '1px solid #c4b5fd', color: '#6d28d9', fontWeight: 700, fontSize: '14px', cursor: 'default' }} />
                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', padding: '1px 5px', borderRadius: '6px', background: '#ede9fe', color: '#6d28d9', fontWeight: 600, pointerEvents: 'none' }}>Sum</span>
            </div>
        )
    }
    return <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.isRequired} placeholder={`Enter ${field.label.toLowerCase()}`} style={base} onFocus={focus} onBlur={blur} />
}

const VehicleAccountPage = ({ params }) => {
    const { id } = use(params)
    const [vehicle, setVehicle]             = useState(null)
    const [vehicleFields, setVehicleFields] = useState([])
    const [accountFields, setAccountFields] = useState([])
    const [formData, setFormData]           = useState({})
    const [accountData, setAccountData]     = useState({})
    const [newImages, setNewImages]         = useState({})
    const [deletedImages, setDeletedImages] = useState({})
    const [mainImageUrl, setMainImageUrl]   = useState('')
    const [imgIdx, setImgIdx]               = useState(0)
    const [loading, setLoading]             = useState(true)
    const [saving, setSaving]               = useState(false)
    const [saveMsg, setSaveMsg]             = useState(null)
    const [taxes, setTaxes]                 = useState([])

    useEffect(() => {
        Promise.all([
            fetch(`/api/vehicles/${id}`).then(r => r.json()),
            fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'add-vehicles' }) }).then(r => r.json()),
            fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'accounts' }) }).then(r => r.json()),
            fetch('/api/tax').then(r => r.ok ? r.json() : []),
        ]).then(([v, vf, af, tx]) => {
            setVehicle(v); setMainImageUrl(v.mainImageUrl || '')
            setTaxes(Array.isArray(tx) ? tx : [])
            const vFields = Array.isArray(vf) ? vf.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
            setVehicleFields(vFields)
            const vInit = {}
            vFields.forEach(f => {
                const val = v[f._id] ?? v[f.label]
                if (val !== undefined && val !== null && !Array.isArray(val) && typeof val !== 'object')
                    vInit[f._id] = f.type === 'date' && val ? String(val).split('T')[0] : val
            })
            setFormData(vInit)
            const aFields = Array.isArray(af) ? af.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
            setAccountFields(aFields)
            const aInit = {}
            aFields.forEach(f => { const val = v[f._id] ?? v[f.label]; if (val !== undefined && val !== null) aInit[f._id] = val })
            setAccountData(aInit)
        }).catch(console.error).finally(() => setLoading(false))
    }, [id])

    const toggleDeleteImage = (fieldId, idx) => {
        setDeletedImages(prev => { const s = new Set(prev[fieldId] || []); s.has(idx) ? s.delete(idx) : s.add(idx); return { ...prev, [fieldId]: s } })
    }

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true); setSaveMsg(null)
        try {
            const payload = {}
            vehicleFields.forEach(f => {
                if (f.type === 'file' || f.type === 'image') return
                const val = formData[f._id]
                if (val !== undefined && val !== '') { payload[f._id] = val; payload[f.label] = val }
            })
            const variantVal = formData['__variant']
            if (variantVal !== undefined) { payload.variant = variantVal; payload.modelDescription = variantVal }
            accountFields.forEach(f => {
                const val = accountData[f._id]
                if (val !== undefined) { payload[f._id] = val; payload[f.label] = val }
            })
            vehicleFields.filter(f => f.type === 'file' || f.type === 'image').forEach(field => {
                const existing = getExistingImagesForField(vehicle, field)
                if (existing.length > 0) {
                    const deleted = deletedImages[field._id] || new Set()
                    payload[field.label.replace(/\./g, '')] = existing.filter((_, i) => !deleted.has(i))
                }
            })
            payload.mainImageUrl = mainImageUrl || ''
            const hasNewImages = Object.keys(newImages).length > 0
            if (hasNewImages) {
                const fd = new FormData()
                fd.append('vehicleData', JSON.stringify({ vehicleId: id, ...payload }))
                Object.entries(newImages).forEach(([fieldId, files]) => {
                    const field = vehicleFields.find(f => f._id === fieldId)
                    files.forEach((file, i) => fd.append(`dynamic_${field?.label || fieldId}_${i}`, file))
                })
                const res = await fetch('/api/vehicles', { method: 'PUT', body: fd })
                if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Error ${res.status}`) }
                setVehicle(await res.json())
            } else {
                const res = await fetch(`/api/vehicles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Error ${res.status}`) }
                setVehicle(await res.json())
            }
            setSaveMsg({ type: 'success', text: 'Saved successfully.' })
            setTimeout(() => setSaveMsg(null), 3000)
        } catch (err) { setSaveMsg({ type: 'error', text: err.message }) }
        finally { setSaving(false) }
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

    const imgs         = getAllImages(vehicle)
    const nameLine     = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const subtitle     = vehicle.modelDescription || vehicle.variant || ''
    const crumbs       = [vehicle.auctionGroup, vehicle.auctionVenue, vehicle.manufacturer, vehicle.model].filter(Boolean)
    const textFields   = vehicleFields.filter(f => f.type !== 'file' && f.type !== 'image' && f.label?.toLowerCase().trim() !== 'description')
    const imageFields  = vehicleFields.filter(f => f.type === 'file' || f.type === 'image')

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh', background: '#f6f8fc' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Link href="/admin/vehicles/accounts" style={{ fontSize: '12px', color: '#9aa0a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onMouseEnter={e => e.currentTarget.style.color='#1a73e8'} onMouseLeave={e => e.currentTarget.style.color='#9aa0a6'}>
                        <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Vehicle Accounts
                    </Link>
                    {crumbs.map((c, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <span style={{ color: '#dadce0' }}>›</span>
                            <span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{c}</span>
                        </span>
                    ))}
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#202124', margin: 0 }}>{nameLine || 'Vehicle Account'}</h1>
                {subtitle && <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '3px 0 0' }}>{subtitle}</p>}
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '560px' }}>

                    {/* ── Left sidebar ── */}
                    <div style={{ background: '#f8f9fa', borderRight: '1px solid #e8eaed', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9aa0a6', margin: '0 0 10px' }}>Summary</p>
                        {[
                            { label: 'Group',   value: vehicle.auctionGroup },
                            { label: 'Venue',   value: vehicle.auctionVenue },
                            { label: 'Maker',   value: vehicle.manufacturer },
                            { label: 'Model',   value: vehicle.model },
                            { label: 'Variant', value: vehicle.variant || vehicle.modelDescription },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ padding: '9px 12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9aa0a6' }}>{label}</div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: value ? '#1a73e8' : '#dadce0', marginTop: '2px' }}>{value || '—'}</div>
                            </div>
                        ))}
                        <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(26,115,232,0.06)', borderRadius: '8px', border: '1px solid #d2e3fc' }}>
                            <p style={{ fontSize: '11px', color: '#5f6368', margin: 0, lineHeight: 1.5 }}>
                                Edit vehicle fields &amp; account details.<br />
                                Add from Vehicle Entry Form.
                            </p>
                        </div>
                    </div>

                    {/* ── Right panel ── */}
                    <div style={{ padding: '28px 32px', overflowY: 'auto' }}>

                        {/* Image carousel */}
                        {imgs.length > 0 && (
                            <div style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', position: 'relative', height: '220px', background: '#0f172a' }}>
                                <img src={imgs[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                                {imgs.length > 1 && (
                                    <>
                                        <button type="button" onClick={() => setImgIdx((imgIdx - 1 + imgs.length) % imgs.length)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                                        <button type="button" onClick={() => setImgIdx((imgIdx + 1) % imgs.length)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                                        <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                            {imgs.map((_, i) => <span key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? '16px' : '6px', height: '6px', borderRadius: '4px', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', cursor: 'pointer', display: 'inline-block' }} />)}
                                        </div>
                                        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>{imgIdx + 1}/{imgs.length}</div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Subtitle / Variant */}
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f3f4' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                                Subtitle / Variant <span style={{ fontWeight: 400, color: '#9aa0a6', textTransform: 'none', letterSpacing: 'normal' }}>shown below title on card</span>
                            </label>
                            <input type="text" value={formData['__variant'] ?? vehicle.variant ?? vehicle.modelDescription ?? ''}
                                onChange={e => setFormData(p => ({ ...p, __variant: e.target.value }))}
                                placeholder="e.g. Hybrid, 4WD 2.0"
                                style={{ width: '100%', maxWidth: '360px', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                                onFocus={e => { e.target.style.borderColor='#1a73e8'; e.target.style.boxShadow='0 0 0 3px rgba(26,115,232,0.1)' }}
                                onBlur={e => { e.target.style.borderColor='#e0e0e0'; e.target.style.boxShadow='none' }} />
                        </div>

                        {/* Vehicle fields (editable) */}
                        {textFields.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Vehicle Details</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                                    {textFields.map(field => (
                                        <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                                                {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                            </label>
                                            <FieldInput field={field} value={formData[field._id]} onChange={v => setFormData(p => ({ ...p, [field._id]: v }))} taxes={taxes} accountData={formData} accountFields={vehicleFields} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image fields (editable) */}
                        {imageFields.length > 0 && (
                            <div style={{ borderTop: '2px solid #f1f3f4', paddingTop: '20px', marginBottom: '24px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#202124', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Files &amp; Images <span style={{ fontSize: '11px', color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>editable</span>
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                    {imageFields.map(field => {
                                        const existing  = getExistingImagesForField(vehicle, field)
                                        const keptCount = existing.length - (deletedImages[field._id]?.size || 0)
                                        return (
                                            <div key={field._id}>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}</label>
                                                {existing.length > 0 && (
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <p style={{ fontSize: '10px', color: '#9aa0a6', marginBottom: '6px', fontWeight: 600 }}>{keptCount}/{existing.length} kept{(deletedImages[field._id]?.size || 0) > 0 && <span style={{ color: '#ef4444', marginLeft: '6px' }}>· {deletedImages[field._id].size} to remove</span>} · ★ cover · × remove</p>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                            {existing.map((f, idx) => {
                                                                const deleted = !!(deletedImages[field._id]?.has(idx))
                                                                const isMain  = mainImageUrl === f.path
                                                                return (
                                                                    <div key={idx} style={{ position: 'relative', width: '80px', height: '62px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${isMain ? '#f59e0b' : deleted ? '#ef4444' : '#e5e7eb'}`, opacity: deleted ? 0.35 : 1, flexShrink: 0, transition: 'all 0.15s' }}>
                                                                        <img src={f.path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                                        {!deleted && <button type="button" onClick={() => setMainImageUrl(isMain ? '' : f.path)} style={{ position: 'absolute', top: '2px', left: '2px', width: '18px', height: '18px', borderRadius: '50%', background: isMain ? '#f59e0b' : 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>★</button>}
                                                                        <button type="button" onClick={() => toggleDeleteImage(field._id, idx)} style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', background: deleted ? '#16a34a' : '#ef4444', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{deleted ? '↺' : '×'}</button>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                <input type="file" multiple accept={field.type === 'image' ? 'image/*' : '*'} onChange={e => setNewImages(prev => ({ ...prev, [field._id]: Array.from(e.target.files) }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '12px', boxSizing: 'border-box' }} />
                                                {newImages[field._id]?.length > 0 && <p style={{ fontSize: '10px', color: '#1a73e8', marginTop: '4px', fontWeight: 600 }}>{newImages[field._id].length} new file{newImages[field._id].length > 1 ? 's' : ''} selected</p>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Account Details */}
                        <div style={{ borderTop: '2px solid #e8f0fe', paddingTop: '20px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: '#e8f0fe' }}>
                                            <svg style={{ width: '13px', height: '13px', color: '#1a73e8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </span>
                                        Account Details
                                    </h3>
                                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '3px 0 0' }}>{accountFields.length} field{accountFields.length !== 1 ? 's' : ''} · save when done</p>
                                </div>
                            </div>
                            {accountFields.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8f9fa', borderRadius: '10px', border: '2px dashed #e0e0e0' }}>
                                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '0 0 8px' }}>No account fields yet</p>
                                    <Link href="/admin/fields" style={{ fontSize: '12px', color: '#1a73e8', fontWeight: 600, textDecoration: 'none' }}>Go to Dynamic Fields →</Link>
                                </div>
                            ) : (
                                <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                                    {accountFields.filter(f => f.type !== 'file' && f.type !== 'image').map(field => (
                                        <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}</label>
                                            <FieldInput field={field} value={accountData[field._id]} onChange={v => setAccountData(p => ({ ...p, [field._id]: v }))} taxes={taxes} accountData={accountData} accountFields={accountFields} />
                                        </div>
                                    ))}
                                </div>

                                {/* Auto-calculated total */}
                                {(() => {
                                    const numFields = accountFields.filter(f => f.type === 'number' || f.type === 'text')
                                    const taxFields = accountFields.filter(f => f.type === 'tax' && f.linkedTax && f.linkedField)
                                    if (taxFields.length === 0) return null

                                    let sumInputs = 0
                                    let sumTaxes = 0

                                    taxFields.forEach(tf => {
                                        const linkedTax = taxes.find(t => t._id === tf.linkedTax)
                                        const sourceField = accountFields.find(f => f.label === tf.linkedField)
                                        if (!linkedTax || !sourceField) return
                                        const sourceVal = parseFloat(accountData[sourceField._id]) || 0
                                        sumTaxes += linkedTax.type === 'percentage'
                                            ? (sourceVal * linkedTax.rate / 100)
                                            : linkedTax.rate
                                    })

                                    numFields.forEach(f => {
                                        if (!f.linkedTax) {
                                            sumInputs += parseFloat(accountData[f._id]) || 0
                                        }
                                    })

                                    const grandTotal = sumInputs + sumTaxes

                                    return (
                                        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0369a1' }}>Total Price</span>
                                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0369a1' }}>{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )
                                })()}
                                </>
                            )}
                        </div>

                        {/* Save msg + button */}
                        {saveMsg && (
                            <div style={{ margin: '16px 0 0', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: saveMsg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: saveMsg.type === 'success' ? '#137333' : '#c5221f', border: `1px solid ${saveMsg.type === 'success' ? '#b7dfbe' : '#f5c6c2'}` }}>
                                {saveMsg.type === 'success' ? <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
                                {saveMsg.text}
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', marginTop: '20px', borderTop: '1px solid #f1f3f4' }}>
                            <Link href="/admin/vehicles/accounts" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, color: '#5f6368', border: '1px solid #e0e0e0', borderRadius: '24px', background: '#fff', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.background='#f1f3f4'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>Cancel</Link>
                            <button type="submit" disabled={saving} style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600, color: '#fff', background: saving ? '#9aa0a6' : '#1a73e8', border: 'none', borderRadius: '24px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 2px 8px rgba(26,115,232,0.3)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {saving && <svg style={{ width: '14px', height: '14px', animation: 'spin 0.8s linear infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                                {saving ? 'Saving...' : 'Save Account Details →'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VehicleAccountPage
