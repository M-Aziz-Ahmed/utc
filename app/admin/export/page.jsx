'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    const [filterCountry, setFilterCountry] = useState('')
    const [showCertModal, setShowCertModal] = useState(false)
    const [certVehicle, setCertVehicle] = useState(null)
    const [certForm, setCertForm] = useState({ exportCertNumber: '', exportCertExpiry: '' })

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

    const countries = [...new Set(vehicles.map(v => v.exportCountry).filter(Boolean))].sort((a, b) => a.localeCompare(b))
    const filtered = vehicles.filter(v => {
        if (search && !JSON.stringify(v).toLowerCase().includes(search.toLowerCase())) return false
        if (filterCountry && v.exportCountry !== filterCountry) return false
        return true
    })

    const openCertModal = (v) => {
        setCertVehicle(v)
        setCertForm({ exportCertNumber: v.exportCertNumber || '', exportCertExpiry: v.exportCertExpiry ? String(v.exportCertExpiry).split('T')[0] : '' })
        setShowCertModal(true)
    }

    const saveCert = async () => {
        if (!certVehicle) return
        const res = await fetch('/api/vehicles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId: certVehicle._id, ...certForm }) })
        if (res.ok) {
            setVehicles(p => p.map(v => v._id === certVehicle._id ? { ...v, ...certForm } : v))
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
        <div style={{ padding: '20px 24px', minHeight: '100vh', background: '#f6f8fc' }}>
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

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
                    <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#9aa0a6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', paddingLeft: '30px', padding: '7px 10px 7px 30px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
                </div>
                <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                    style={{ padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', background: '#fff', color: filterCountry ? '#202124' : '#9aa0a6' }}>
                    <option value="">All countries</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: 0 }}>{search || filterCountry ? 'No vehicles match your filters' : 'No export vehicles yet. Allocate vehicles to export from Vehicle Allocation page.'}</p>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f4f8', background: '#f8fafc' }}>
                                <th style={{ padding: '8px 10px', width: '48px' }}></th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vehicle</th>
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
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{[v.manufacturer, v.model].filter(Boolean).join(' ') || '—'}</div>
                                            {v.modelDescription && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{v.modelDescription}</div>}
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
                                            <div style={{ display: 'flex', gap: '4px' }}>
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
