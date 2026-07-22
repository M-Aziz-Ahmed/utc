'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

// ── Shared field input ────────────────────────────────────────────────────────
const FieldInput = ({ field, value, onChange }) => {
    const base = { width: '100%', padding: '8px 11px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }
    const focus = e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)' }
    const blur  = e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none' }
    if (field.type === 'dropdown') return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.isRequired} style={{ ...base }} onFocus={focus} onBlur={blur}>
            <option value="">Select...</option>
            {[...(field.options || [])].sort((a, b) => a.localeCompare(b)).map((o, i) => <option key={i} value={o}>{o}</option>)}
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
    return <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.isRequired} placeholder={`Enter ${field.label.toLowerCase()}`} style={base} onFocus={focus} onBlur={blur} />
}

// ── Inline add-field form ─────────────────────────────────────────────────────
const InlineAddFieldForm = ({ FIELD_TYPES, onDone, onCancel }) => {
    const [field, setField] = useState({ label: '', type: 'text', isRequired: false, options: [] })
    const [optInput, setOptInput] = useState('')
    const [adding, setAdding] = useState(false)
    const [msg, setMsg] = useState(null)
    const handleAdd = async () => {
        if (!field.label.trim()) return
        setAdding(true); setMsg(null)
        try {
            const payload = { ...field, belongsto: 'accounts' }
            if (field.type === 'dropdown') payload.options = field.options.filter(o => o.trim())
            const res = await fetch('/api/newField', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed')
            onDone()
        } catch (err) { setMsg(err.message) } finally { setAdding(false) }
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Label *</label>
                <input autoFocus type="text" value={field.label} onChange={e => setField(f => ({ ...f, label: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Push Price" /></div>
            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Type</label>
                <select value={field.type} onChange={e => setField(f => ({ ...f, type: e.target.value, options: [] }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            {field.type === 'dropdown' && (
                <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Options</label>
                    {field.options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                            <input type="text" value={opt} onChange={e => setField(f => ({ ...f, options: f.options.map((o, j) => j === i ? e.target.value : o) }))} style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none' }} placeholder={`Option ${i + 1}`} />
                            <button type="button" onClick={() => setField(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: '#c5221f' }}>✕</button>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="text" value={optInput} onChange={e => setOptInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (optInput.trim()) { setField(f => ({ ...f, options: [...f.options, optInput.trim()] })); setOptInput('') } } }} style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none' }} placeholder="Type option, press Enter" />
                        <button type="button" onClick={() => { if (optInput.trim()) { setField(f => ({ ...f, options: [...f.options, optInput.trim()] })); setOptInput('') } }} style={{ padding: '6px 12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
                    </div>
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Required?</span>
                {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                    <label key={String(val)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: field.isRequired === val ? '1px solid #1a73e8' : '1px solid #e0e0e0', background: field.isRequired === val ? '#e8f0fe' : '#fff', color: field.isRequired === val ? '#1a73e8' : '#5f6368' }}>
                        <input type="radio" style={{ display: 'none' }} checked={field.isRequired === val} onChange={() => setField(f => ({ ...f, isRequired: val }))} /> {label}
                    </label>
                ))}
            </div>
            {msg && <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: '#fce8e6', color: '#c5221f', border: '1px solid #f5c6c2' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button type="button" onClick={onCancel} style={{ flex: 1, padding: '9px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                <button type="button" onClick={handleAdd} disabled={!field.label.trim() || adding} style={{ flex: 1, padding: '9px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.7 : 1 }}>{adding ? 'Adding...' : 'Add Field'}</button>
            </div>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const EditVehiclePage = () => {
    const router = useRouter()
    const { id: vehicleId } = useParams()

    const [loading, setLoading]             = useState(true)
    const [submitting, setSubmitting]       = useState(false)
    const [vehicle, setVehicle]             = useState(null)
    const [vehicleFields, setVehicleFields] = useState([])
    const [accountFields, setAccountFields] = useState([])
    const [formData, setFormData]           = useState({})     // vehicle fields
    const [accountData, setAccountData]     = useState({})     // account fields
    const [newImages, setNewImages]         = useState({})
    const [deletedImages, setDeletedImages] = useState({})
    const [mainImageUrl, setMainImageUrl]   = useState('')
    const [error, setError]                 = useState(null)
    const [saveMsg, setSaveMsg]             = useState(null)
    const [showAddAccountField, setShowAddAccountField] = useState(false)
    const FIELD_TYPES = ['text', 'number', 'boolean', 'email', 'date', 'file', 'image', 'dropdown']

    useEffect(() => { fetchAll() }, [vehicleId])

    const fetchAll = async () => {
        try {
            setLoading(true)
            const [vRes, vfRes, afRes] = await Promise.all([
                fetch(`/api/vehicles/${vehicleId}`),
                fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'add-vehicles' }) }),
                fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'accounts' }) }),
            ])
            if (!vRes.ok) throw new Error('Vehicle not found')
            const v  = await vRes.json()
            const vf = vfRes.ok ? (await vfRes.json()) : []
            const af = afRes.ok ? (await afRes.json()) : []

            setVehicle(v)
            setMainImageUrl(v.mainImageUrl || '')

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
            aFields.forEach(f => {
                const val = v[f._id] ?? v[f.label]
                if (val !== undefined && val !== null) aInit[f._id] = val
            })
            setAccountData(aInit)
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }

    const fetchAccountFields = async () => {
        const res = await fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'accounts' }) })
        const data = await res.json()
        if (res.ok && Array.isArray(data)) {
            const sorted = data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            setAccountFields(sorted)
        }
    }

    const getExistingImages = (field) => {
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

    const toggleDeleteImage = (fieldId, idx) => {
        setDeletedImages(prev => {
            const s = new Set(prev[fieldId] || [])
            s.has(idx) ? s.delete(idx) : s.add(idx)
            return { ...prev, [fieldId]: s }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true); setSaveMsg(null)
        try {
            const payload = {}
            // vehicle fields
            vehicleFields.forEach(f => {
                if (f.type === 'file' || f.type === 'image') return
                const val = formData[f._id]
                if (val !== undefined && val !== '') { payload[f._id] = val; payload[f.label] = val }
            })
            // variant field (special key)
            const variantVal = formData['__variant']
            if (variantVal !== undefined) { payload.variant = variantVal; payload.modelDescription = variantVal }
            // account fields
            accountFields.forEach(f => {
                const val = accountData[f._id]
                if (val !== undefined) { payload[f._id] = val; payload[f.label] = val }
            })
            // surviving images
            vehicleFields.filter(f => f.type === 'file' || f.type === 'image').forEach(field => {
                const existing = getExistingImages(field)
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
                fd.append('vehicleData', JSON.stringify({ vehicleId, ...payload }))
                Object.entries(newImages).forEach(([fieldId, files]) => {
                    const field = vehicleFields.find(f => f._id === fieldId)
                    const label = field?.label || fieldId
                    files.forEach((file, i) => fd.append(`dynamic_${label}_${i}`, file))
                })
                const res = await fetch('/api/vehicles', { method: 'PUT', body: fd })
                if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Error ${res.status}`) }
            } else {
                const res = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId, ...payload }) })
                if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `Error ${res.status}`) }
            }
            setSaveMsg({ type: 'success', text: 'Vehicle updated successfully.' })
            setTimeout(() => router.push('/admin/vehicles'), 1200)
        } catch (err) {
            setSaveMsg({ type: 'error', text: err.message })
        } finally { setSubmitting(false) }
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    )
    if (error || !vehicle) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#c5221f', marginBottom: '12px' }}>{error || 'Vehicle not found'}</p>
            <Link href="/admin/vehicles" style={{ color: '#1a73e8', fontSize: '13px' }}>← Back to Vehicles</Link>
        </div>
    )

    const nameLine       = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const subtitle       = vehicle.modelDescription || vehicle.variant || ''
    const crumbs         = [vehicle.auctionGroup, vehicle.auctionVenue, vehicle.manufacturer, vehicle.model].filter(Boolean)
    const textFields     = vehicleFields.filter(f => f.type !== 'file' && f.type !== 'image' && f.label?.toLowerCase().trim() !== 'description')
    const imageFields    = vehicleFields.filter(f => f.type === 'file' || f.type === 'image')

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh', background: '#f6f8fc' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Link href="/admin/vehicles" style={{ fontSize: '12px', color: '#9aa0a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onMouseEnter={e => e.currentTarget.style.color='#1a73e8'} onMouseLeave={e => e.currentTarget.style.color='#9aa0a6'}>
                        <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Vehicles
                    </Link>
                    {crumbs.map((c, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <span style={{ color: '#dadce0' }}>›</span>
                            <span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{c}</span>
                        </span>
                    ))}
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#202124', margin: 0 }}>{nameLine || 'Edit Vehicle'}</h1>
                {subtitle && <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '3px 0 0' }}>{subtitle}</p>}
            </div>

            {/* Two-column card */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '560px' }}>

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
                                Vehicle fields are <strong>editable</strong>.<br />
                                Only account details and images can be edited here.
                            </p>
                        </div>
                        <Link href="/admin/vehicles/add" style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9aa0a6', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.color='#1a73e8'} onMouseLeave={e => e.currentTarget.style.color='#9aa0a6'}>
                            <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add new vehicle
                        </Link>
                    </div>

                    {/* ── Right panel ── */}
                    <div style={{ padding: '28px 32px', overflowY: 'auto' }}>

                        {/* Subtitle / variant */}
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f3f4' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                                Subtitle / Variant
                                <span style={{ marginLeft: '6px', fontWeight: 400, color: '#9aa0a6', textTransform: 'none', letterSpacing: 'normal', fontSize: '11px' }}>shown below title on card</span>
                            </label>
                            <input type="text" value={formData['__variant'] ?? vehicle.variant ?? vehicle.modelDescription ?? ''}
                                onChange={e => setFormData(p => ({ ...p, __variant: e.target.value }))}
                                placeholder="e.g. Hybrid, 4WD 2.0, Gli"
                                style={{ width: '100%', maxWidth: '360px', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                                onFocus={e => { e.target.style.borderColor='#1a73e8'; e.target.style.boxShadow='0 0 0 3px rgba(26,115,232,0.1)' }}
                                onBlur={e => { e.target.style.borderColor='#e0e0e0'; e.target.style.boxShadow='none' }} />
                        </div>

                        {/* Dynamic vehicle fields */}
                        {textFields.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                                {textFields.map(field => (
                                    <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                                            {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                        </label>
                                        <FieldInput field={field} value={formData[field._id]} onChange={v => setFormData(p => ({ ...p, [field._id]: v }))} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Files & Images */}
                        {imageFields.length > 0 && (
                            <div style={{ borderTop: '2px solid #f1f3f4', paddingTop: '20px', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#202124', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: '#f1f3f4' }}>
                                        <svg style={{ width: '13px', height: '13px', color: '#5f6368' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </span>
                                    Files &amp; Images
                                    <span style={{ fontSize: '11px', color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>editable</span>
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                    {imageFields.map(field => {
                                        const existing  = getExistingImages(field)
                                        const keptCount = existing.length - (deletedImages[field._id]?.size || 0)
                                        return (
                                            <div key={field._id}>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                                                    {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                                </label>
                                                {existing.length > 0 && (
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <p style={{ fontSize: '10px', color: '#9aa0a6', marginBottom: '6px', fontWeight: 600 }}>
                                                            {keptCount}/{existing.length} kept
                                                            {(deletedImages[field._id]?.size || 0) > 0 && <span style={{ color: '#ef4444', marginLeft: '6px' }}>· {deletedImages[field._id].size} to remove</span>}
                                                            {' · '}★ = cover · × = remove
                                                        </p>
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
                                                <input type="file" multiple accept={field.type === 'image' ? 'image/*' : '*'}
                                                    onChange={e => setNewImages(prev => ({ ...prev, [field._id]: Array.from(e.target.files) }))}
                                                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '12px', boxSizing: 'border-box' }} />
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
                                        <span style={{ fontSize: '11px', color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>editable</span>
                                    </h3>
                                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '3px 0 0' }}>Financial and accounting fields</p>
                                </div>
                                <button type="button" onClick={() => setShowAddAccountField(true)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1a73e8', border: '1px solid #d2e3fc', borderRadius: '20px', padding: '5px 12px', background: '#f0f4ff', cursor: 'pointer', flexShrink: 0 }}>
                                    <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Add Field
                                </button>
                            </div>
                            {accountFields.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8f9fa', borderRadius: '10px', border: '2px dashed #e0e0e0' }}>
                                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '0 0 8px' }}>No account fields yet</p>
                                    <button type="button" onClick={() => setShowAddAccountField(true)} style={{ fontSize: '12px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add your first account field</button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                                    {accountFields.filter(f => f.type !== 'file' && f.type !== 'image').map(field => (
                                        <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                                                {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                            </label>
                                            <FieldInput field={field} value={accountData[field._id]} onChange={v => setAccountData(p => ({ ...p, [field._id]: v }))} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Save message */}
                        {saveMsg && (
                            <div style={{ margin: '16px 0 0', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: saveMsg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: saveMsg.type === 'success' ? '#137333' : '#c5221f', border: `1px solid ${saveMsg.type === 'success' ? '#b7dfbe' : '#f5c6c2'}` }}>
                                {saveMsg.type === 'success' ? <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
                                {saveMsg.text}
                            </div>
                        )}

                        {/* Submit row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', marginTop: '20px', borderTop: '1px solid #f1f3f4' }}>
                            <Link href="/admin/vehicles" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 20px', fontSize: '13px', fontWeight: 500, color: '#5f6368', border: '1px solid #e0e0e0', borderRadius: '24px', background: '#fff', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.background='#f1f3f4'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                                Cancel
                            </Link>
                            <button type="submit" disabled={submitting}
                                style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600, color: '#fff', background: submitting ? '#9aa0a6' : '#1a73e8', border: 'none', borderRadius: '24px', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 2px 8px rgba(26,115,232,0.3)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {submitting && <svg style={{ width: '14px', height: '14px', animation: 'spin 0.8s linear infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                                {submitting ? 'Saving...' : 'Save Changes →'}
                            </button>
                        </div>

                    </div>
                </form>
            </div>

            {/* Add Account Field Modal */}
            {showAddAccountField && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowAddAccountField(false)}>
                    <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', maxWidth: '420px', width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.22)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: 0 }}>Add Account Field</h3>
                            <button onClick={() => setShowAddAccountField(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', padding: '2px', display: 'flex' }}>
                                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '0 0 16px' }}>Field will be added to the <strong style={{ color: '#5f6368' }}>accounts</strong> form.</p>
                        <InlineAddFieldForm FIELD_TYPES={FIELD_TYPES} onDone={() => { fetchAccountFields(); setShowAddAccountField(false) }} onCancel={() => setShowAddAccountField(false)} />
                    </div>
                </div>
            )}

        </div>
    )
}

export default EditVehiclePage
