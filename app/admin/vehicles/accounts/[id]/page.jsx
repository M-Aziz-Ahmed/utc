'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { compressImage } from '@/utils/imageCompress'

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
const FieldInput = ({ field, value, onChange, taxes = [], accountData, vehicleData, accountFields, vehicleFields, allFields, vehicle, disabled }) => {
    const base = { width: '100%', padding: '8px 11px', border: disabled ? '1px solid #e5e7eb' : '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: disabled ? '#f9fafb' : '#fff', color: disabled ? '#9ca3af' : undefined, cursor: disabled ? 'not-allowed' : undefined }
    const focus = e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)' }
    const blur  = e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none' }

    // Format a number for display with thousands separators while preserving
    // an in-progress decimal point (e.g. "130.") so decimals can be typed.
    const formatNumInput = (v) => {
        if (v === '' || v === null || v === undefined) return ''
        const s = String(v).replace(/[^0-9.\-]/g, '')
        if (s === '' || s === '-' || s.endsWith('.') || /^-?\d*\.$/.test(s)) return s
        const parts = s.split('.')
        if (parts.length > 2) return s
        const intFmt = Number(parts[0]).toLocaleString('en-US')
        return parts.length === 1 ? intFmt : `${intFmt}.${parts[1]}`
    }

    const toNum = (v) => {
        if (v === null || v === undefined || v === '') return 0
        const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''))
        return isNaN(n) ? 0 : n
    }

    const getSourceValue = (sourceFieldLabel, contextBelongsto = field.belongsto, visited = new Set()) => {
        // Find the field definition
        let src = (allFields || []).find(f => f.label === sourceFieldLabel && f.belongsto === contextBelongsto)
        if (!src) src = (allFields || []).find(f => f.label === sourceFieldLabel)
        if (!src || visited.has(src._id)) return 0
        visited.add(src._id)

        // ── Vehicle-linked field: always compute from vehicle document ──────────
        if (src.vehicleField && vehicle) {
            const raw = vehicle[src.vehicleField]
            return toNum(raw && typeof raw === 'object' ? raw.name : raw)
        }

        // ── Tax field: calculate from its linked source field ──────────────────
        if (src.type === 'tax') {
            const lt = taxes.find(t => t._id === src.linkedTax)
            if (!lt) return 0
            const sv = getSourceValue(src.linkedField, null, new Set(visited))   // fresh visited set so tax can resolve its source
            if (sv <= 0) return 0
            if (lt.type === 'percentage') return sv * lt.rate / 100
            if (lt.type === 'multiplier') return sv * lt.rate
            return toNum(lt.rate)
        }

        // ── Sum field: recalculate from all linked fields ───────────────────────
        if (src.type === 'sum') {
            return (src.linkedFields || []).reduce((acc, label) => {
                return acc + getSourceValue(label, null, new Set(visited))
            }, 0)
        }

        // ── Formula field: recalculate ──────────────────────────────────────────
        if (src.type === 'formula') {
            let result = null
            for (const ff of (src.formulaFields || [])) {
                const val = getSourceValue(ff.field, null, new Set(visited))
                if (result === null) { result = val; continue }
                switch (ff.operation || 'add') {
                    case 'add':      result += val; break
                    case 'subtract': result -= val; break
                    case 'multiply': result *= val; break
                    case 'divide':   result = val !== 0 ? result / val : 0; break
                    default:         result += val
                }
            }
            return result ?? 0
        }

        // ── Regular field: read from appropriate data store ────────────────────
        const data = src.belongsto === 'add-vehicles' ? (vehicleData || {}) : (accountData || {})
        const val = data[src._id] ?? data[src.label] ?? data[src.label?.replace(/\./g, '')]
        return toNum(val)
    }

    if (field.vehicleField && vehicle) {
        const rawVal = vehicle[field.vehicleField]
        let display = '—'
        if (rawVal && typeof rawVal === 'object' && rawVal.name) display = rawVal.name
        else if (rawVal) display = String(rawVal)
        return (
            <div style={{ position: 'relative' }}>
                <input readOnly value={display} style={{ ...base, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 600, cursor: 'default' }} />
                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', padding: '1px 5px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontWeight: 600, pointerEvents: 'none' }}>Auto</span>
            </div>
        )
    }

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
        const sourceVal = getSourceValue(field.linkedField)
        let taxAmount = 0
        if (linkedTax && sourceVal > 0) {
            if (linkedTax.type === 'percentage') {
                taxAmount = sourceVal * linkedTax.rate / 100
            } else if (linkedTax.type === 'multiplier') {
                taxAmount = sourceVal * linkedTax.rate
            } else {
                taxAmount = linkedTax.rate
            }
        }
        const display = taxAmount > 0 ? taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
        const badge = linkedTax ? (linkedTax.type === 'percentage' ? `${linkedTax.rate}%` : linkedTax.type === 'multiplier' ? `×${linkedTax.rate}` : 'Fixed') : ''
        const badgeColor = linkedTax?.type === 'percentage' ? '#92400e' : linkedTax?.type === 'multiplier' ? '#065f46' : '#3730a3'
        const badgeBg = linkedTax?.type === 'percentage' ? '#fef3c7' : linkedTax?.type === 'multiplier' ? '#d1fae5' : '#e0e7ff'
        return (
            <div style={{ position: 'relative' }}>
                <input readOnly value={display} style={{ ...base, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontWeight: 700, fontSize: '14px', cursor: 'default' }} />
                {linkedTax && <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', padding: '1px 5px', borderRadius: '6px', background: badgeBg, color: badgeColor, fontWeight: 600, pointerEvents: 'none' }}>{badge}</span>}
            </div>
        )
    }
    if (field.type === 'sum') {
        const linkedFieldLabels = field.linkedFields || []
        let sum = 0
        const parts = []
        linkedFieldLabels.forEach(label => {
            const val = getSourceValue(label)
            sum += val
            if (val !== 0) parts.push({ label, val })
        })
        const display = sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const title = parts.map(p => `${p.label}: ${p.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join('\n')
        return (
            <div style={{ position: 'relative' }} title={title}>
                <input readOnly value={display} style={{ ...base, background: '#f5f3ff', border: '1px solid #c4b5fd', color: '#6d28d9', fontWeight: 700, fontSize: '14px', cursor: 'default' }} />
                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', padding: '1px 5px', borderRadius: '6px', background: '#ede9fe', color: '#6d28d9', fontWeight: 600, pointerEvents: 'none' }}>Sum</span>
            </div>
        )
    }
    
    if (field.type === 'formula') {
        const formulaFieldsArr = field.formulaFields || []
        let result = null  // Start with null to detect first field
        const parts = []
        
        formulaFieldsArr.forEach((formulaField, idx) => {
            const val = getSourceValue(formulaField.field)
            parts.push({ label: formulaField.field, val, operation: formulaField.operation })
            
            if (result === null) {
                // First field: initialize result
                result = val
            } else {
                // Subsequent fields: apply their operation
                const op = formulaField.operation || 'add'  // Default to add if not specified
                switch (op) {
                    case 'add':
                        result = result + val
                        break
                    case 'subtract':
                        result = result - val
                        break
                    case 'multiply':
                        result = result * val
                        break
                    case 'divide':
                        result = val !== 0 ? result / val : 0
                        break
                    default:
                        result = result + val
                        break
                }
            }
        })
        
        if (result === null) result = 0  // Handle empty formula
        
        const display = result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const opSymbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' }
        const title = parts.map((p, i) => 
            i === 0 
                ? `Start: ${p.label} = ${p.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${opSymbols[p.operation || 'add']} ${p.label} = ${p.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ).join('\n') + `\n= ${display}`
        
        return (
            <div style={{ position: 'relative' }} title={title}>
                <input readOnly value={display} style={{ ...base, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontWeight: 700, fontSize: '14px', cursor: 'default' }} />
                <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', padding: '1px 5px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', fontWeight: 600, pointerEvents: 'none' }}>Formula</span>
            </div>
        )
    }
    return <input type={field.type === 'number' ? 'text' : field.type === 'date' ? 'date' : 'text'} value={field.type === 'number' ? (value !== undefined && value !== null && value !== '' ? formatNumInput(value) : '') : (value ?? '')} onChange={e => { if (field.type === 'number') { const raw = e.target.value.replace(/[^0-9.\-]/g, ''); onChange(raw) } else { onChange(e.target.value) } }} required={field.isRequired} disabled={disabled} placeholder={disabled ? 'Locked' : `Enter ${field.label.toLowerCase()}`} style={base} onFocus={!disabled ? focus : undefined} onBlur={!disabled ? blur : undefined} readOnly={disabled} />
}

const VehicleAccountPage = ({ params }) => {
    const { id } = use(params)
    const searchParams = useSearchParams()
    const router = useRouter()

    // Prev / next navigation from list query param
    const listParam = searchParams.get('list')
    const listIds = listParam ? decodeURIComponent(listParam).split(',').filter(Boolean) : []
    const currentIdx = listIds.indexOf(id)
    const prevId = currentIdx > 0 ? listIds[currentIdx - 1] : null
    const nextId = currentIdx >= 0 && currentIdx < listIds.length - 1 ? listIds[currentIdx + 1] : null
    const navTo = (targetId) => {
        router.push(`/admin/vehicles/accounts/${targetId}?list=${encodeURIComponent(listIds.join(','))}`)
    }
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
    const [viewer, setViewer]               = useState({ role: '', permissions: [], viewOnly: false })

    useEffect(() => {
        fetch('/api/public/me').then(r => r.json()).then(d => {
            if (d.user) setViewer(d.user)
        }).catch(() => {})
    }, [])

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

    // Fields to disable when allocation is khitai
    const KAITAI_DISABLED_LABELS = ['utc commission', 'maintenance expense', 'kensa', 'inspection', 'shipment freight', 'loading', 'vanning', 'conversion rate', 'vehicle duty', 'vehicle custom', 'costing price', 'final price']
    const isKhitai = vehicle?.allocation === 'khitai'
    const isFieldDisabled = (field) => {
        if (!isKhitai) return false
        const label = (field.label || '').toLowerCase().trim()
        return KAITAI_DISABLED_LABELS.some(dl => label.includes(dl))
    }

    // #36 — view-only users and non-admins: hide internal cost / purchase fields
    // and lock all editing so the page is effectively read-only.
    const isAdmin = String(viewer.role || '').toLowerCase() === 'admin'
    const viewOnly = !!viewer.viewOnly
    const HIDDEN_COST_LABELS = ['pp', 'push price', 'auction fee', 'recycle', 'zekin', 'rikuso expense', 'rikuso tax', 'utc commiss', 'fob price', 'total price', 'total amount', 'conversion rate', 'vehicle duty', 'custom clearance', 'costing', 'price in million', 'final price']
    const isHiddenCostField = (field) => {
        const label = (field.label || '').toLowerCase().trim()
        return HIDDEN_COST_LABELS.some(h => label.includes(h))
    }
    const isEditableField = (field) => !viewOnly && (isAdmin || !isHiddenCostField(field)) && !isFieldDisabled(field)

    // Thousand separator formatter for number inputs
    const formatWithCommas = (value) => {
        if (value === null || value === undefined || value === '') return ''
        const num = parseFloat(String(value).replace(/[^0-9.\-]/g, ''))
        if (isNaN(num)) return String(value)
        const parts = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).split('.')
        return parts[0] + (parts[1] ? '.' + parts[1] : '')
    }

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
                    const kept = existing.filter((_, i) => !deleted.has(i))
                    // Save under all possible keys to ensure old entries are overwritten
                    const labelNoDot = field.label.replace(/\./g, '')
                    const labelNoSpace = field.label.replace(/\s+/g, '_')
                    payload[field._id] = kept
                    payload[field.label] = kept
                    if (labelNoDot !== field.label) payload[labelNoDot] = kept
                    if (labelNoSpace !== field.label && labelNoSpace !== labelNoDot) payload[labelNoSpace] = kept
                } else {
                    // No images found via helper — force-clear all possible keys
                    const labelNoDot = field.label?.replace(/\./g, '') || ''
                    const labelNoSpace = field.label?.replace(/\s+/g, '_') || ''
                    if (field._id) payload[field._id] = []
                    if (field.label) payload[field.label] = []
                    if (labelNoDot && labelNoDot !== field.label) payload[labelNoDot] = []
                    if (labelNoSpace && labelNoSpace !== field.label && labelNoSpace !== labelNoDot) payload[labelNoSpace] = []
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
        } catch (err) { setSaveMsg({ type: 'error', text: err.message }) }        finally { setSaving(false) }
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
    // Breadcrumb: include stock/auction number, group, venue, maker, model as shown in allocation form
    const lotField = vehicleFields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal = lotField ? (formData[lotField._id] ?? vehicle[lotField._id] ?? vehicle[lotField.label]) : null
    const crumbs = []
    if (vehicle.stockId) crumbs.push(`#${vehicle.stockId}`)
    if (lotVal) crumbs.push(String(lotVal))
    crumbs.push(...[vehicle.auctionGroup, vehicle.auctionVenue, vehicle.manufacturer, vehicle.model].filter(Boolean))
    // Add export country and rikuso company to breadcrumbs
    if (vehicle.exportCountry) crumbs.push(vehicle.exportCountry)
    if (vehicle.rikusoCompanyName) crumbs.push(`Rikuso: ${vehicle.rikusoCompanyName}`)
    const textFields   = vehicleFields.filter(f => f.type !== 'file' && f.type !== 'image' && f.label?.toLowerCase().trim() !== 'description')
    const imageFields  = vehicleFields.filter(f => f.type === 'file' || f.type === 'image')
    const allFields    = [...vehicleFields, ...accountFields]

    // Compact vehicle detail rows for the left panel table
    const detailRows = textFields.map(f => {
        const raw = formData[f._id] ?? vehicle[f._id] ?? vehicle[f.label]
        let display = raw !== undefined && raw !== null && raw !== '' ? String(raw) : '—'
        if (f.type === 'date' && raw) display = new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        return { label: f.label, value: display, fieldId: f._id, field: f }
    })

    return (
        <div style={{ padding: '16px', minHeight: '100vh', background: '#f6f8fc' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Page header: breadcrumbs + title */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    {/* Breadcrumbs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
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

                    {/* Prev / Next navigation */}
                    {listIds.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                                {currentIdx + 1} / {listIds.length}
                            </span>
                            <button
                                onClick={() => prevId && navTo(prevId)}
                                disabled={!prevId}
                                title="Previous record"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                    border: '1px solid #e2e8f0', background: prevId ? '#fff' : '#f8fafc',
                                    color: prevId ? '#1a73e8' : '#cbd5e1', cursor: prevId ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.14s',
                                }}>
                                <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                Prev
                            </button>
                            <button
                                onClick={() => nextId && navTo(nextId)}
                                disabled={!nextId}
                                title="Next record"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                    border: '1px solid #e2e8f0', background: nextId ? '#fff' : '#f8fafc',
                                    color: nextId ? '#1a73e8' : '#cbd5e1', cursor: nextId ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.14s',
                                }}>
                                Next
                                <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#202124', margin: 0 }}>{nameLine || 'Vehicle Account'}</h1>
                {subtitle && <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '3px 0 0' }}>{subtitle}</p>}
            </div>

            <form onSubmit={handleSave}>
                {/* ── Two-column card ── */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '280px 1fr' }}>

                    {/* ── LEFT: photo + vehicle details table ── */}
                    <div style={{ borderRight: '1px solid #e8eaed', display: 'flex', flexDirection: 'column' }}>
                        {/* Photo carousel */}
                        <div style={{ position: 'relative', height: '200px', background: '#0f172a', flexShrink: 0 }}>
                            {imgs.length > 0
                                ? <img src={imgs[imgIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', flexDirection: 'column', gap: '8px' }}>
                                    <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span style={{ fontSize: '11px' }}>No Image</span>
                                  </div>
                            }
                            {imgs.length > 1 && (
                                <>
                                    <button type="button" onClick={() => setImgIdx((imgIdx - 1 + imgs.length) % imgs.length)}
                                        style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                                    <button type="button" onClick={() => setImgIdx((imgIdx + 1) % imgs.length)}
                                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '9px', fontWeight: 600, padding: '2px 7px', borderRadius: '20px' }}>{imgIdx + 1}/{imgs.length}</div>
                                </>
                            )}
                        </div>

                        {/* Chassis number highlight + allocation badge */}
                        {(() => {
                            const chField = vehicleFields.find(f => f.label?.toLowerCase().includes('chassis'))
                            const chVal = chField ? (formData[chField._id] || vehicle[chField._id] || vehicle[chField.label]) : null
                            const allocLabel = vehicle.allocation === 'export' ? 'EXPORT' : vehicle.allocation === 'khitai' ? 'KAITAI' : vehicle.allocation === 'resale-to-auction' ? 'RESALE' : ''
                            return (
                                <div style={{ padding: '10px 14px', background: '#1e293b', borderBottom: '1px solid #0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                                        {chVal ? `CHASSIS NO. ${chVal}` : 'CHASSIS NO. —'}
                                    </p>
                                    {allocLabel && (
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: vehicle.allocation === 'export' ? '#22c55e' : vehicle.allocation === 'khitai' ? '#f59e0b' : '#a78bfa', background: vehicle.allocation === 'export' ? 'rgba(34,197,94,0.15)' : vehicle.allocation === 'khitai' ? 'rgba(245,158,11,0.15)' : 'rgba(167,139,250,0.15)', padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.06em' }}>
                                            {allocLabel}
                                        </span>
                                    )}
                                </div>
                            )
                        })()}

                        {/* Vehicle details table — read-only */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {detailRows.filter(r => !r.field.label?.toLowerCase().includes('chassis')).map(({ label, value, fieldId }) => (
                                        <tr key={fieldId} style={{ borderBottom: '1px solid #f0f4f8' }}>
                                            <td style={{ padding: '6px 14px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', width: '45%' }}>{label}</td>
                                            <td style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{value}</td>
                                        </tr>
                                    ))}
                                    {/* Allocation + Rikuso */}
                                    {vehicle.allocation && (
                                        <tr style={{ borderBottom: '1px solid #f0f4f8' }}>
                                            <td style={{ padding: '6px 14px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Allocation</td>
                                            <td style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: vehicle.allocation === 'export' ? '#16a34a' : vehicle.allocation === 'khitai' ? '#d97706' : '#7c3aed' }}>
                                                {vehicle.allocation === 'export' ? 'EXPORT' : vehicle.allocation === 'khitai' ? 'KAITAI' : 'RESALE'}
                                                {vehicle.exportCountry && <span style={{ color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>/ {vehicle.exportCountry}</span>}
                                            </td>
                                        </tr>
                                    )}
                                    {/* Rikuso company name */}
                                    {vehicle.rikusoCompanyName && (
                                        <tr style={{ borderBottom: '1px solid #f0f4f8' }}>
                                            <td style={{ padding: '6px 14px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rikuso</td>
                                            <td style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{vehicle.rikusoCompanyName}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Image fields (editable) – tucked at bottom of left panel */}
                        {imageFields.length > 0 && (
                            <div style={{ padding: '12px 14px', borderTop: '2px solid #f1f3f4' }}>
                                <p style={{ fontSize: '10px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Files &amp; Images</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {imageFields.map(field => {
                                        const existing  = getExistingImagesForField(vehicle, field)
                                        const keptCount = existing.length - (deletedImages[field._id]?.size || 0)
                                        return (
                                            <div key={field._id}>
                                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}</label>
                                                {existing.length > 0 && (
                                                    <div style={{ marginBottom: '6px' }}>
                                                        <p style={{ fontSize: '9px', color: '#9aa0a6', marginBottom: '5px', fontWeight: 600 }}>{keptCount}/{existing.length} kept{(deletedImages[field._id]?.size || 0) > 0 && <span style={{ color: '#ef4444', marginLeft: '5px' }}>· {deletedImages[field._id].size} to remove</span>} · ★ cover · × remove</p>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                            {existing.map((f, idx) => {
                                                                const deleted = !!(deletedImages[field._id]?.has(idx))
                                                                const isMain  = mainImageUrl === f.path
                                                                return (
                                                                    <div key={idx} style={{ position: 'relative', width: '52px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${isMain ? '#f59e0b' : deleted ? '#ef4444' : '#e5e7eb'}`, opacity: deleted ? 0.35 : 1, flexShrink: 0 }}>
                                                                        <img src={f.path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                                        {!deleted && <button type="button" disabled={viewOnly} onClick={() => setMainImageUrl(isMain ? '' : f.path)} style={{ position: 'absolute', top: '1px', left: '1px', width: '14px', height: '14px', borderRadius: '50%', background: isMain ? '#f59e0b' : 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '8px', cursor: viewOnly ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: viewOnly ? 0.5 : 1 }}>★</button>}
                                                                        <button type="button" disabled={viewOnly} onClick={() => toggleDeleteImage(field._id, idx)} style={{ position: 'absolute', top: '1px', right: '1px', width: '14px', height: '14px', borderRadius: '50%', background: deleted ? '#16a34a' : '#ef4444', border: 'none', color: '#fff', fontSize: '9px', cursor: viewOnly ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, opacity: viewOnly ? 0.5 : 1 }}>{deleted ? '↺' : '×'}</button>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                <input type="file" multiple accept={field.type === 'image' ? 'image/*' : '*'} disabled={viewOnly} onChange={async e => {
                                                    const compressed = await Promise.all(Array.from(e.target.files).map(f => compressImage(f)))
                                                    setNewImages(prev => ({ ...prev, [field._id]: compressed }))
                                                }} style={{ width: '100%', padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box', cursor: viewOnly ? 'not-allowed' : 'pointer' }} />
                                                {newImages[field._id]?.length > 0 && <p style={{ fontSize: '10px', color: '#1a73e8', marginTop: '3px', fontWeight: 600 }}>{newImages[field._id].length} new file{newImages[field._id].length > 1 ? 's' : ''} selected</p>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: account details ── */}
                    <div style={{ padding: '24px 28px', overflowY: 'auto' }}>

                        {/* Account Details header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f3f4' }}>
                            <div>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: '#e8f0fe' }}>
                                        <svg style={{ width: '14px', height: '14px', color: '#1a73e8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                    Account Details
                                </h3>
                                <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '3px 0 0' }}>
                                    {accountFields.length} field{accountFields.length !== 1 ? 's' : ''} · save when done
                                </p>
                            </div>
                        </div>

                        {/* Status progress bar */}
                        {accountFields.length > 0 && (() => {
                            const nonImageFields = accountFields.filter(f => f.type !== 'file' && f.type !== 'image')
                            const filled = nonImageFields.filter(f => {
                                const val = accountData[f._id]
                                return val !== undefined && val !== null && val !== ''
                            }).length
                            const total = nonImageFields.length
                            const pct = total > 0 ? Math.round((filled / total) * 100) : 0
                            const barColor = pct >= 100 ? '#16a34a' : pct >= 50 ? '#d97706' : '#1a73e8'
                            const statusLabel = total === 0 ? 'No fields' : pct >= 100 ? 'UPDATED' : 'PENDING'
                            return (
                                <div style={{ marginBottom: '20px', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Account Status
                                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '12px', background: pct >= 100 ? '#ecfdf5' : '#fef3c7', color: pct >= 100 ? '#16a34a' : '#d97706', border: `1px solid ${pct >= 100 ? '#bbf7d0' : '#fde68a'}` }}>{statusLabel}</span>
                                        </span>
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: barColor }}>{filled}/{total} · {pct}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', borderRadius: '10px', background: '#e2e8f0', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: '10px', background: barColor, transition: 'width 0.3s ease' }} />
                                    </div>
                                </div>
                            )
                        })()}

                        {/* Account fields — 4-column grid */}
                        {accountFields.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 16px', background: '#f8f9fa', borderRadius: '10px', border: '2px dashed #e0e0e0' }}>
                                <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '0 0 8px' }}>No account fields yet</p>
                                <Link href="/admin/fields" style={{ fontSize: '12px', color: '#1a73e8', fontWeight: 600, textDecoration: 'none' }}>Go to Dynamic Fields →</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 16px' }}>
                                {accountFields
                                    .filter(f => f.type !== 'file' && f.type !== 'image')
                                    .filter(f => isAdmin || !isHiddenCostField(f))
                                    .map(field => {
                                    const khitaiLocked = isFieldDisabled(field)
                                    const disabled = !isEditableField(field)
                                    return (
                                    <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2', opacity: disabled ? 0.5 : 1 } : { opacity: disabled ? 0.5 : 1 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 700, color: disabled ? '#d1d5db' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                                            {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                            {khitaiLocked && <span style={{ fontSize: '8px', color: '#f59e0b', background: '#fef3c7', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>KAITAI LOCKED</span>}
                                            {viewOnly && <span style={{ fontSize: '8px', color: '#6b7280', background: '#f3f4f6', padding: '1px 4px', borderRadius: '4px', fontWeight: 700 }}>READ ONLY</span>}
                                        </label>
                                        <FieldInput
                                            field={field}
                                            value={accountData[field._id]}
                                            onChange={v => !disabled && setAccountData(p => ({ ...p, [field._id]: v }))}
                                            taxes={taxes}
                                            vehicleData={formData}
                                            accountData={accountData}
                                            vehicleFields={vehicleFields}
                                            accountFields={accountFields}
                                            allFields={allFields}
                                            vehicle={vehicle}
                                            disabled={disabled}
                                        />
                                    </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Save message */}
                        {saveMsg && (
                            <div style={{ margin: '20px 0 0', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: saveMsg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: saveMsg.type === 'success' ? '#137333' : '#c5221f', border: `1px solid ${saveMsg.type === 'success' ? '#b7dfbe' : '#f5c6c2'}` }}>
                                {saveMsg.type === 'success'
                                    ? <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    : <svg style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
                                {saveMsg.text}
                            </div>
                        )}

                        {/* Cancel + Save buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', marginTop: '20px', borderTop: '1px solid #f1f3f4' }}>
                            <Link href="/admin/vehicles/accounts"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 22px', fontSize: '13px', fontWeight: 500, color: '#5f6368', border: '1px solid #e0e0e0', borderRadius: '24px', background: '#fff', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.background='#f1f3f4'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                                Cancel
                            </Link>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {nextId && (
                                    <button type="button" disabled={saving || viewOnly}
                                        onClick={async (e) => {
                                            // Submit the form first, then navigate to next
                                            const form = e.currentTarget.closest('form')
                                            if (form) {
                                                const fakeEvent = { preventDefault: () => {} }
                                                await handleSave(fakeEvent)
                                            }
                                            navTo(nextId)
                                        }}
                                        style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, color: '#1a73e8', background: '#e8f0fe', border: '1px solid #d2e3fc', borderRadius: '24px', cursor: (saving || viewOnly) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: (saving || viewOnly) ? 0.5 : 1 }}>
                                        Save &amp; Next
                                        <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                )}
                                <button type="submit" disabled={saving || viewOnly}
                                    style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600, color: '#fff', background: (saving || viewOnly) ? '#9aa0a6' : '#1a73e8', border: 'none', borderRadius: '24px', cursor: (saving || viewOnly) ? 'not-allowed' : 'pointer', boxShadow: (saving || viewOnly) ? 'none' : '0 2px 8px rgba(26,115,232,0.3)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {saving && <svg style={{ width: '14px', height: '14px', animation: 'spin 0.8s linear infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v8H4z" /></svg>}
                                    {saving ? 'Saving...' : viewOnly ? 'Read Only' : 'Save Account Details →'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default VehicleAccountPage
