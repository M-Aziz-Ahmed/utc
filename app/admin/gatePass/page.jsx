'use client'
import { useState, useEffect } from 'react'

const GatePassPage = () => {
    const [gatePasses, setGatePasses] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [yards, setYards] = useState([])
    const [consignees, setConsignees] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('IGP')
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ vehicle: '', yard: '', consignee: '', containerNumber: '', blNumber: '', remarks: '', date: new Date().toISOString().split('T')[0] })

    const loadData = async () => {
        setLoading(true)
        Promise.all([
            fetch('/api/gatePass').then(r => r.ok ? r.json() : []),
            fetch('/api/vehicles').then(r => r.ok ? r.json() : []),
            fetch('/api/yard').then(r => r.ok ? r.json() : []),
            fetch('/api/consignee').then(r => r.ok ? r.json() : []),
        ]).then(([g, v, y, c]) => {
            setGatePasses(Array.isArray(g) ? g : [])
            setVehicles(Array.isArray(v) ? v : [])
            setYards(Array.isArray(y) ? y : [])
            setConsignees(Array.isArray(c) ? c : [])
        }).finally(() => setLoading(false))
    }

    useEffect(() => { loadData() }, [])

    const openIGPForm = () => {
        setForm({ vehicle: '', yard: '', consignee: '', containerNumber: '', blNumber: '', remarks: '', date: new Date().toISOString().split('T')[0] })
        setShowForm(true)
    }

    const handleCreate = async () => {
        if (!form.vehicle) return alert('Please select a vehicle')
        try {
            const payload = {
                vehicle: form.vehicle,
                type: tab,
                yard: form.yard || undefined,
                consignee: form.consignee || undefined,
                containerNumber: form.containerNumber || undefined,
                blNumber: form.blNumber || undefined,
                remarks: form.remarks || undefined,
                date: form.date || new Date(),
            }
            const res = await fetch('/api/gatePass', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            if (res.ok) {
                const gp = await res.json()
                setGatePasses(p => [gp, ...p])
                if (tab === 'IGP') {
                    setVehicles(p => p.map(v => v._id === form.vehicle ? { ...v, physicalIn: true, physicalInDate: form.date, yard: form.yard } : v))
                } else {
                    setVehicles(p => p.map(v => v._id === form.vehicle ? { ...v, physicalOut: true, physicalOutDate: form.date, containerNumber: form.containerNumber, blNumber: form.blNumber } : v))
                }
                setShowForm(false)
            } else {
                const data = await res.json()
                alert(data.message || 'Failed to create gate pass')
            }
        } catch (e) { alert('Failed to create gate pass') }
    }

    const handleStatusChange = async (gpId, status) => {
        const res = await fetch('/api/gatePass', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gatePassId: gpId, status }) })
        if (res.ok) {
            setGatePasses(p => p.map(g => g._id === gpId ? { ...g, status } : g))
        }
    }

    const filtered = gatePasses.filter(g => {
        if (g.type !== tab) return false
        if (search) {
            const s = search.toLowerCase()
            const vName = g.vehicle ? [g.vehicle.manufacturer, g.vehicle.model].filter(Boolean).join(' ').toLowerCase() : ''
            if (!vName.includes(s) && !(g.gatePassNumber || '').toLowerCase().includes(s) && !(g.containerNumber || '').toLowerCase().includes(s)) return false
        }
        return true
    })

    const igpVehicles = vehicles.filter(v => !v.physicalIn)
    const ogpVehicles = vehicles.filter(v => v.physicalIn && !v.physicalOut)
    const isOgpReady = tab === 'OGP'

    return (
        <div style={{ padding: '16px', minHeight: '100vh', background: '#f6f8fc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: 0 }}>Gate Pass Management</h1>
                    <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>IGP (Inward) & OGP (Outward) Gate Passes</p>
                </div>
                <button onClick={openIGPForm} style={{ padding: '8px 16px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New {tab}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', background: '#f1f3f4', padding: '3px', borderRadius: '10px', width: 'fit-content' }}>
                {['IGP', 'OGP'].map(t => (
                    <button key={t} onClick={() => { setTab(t); setShowForm(false) }}
                        style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                            background: tab === t ? '#fff' : 'transparent', color: tab === t ? (t === 'IGP' ? '#059669' : '#7c3aed') : '#5f6368',
                            boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                        {t === 'IGP' ? 'IGP (Inward)' : 'OGP (Outward)'}
                        <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 500, opacity: 0.7 }}>({gatePasses.filter(g => g.type === t).length})</span>
                    </button>
                ))}
            </div>

            <div style={{ position: 'relative', maxWidth: '280px', marginBottom: '14px' }}>
                <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#9aa0a6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', paddingLeft: '30px', padding: '7px 10px 7px 30px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: 0 }}>No {tab} records yet</p>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f4f8', background: '#f8fafc' }}>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>GP Number</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vehicle</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Yard</th>
                                {tab === 'OGP' && <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Container</th>}
                                {tab === 'OGP' && <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>B/L Number</th>}
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Consignee</th>
                                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(g => {
                                const statusColors = { pending: { color: '#f59e0b', bg: '#fef3c7' }, approved: { color: '#1a73e8', bg: '#e8f0fe' }, completed: { color: '#059669', bg: '#d1fae5' }, cancelled: { color: '#ef4444', bg: '#fee2e2' } }
                                const sc = statusColors[g.status] || statusColors.pending
                                const gpDate = g.date ? new Date(g.date).toLocaleDateString() : '—'
                                return (
                                    <tr key={g._id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                                        <td style={{ padding: '8px 10px' }}><span style={{ fontSize: '11px', fontWeight: 700, color: g.type === 'IGP' ? '#059669' : '#7c3aed' }}>{g.gatePassNumber}</span></td>
                                        <td style={{ padding: '8px 10px' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{g.vehicle ? [g.vehicle.manufacturer, g.vehicle.model].filter(Boolean).join(' ') : '—'}</div>
                                        </td>
                                        <td style={{ padding: '8px 10px', fontSize: '11px', color: '#5f6368' }}>{gpDate}</td>
                                        <td style={{ padding: '8px 10px', fontSize: '11px', color: '#5f6368' }}>{g.yard?.name || '—'}</td>
                                        {tab === 'OGP' && <td style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 600, color: '#374151' }}>{g.containerNumber || '—'}</td>}
                                        {tab === 'OGP' && <td style={{ padding: '8px 10px', fontSize: '11px', fontWeight: 600, color: '#374151' }}>{g.blNumber || '—'}</td>}
                                        <td style={{ padding: '8px 10px', fontSize: '11px', color: '#5f6368' }}>{g.consignee?.name || '—'}</td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <select value={g.status} onChange={e => handleStatusChange(g._id, e.target.value)}
                                                style={{ padding: '3px 8px', borderRadius: '10px', border: 'none', fontSize: '10px', fontWeight: 600, color: sc.color, background: sc.bg, cursor: 'pointer', outline: 'none' }}>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '8px 10px', fontSize: '11px', color: '#9aa0a6', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.remarks || '—'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowForm(false)}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', maxWidth: '520px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: tab === 'IGP' ? '#059669' : '#7c3aed', margin: 0 }}>
                                New {tab === 'IGP' ? 'Inward Gate Pass (IGP)' : 'Outward Gate Pass (OGP)'}
                            </h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', display: 'flex' }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Vehicle *</label>
                                <select value={form.vehicle} onChange={e => setForm(p => ({ ...p, vehicle: e.target.value }))}
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box', color: form.vehicle ? '#202124' : '#9aa0a6' }}>
                                    <option value="">{tab === 'IGP' ? 'Select vehicle to receive...' : 'Select vehicle to ship...'}</option>
                                    {(tab === 'IGP' ? igpVehicles : ogpVehicles).map(v => (
                                        <option key={v._id} value={v._id}>{[v.manufacturer, v.model].filter(Boolean).join(' ')} {v.exportCountry ? `(${v.exportCountry})` : ''}</option>
                                    ))}
                                </select>
                                {tab === 'OGP' && ogpVehicles.length === 0 && <p style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px' }}>No vehicles with IGP. Complete IGP first.</p>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Date</label>
                                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Yard</label>
                                    <select value={form.yard} onChange={e => setForm(p => ({ ...p, yard: e.target.value }))}
                                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box', color: form.yard ? '#202124' : '#9aa0a6' }}>
                                        <option value="">Select yard...</option>
                                        {yards.map(y => <option key={y._id} value={y._id}>{y.name}{y.location ? ` (${y.location})` : ''}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Consignee / Client</label>
                                <select value={form.consignee} onChange={e => setForm(p => ({ ...p, consignee: e.target.value }))}
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box', color: form.consignee ? '#202124' : '#9aa0a6' }}>
                                    <option value="">Select consignee...</option>
                                    {consignees.map(c => <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
                                </select>
                            </div>
                            {isOgpReady && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Container Number *</label>
                                        <input type="text" value={form.containerNumber} onChange={e => setForm(p => ({ ...p, containerNumber: e.target.value }))}
                                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. MSKU1234567" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>B/L Number</label>
                                        <input type="text" value={form.blNumber} onChange={e => setForm(p => ({ ...p, blNumber: e.target.value }))}
                                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. BL-2026-001" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Remarks</label>
                                <textarea value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} rows={2}
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Notes..." />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                                <button onClick={handleCreate} style={{ flex: 1, padding: '8px', background: tab === 'IGP' ? '#059669' : '#7c3aed', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Create {tab}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

export default GatePassPage
