'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const getVehicleImages = (vehicle) => {
    const all = []
    for (const val of Object.values(vehicle)) {
        if (Array.isArray(val)) val.forEach(item => { if (item?.path && item?.type?.startsWith('image/')) all.push(item.path) })
    }
    const unique = [...new Set(all)]
    if (vehicle.mainImageUrl && unique.includes(vehicle.mainImageUrl))
        return [vehicle.mainImageUrl, ...unique.filter(u => u !== vehicle.mainImageUrl)]
    return unique
}

// ── Read-only field display ───────────────────────────────────────────────────
const ReadField = ({ label, value }) => (
    <div style={{ paddingBottom: '10px', borderBottom: '1px solid #f0f4f8' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '3px', textTransform: 'uppercase' }}>{value || '—'}</div>
    </div>
)

// ── Account field input ───────────────────────────────────────────────────────
const AccountInput = ({ field, value, onChange }) => {
    if (field.type === 'dropdown') return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.isRequired}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none' }}>
            <option value="">Select...</option>
            {field.options?.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
    )
    if (field.type === 'boolean') return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                <label key={String(val)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', padding: '9px', borderRadius: '8px', border: `2px solid ${value === val ? '#1a73e8' : '#e0e0e0'}`, background: value === val ? '#e8f0fe' : '#fff', fontSize: '13px', fontWeight: value === val ? 700 : 400, color: value === val ? '#1a73e8' : '#5f6368', transition: 'all 0.12s' }}>
                    <input type="radio" style={{ display: 'none' }} checked={value === val} onChange={() => onChange(val)} />
                    {label}
                </label>
            ))}
        </div>
    )
    return (
        <input
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            required={field.isRequired}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none' }}
        />
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const VehicleAccountPage = ({ params }) => {
    const { id } = use(params)

    const [vehicle, setVehicle] = useState(null)
    const [vehicleFields, setVehicleFields] = useState([])   // add-vehicles fields (read-only)
    const [accountFields, setAccountFields] = useState([])   // accounts fields (editable)
    const [accountData, setAccountData] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState(null)
    const [imgIdx, setImgIdx] = useState(0)

    useEffect(() => {
        Promise.all([
            fetch(`/api/vehicles/${id}`).then(r => r.json()),
            fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'add-vehicles' }) }).then(r => r.json()),
            fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'accounts' }) }).then(r => r.json()),
        ]).then(([v, vf, af]) => {
            setVehicle(v)
            setVehicleFields(Array.isArray(vf) ? vf.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [])
            const aFields = Array.isArray(af) ? af.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
            setAccountFields(aFields)
            // Pre-populate accountData from existing vehicle data
            const existing = {}
            aFields.forEach(f => {
                const val = v[f._id] ?? v[f.label]
                if (val !== undefined && val !== null) existing[f._id] = val
            })
            setAccountData(existing)
        }).catch(console.error)
        .finally(() => setLoading(false))
    }, [id])

    const handleChange = (fieldId, value) => setAccountData(prev => ({ ...prev, [fieldId]: value }))

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true); setSaveMsg(null)
        try {
            // Build payload: field _id → value AND field label → value (for display compatibility)
            const payload = {}
            accountFields.forEach(f => {
                const val = accountData[f._id]
                if (val !== undefined) {
                    payload[f._id] = val
                    payload[f.label] = val
                }
            })
            const res = await fetch(`/api/vehicles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('Failed to save')
            const updated = await res.json()
            setVehicle(updated)
            setSaveMsg({ type: 'success', text: 'Account details saved successfully.' })
            setTimeout(() => setSaveMsg(null), 3000)
        } catch (err) {
            setSaveMsg({ type: 'error', text: err.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )

    if (!vehicle || vehicle.message) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: '#c5221f' }}>Vehicle not found.</p>
            <Link href="/admin/vehicles/accounts" style={{ fontSize: '13px', color: '#1a73e8' }}>← Back to Accounts</Link>
        </div>
    )

    const imgs = getVehicleImages(vehicle)
    const nameLine = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const subtitle = vehicle.modelDescription || vehicle.variant || ''
    const headerCrumbs = [vehicle.auctionGroup, vehicle.auctionVenue, vehicle.manufacturer, vehicle.model].filter(Boolean)

    // Vehicle fields read-only entries
    const readEntries = vehicleFields.map(f => {
        let val = vehicle[f._id] ?? vehicle[f.label]
        if (val === undefined || val === null || val === '' || Array.isArray(val) || typeof val === 'object') return null
        return { label: f.label, value: String(val) }
    }).filter(Boolean)

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh', background: '#f6f8fc' }}>

            {/* Breadcrumb header */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Link href="/admin/vehicles/accounts" style={{ fontSize: '12px', color: '#9aa0a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1a73e8'} onMouseLeave={e => e.currentTarget.style.color = '#9aa0a6'}>
                            <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Vehicle Accounts
                        </Link>
                        <span style={{ color: '#dadce0', fontSize: '12px' }}>›</span>
                        {headerCrumbs.map((c, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                {i > 0 && <span style={{ color: '#dadce0' }}>›</span>}
                                <span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{c}</span>
                            </span>
                        ))}
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#202124', margin: 0 }}>{nameLine || 'Vehicle Account'}</h1>
                    {subtitle && <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '3px 0 0' }}>{subtitle}</p>}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#9aa0a6' }}>View only · account editing below</span>
                </div>
            </div>

            {/* Main layout: left = vehicle info (read-only), right = account form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

                {/* ── LEFT: Vehicle details (read-only) ── */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {/* Card header */}
                    <div style={{ background: '#62748e', padding: '14px 18px' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                            Vehicle Information
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Read-only · edit from Vehicle Entry Form</p>
                    </div>

                    {/* Images */}
                    {imgs.length > 0 && (
                        <div style={{ position: 'relative', height: '220px', background: '#0f172a', flexShrink: 0 }}>
                            <img src={imgs[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                            {imgs.length > 1 && (
                                <>
                                    <button onClick={() => setImgIdx((imgIdx - 1 + imgs.length) % imgs.length)}
                                        style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                                    <button onClick={() => setImgIdx((imgIdx + 1) % imgs.length)}
                                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                                    <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                        {imgs.map((_, i) => <span key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? '16px' : '6px', height: '6px', borderRadius: '4px', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', cursor: 'pointer' }} />)}
                                    </div>
                                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px' }}>{imgIdx + 1}/{imgs.length}</div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Fields */}
                    <div style={{ padding: '18px' }}>
                        {/* Core info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginBottom: '16px' }}>
                            {[
                                { label: 'Auction Group', value: vehicle.auctionGroup },
                                { label: 'Venue', value: vehicle.auctionVenue },
                                { label: 'Manufacturer', value: vehicle.manufacturer },
                                { label: 'Model', value: vehicle.model },
                                { label: 'Variant', value: vehicle.variant || vehicle.modelDescription },
                            ].filter(e => e.value).map(e => <ReadField key={e.label} {...e} />)}
                        </div>

                        {/* Dynamic vehicle fields */}
                        {readEntries.length > 0 && (
                            <>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', paddingTop: '12px', borderTop: '1px solid #f0f4f8' }}>Details</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                                    {readEntries.map(e => <ReadField key={e.label} {...e} />)}
                                </div>
                            </>
                        )}

                        {readEntries.length === 0 && vehicleFields.length === 0 && (
                            <p style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center', padding: '16px 0' }}>No vehicle fields configured</p>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Account fields (editable) ── */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {/* Card header */}
                    <div style={{ background: 'linear-gradient(135deg, #1a73e8, #1557b0)', padding: '14px 18px' }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Account Details
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
                            {accountFields.length} field{accountFields.length !== 1 ? 's' : ''} · save when done
                        </p>
                    </div>

                    <div style={{ padding: '20px 20px' }}>
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
                            <form onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                                    {accountFields.filter(f => f.type !== 'file' && f.type !== 'image').map(field => (
                                        <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                                                {field.label}
                                                {field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                            </label>
                                            <AccountInput field={field} value={accountData[field._id]} onChange={v => handleChange(field._id, v)} />
                                        </div>
                                    ))}
                                </div>

                                {saveMsg && (
                                    <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: saveMsg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: saveMsg.type === 'success' ? '#137333' : '#c5221f', border: `1px solid ${saveMsg.type === 'success' ? '#b7dfbe' : '#f5c6c2'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {saveMsg.type === 'success'
                                            ? <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            : <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
                                        {saveMsg.text}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f1f3f4' }}>
                                    <button type="submit" disabled={saving}
                                        style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600, color: '#fff', background: saving ? '#9aa0a6' : '#1a73e8', border: 'none', borderRadius: '24px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 2px 8px rgba(26,115,232,0.3)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {saving && <svg style={{ width: '14px', height: '14px', animation: 'spin 0.8s linear infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                                        {saving ? 'Saving...' : 'Save Account Details →'}
                                    </button>
                                </div>
                                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleAccountPage
