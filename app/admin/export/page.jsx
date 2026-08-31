'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { VehicleFilterBar, applyVehicleFilters, EMPTY_FILTERS } from '@/components/VehicleFilters'

const getVehicleImages = (vehicle) => {
    const all = []
    Object.entries(vehicle).forEach(([key, val]) => {
        if (key === 'files' || key === 'mainImageUrl') return
        if (Array.isArray(val)) {
            val.forEach(item => { if (item?.path && item?.type?.startsWith('image/')) all.push(item.path) })
        }
    })
    if (vehicle.files) vehicle.files.forEach(f => { if (f?.type?.startsWith('image/')) all.push(f.path) })
    const unique = [...new Set(all)]
    if (vehicle.mainImageUrl && unique.includes(vehicle.mainImageUrl))
        return [vehicle.mainImageUrl, ...unique.filter(u => u !== vehicle.mainImageUrl)]
    return unique
}

const ExportCarsPage = () => {
    const [vehicles, setVehicles] = useState([])
    const [fields, setFields] = useState([])
    const [consignees, setConsignees] = useState([])
    const [gatePasses, setGatePasses] = useState([])
    const [yards, setYards] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState(EMPTY_FILTERS)
    const [showCertModal, setShowCertModal] = useState(false)
    const [certVehicle, setCertVehicle] = useState(null)
    const [certForm, setCertForm] = useState({ exportCertNumber: '', exportCertExpiry: '', exportCertImage: null })
    const [certImagePreview, setCertImagePreview] = useState('')

    useEffect(() => {
        Promise.all([
            fetch('/api/vehicles').then(r => r.ok ? r.json() : []),
            fetch('/api/fields').then(r => r.ok ? r.json() : []),
            fetch('/api/consignee').then(r => r.ok ? r.json() : []),
            fetch('/api/gatePass').then(r => r.ok ? r.json() : []),
            fetch('/api/yard').then(r => r.ok ? r.json() : []),
        ]).then(([v, f, c, g, y]) => {
            const vs = Array.isArray(v) ? v : []
            setVehicles(vs.filter(x => x.allocation === 'export'))
            setFields(Array.isArray(f) ? f.filter(fi => fi.belongsto === 'add-vehicles') : [])
            setConsignees(Array.isArray(c) ? c : [])
            setGatePasses(Array.isArray(g) ? g : [])
            setYards(Array.isArray(y) ? y : [])
        }).finally(() => setLoading(false))
    }, [])

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

    const filtered = applyVehicleFilters(vehicles, fields, search, filters)

    const openCertModal = (v) => {
        setCertVehicle(v)
        setCertForm({ exportCertNumber: v.exportCertNumber || '', exportCertExpiry: v.exportCertExpiry ? String(v.exportCertExpiry).split('T')[0] : '' })
        setCertImagePreview(v.exportCertImage || '')
        setShowCertModal(true)
    }

    const saveCert = async () => {
        if (!certVehicle) return
        const payload = { vehicleId: certVehicle._id, exportCertNumber: certForm.exportCertNumber, exportCertExpiry: certForm.exportCertExpiry }

        // Upload cert image if selected
        if (certForm.exportCertImage) {
            const fd = new FormData()
            fd.append('file', certForm.exportCertImage)
            fd.append('upload_preset', 'unsigned')
            try {
                const uploadRes = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', { method: 'POST', body: fd })
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json()
                    payload.exportCertImage = uploadData.secure_url
                }
            } catch {}
        }

        const res = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) {
            setVehicles(p => p.map(v => v._id === certVehicle._id ? { ...v, ...payload } : v))
            setShowCertModal(false)
        }
    }

    const getGatePass = (vehicleId, type) => gatePasses.find(g => g.vehicle?._id === vehicleId && g.type === type)

    const statusCounts = {
        total: vehicles.length,
        withCert: vehicles.filter(v => v.exportCertNumber).length,
        ipped: vehicles.filter(v => v.physicalOut).length,
        inYard: vehicles.filter(v => v.physicalIn && !v.physicalOut).length,
    }

    return (
        <div style={{ padding: '16px', minHeight: '100vh', background: '#f6f8fc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: 0 }}>Export Cars</h1>
                    <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>{vehicles.length} export vehicle{vehicles.length !== 1 ? 's' : ''}</p>
                </div>
                <Link href="/admin/gatePass" style={{ padding: '7px 14px', borderRadius: '20px', background: '#fff', border: '1px solid #e0e0e0', fontSize: '12px', fontWeight: 500, color: '#444746', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    Gate Pass
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                {[
                    { label: 'Total Export', value: statusCounts.total, color: '#1a73e8', bg: '#e8f0fe' },
                    { label: 'In Yard', value: statusCounts.inYard, color: '#f59e0b', bg: '#fef3c7' },
                    { label: 'Cert Ready', value: statusCounts.withCert, color: '#059669', bg: '#d1fae5' },
                    { label: 'Shipped', value: statusCounts.ipped, color: '#7c3aed', bg: '#ede9fe' },
                ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '10px', fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search + Filters */}
            <VehicleFilterBar
                vehicles={vehicles}
                fields={fields}
                search={search}
                onSearchChange={setSearch}
                filters={filters}
                onFiltersChange={setFilters}
                searchPlaceholder="Search..."
                showCountry
                showAllocation={false}
            />

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: 0 }}>{search || filters.country ? 'No vehicles match your filters' : 'No export vehicles yet. Allocate vehicles to export from Vehicle Allocation page.'}</p>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f4f8', background: '#f8fafc' }}>
                                <th style={{ padding: '8px 10px', width: '48px' }}></th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vehicle</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Chassis</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Country</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Consignee</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Export Cert</th>
                                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(v => {
                                const imgs = getVehicleImages(v)
                                const igp = getGatePass(v._id, 'IGP')
                                const ogp = getGatePass(v._id, 'OGP')
                                const consignee = consignees.find(c => c._id === v.consignee)
                                const certExpiry = v.exportCertExpiry ? new Date(v.exportCertExpiry) : null
                                const isExpired = certExpiry && certExpiry < new Date()
                                const isExpiringSoon = certExpiry && !isExpired && (certExpiry - new Date()) < 30 * 86400000

                                let status = 'Pending'
                                let statusColor = '#9aa0a6'
                                let statusBg = '#f1f3f4'
                                if (ogp) { status = 'Shipped'; statusColor = '#7c3aed'; statusBg = '#ede9fe' }
                                else if (igp) { status = 'In Yard'; statusColor = '#f59e0b'; statusBg = '#fef3c7' }

                                return (
                                    <tr key={v._id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                                        <td style={{ padding: '8px 10px' }}>
                                            <div style={{ width: '42px', height: '32px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9' }}>
                                                {imgs.length > 0 ? <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '9px' }}>—</div>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{[v.manufacturer, v.model].filter(Boolean).join(' ') || '—'}</div>
                                                <span style={{ fontSize: '8px', fontWeight: 700, color: '#fff', background: '#16a34a', padding: '2px 6px', borderRadius: '8px', letterSpacing: '0.05em', flexShrink: 0 }}>EXPORT</span>
                                            </div>
                                            {v.modelDescription && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{v.modelDescription}</div>}
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            {(() => {
                                                const chVal = chassisOf(v)
                                                return chVal ? <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{chVal}</span> : <span style={{ fontSize: '10px', color: '#cbd5e1' }}>—</span>
                                            })()}
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            <span style={{ fontSize: '11px', color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '4px' }}>{v.exportCountry || '—'}</span>
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            <span style={{ fontSize: '11px', color: '#374151' }}>{consignee?.name || '—'}</span>
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            {v.exportCertNumber ? (
                                                <div>
                                                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>{v.exportCertNumber}</span>
                                                    {certExpiry && (
                                                        <div style={{ fontSize: '10px', color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#6b7280' }}>
                                                            Exp: {certExpiry.toLocaleDateString()}
                                                            {isExpired ? ' (EXPIRED)' : isExpiringSoon ? ' (Soon)' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : <span style={{ fontSize: '11px', color: '#d1d5db' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 600, color: statusColor, background: statusBg, padding: '3px 8px', borderRadius: '10px' }}>{status}</span>
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                {/* EC Round Button */}
                                                <span title={v.exportCertNumber ? 'Export Certificate Added' : 'No Export Certificate'}
                                                    style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, cursor: 'default', flexShrink: 0,
                                                        background: v.exportCertNumber ? '#1a73e8' : '#e5e7eb', color: v.exportCertNumber ? '#fff' : '#9ca3af' }}>
                                                    EC
                                                </span>
                                                <button onClick={() => openCertModal(v)} style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 600, background: '#f1f3f4', color: '#5f6368', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                    {v.exportCertNumber ? 'Edit Cert' : '+ Cert'}
                                                </button>
                                                <Link href={`/admin/vehicles/edit/${v._id}`} style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 600, background: '#e8f0fe', color: '#1a73e8', border: 'none', borderRadius: '6px', cursor: 'pointer', textDecoration: 'none' }}>View</Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showCertModal && certVehicle && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowCertModal(false)}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', maxWidth: '420px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>Export Certificate</h3>
                            <button onClick={() => setShowCertModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', display: 'flex' }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p style={{ fontSize: '11px', color: '#9aa0a6', margin: '0 0 14px' }}>{[certVehicle.manufacturer, certVehicle.model].filter(Boolean).join(' ')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Certificate Number</label>
                                <input type="text" value={certForm.exportCertNumber} onChange={e => setCertForm(p => ({ ...p, exportCertNumber: e.target.value }))}
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. EC-2026-001" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Expiry Date</label>
                                <input type="date" value={certForm.exportCertExpiry} onChange={e => setCertForm(p => ({ ...p, exportCertExpiry: e.target.value }))}
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Certificate Image</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input type="file" accept="image/*" onChange={e => {
                                        const file = e.target.files[0]
                                        if (file) {
                                            setCertForm(p => ({ ...p, exportCertImage: file }))
                                            setCertImagePreview(URL.createObjectURL(file))
                                        }
                                    }}
                                        style={{ flex: 1, padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box' }} />
                                    {certForm.exportCertImage && (
                                        <button type="button" onClick={() => { setCertForm(p => ({ ...p, exportCertImage: null })); setCertImagePreview('') }}
                                            style={{ padding: '4px 8px', fontSize: '10px', background: '#fce8e6', color: '#c5221f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                                    )}
                                </div>
                                {certImagePreview && (
                                    <div style={{ marginTop: '6px', width: '100px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                        <img src={certImagePreview} alt="Cert" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button onClick={() => setShowCertModal(false)} style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                                <button onClick={saveCert} style={{ flex: 1, padding: '8px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

export default ExportCarsPage
