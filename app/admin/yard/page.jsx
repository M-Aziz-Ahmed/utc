'use client'
import { useState, useEffect } from 'react'

const YardManagementPage = () => {
    const [yards, setYards] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState({ name: '', location: '', address: '', city: '', country: '', capacity: '', notes: '' })

    useEffect(() => {
        Promise.all([
            fetch('/api/yard').then(r => r.ok ? r.json() : []),
            fetch('/api/vehicles').then(r => r.ok ? r.json() : []),
        ]).then(([y, v]) => {
            setYards(Array.isArray(y) ? y : [])
            setVehicles(Array.isArray(v) ? v : [])
        }).finally(() => setLoading(false))
    }, [])

    const openAdd = () => { setEditing(null); setForm({ name: '', location: '', address: '', city: '', country: '', capacity: '', notes: '' }); setShowForm(true) }
    const openEdit = (yard) => { setEditing(yard); setForm({ name: yard.name || '', location: yard.location || '', address: yard.address || '', city: yard.city || '', country: yard.country || '', capacity: yard.capacity || '', notes: yard.notes || '' }); setShowForm(true) }

    const handleSave = async () => {
        if (!form.name.trim()) return
        try {
            if (editing) {
                const res = await fetch(`/api/yard/${editing._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, capacity: form.capacity ? Number(form.capacity) : undefined }) })
                if (res.ok) { const updated = await res.json(); setYards(p => p.map(y => y._id === updated._id ? updated : y)) }
            } else {
                const res = await fetch('/api/yard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, capacity: form.capacity ? Number(form.capacity) : undefined }) })
                if (res.ok) { const created = await res.json(); setYards(p => [created, ...p]) }
            }
            setShowForm(false)
        } catch (e) { alert('Failed to save yard') }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this yard?')) return
        const res = await fetch(`/api/yard/${id}`, { method: 'DELETE' })
        if (res.ok) setYards(p => p.filter(y => y._id !== id))
    }

    const getYardVehicles = (yardId) => vehicles.filter(v => v.yard === yardId)
    const filtered = yards.filter(y => !search || JSON.stringify(y).toLowerCase().includes(search.toLowerCase()))

    const locations = [...new Set(yards.map(y => y.location || y.city).filter(Boolean))].sort((a, b) => a.localeCompare(b))

    return (
        <div style={{ padding: '20px 24px', minHeight: '100vh', background: '#f6f8fc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: 0 }}>Yard Management</h1>
                    <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>{yards.length} yard{yards.length !== 1 ? 's' : ''} · {locations.length} location{locations.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openAdd} style={{ padding: '8px 16px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Yard
                </button>
            </div>

            <div style={{ position: 'relative', maxWidth: '280px', marginBottom: '14px' }}>
                <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#9aa0a6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search yards..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', paddingLeft: '30px', padding: '7px 10px 7px 30px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : locations.length > 0 ? (
                locations.map(loc => {
                    const locYards = filtered.filter(y => (y.location || y.city) === loc)
                    if (locYards.length === 0) return null
                    return (
                        <div key={loc} style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid #e8f0fe' }}>
                                📍 {loc}
                                <span style={{ fontWeight: 400, color: '#9aa0a6', marginLeft: '8px', fontSize: '11px' }}>({locYards.length})</span>
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                                {locYards.map(yard => (
                                    <YardCard key={yard._id} yard={yard} vehicleCount={getYardVehicles(yard._id).length} vehicles={getYardVehicles(yard._id)} onEdit={() => openEdit(yard)} onDelete={() => handleDelete(yard._id)} />
                                ))}
                            </div>
                        </div>
                    )
                })
            ) : filtered.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                    {filtered.map(yard => (
                        <YardCard key={yard._id} yard={yard} vehicleCount={getYardVehicles(yard._id).length} vehicles={getYardVehicles(yard._id)} onEdit={() => openEdit(yard)} onDelete={() => handleDelete(yard._id)} />
                    ))}
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: 0 }}>No yards yet. Add your first yard to get started.</p>
                </div>
            )}

            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowForm(false)}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', maxWidth: '480px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>{editing ? 'Edit Yard' : 'Add Yard'}</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', display: 'flex' }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Yard Name *</label>
                                <input autoFocus type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Main Yard, Port Yard" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Location</label>
                                    <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Jebel Ali" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>City</label>
                                    <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. Dubai" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Address</label>
                                <input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="Full address" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Country</label>
                                    <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. UAE" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Capacity</label>
                                    <input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="Max vehicles" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Notes</label>
                                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
                                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Additional notes" />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '8px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                                <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{editing ? 'Save Changes' : 'Add Yard'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

const YardCard = ({ yard, vehicleCount, vehicles, onEdit, onDelete }) => {
    const [hov, setHov] = useState(false)
    const capacity = yard.capacity || 0
    const pct = capacity > 0 ? Math.min((vehicleCount / capacity) * 100, 100) : 0
    const barColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#1a73e8'

    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ background: '#fff', borderRadius: '8px', border: hov ? '1px solid #1a73e8' : '1px solid #e0e0e0', boxShadow: hov ? '0 4px 12px rgba(26,115,232,0.1)' : '0 1px 4px rgba(0,0,0,0.06)', padding: '14px', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#202124', margin: 0 }}>{yard.name}</h3>
                    {(yard.location || yard.city) && <p style={{ fontSize: '11px', color: '#5f6368', margin: '2px 0 0' }}>📍 {[yard.location, yard.city].filter(Boolean).join(', ')}</p>}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={onEdit} style={{ padding: '4px 8px', fontSize: '11px', background: '#f1f3f4', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#5f6368', fontWeight: 500 }}>Edit</button>
                    <button onClick={onDelete} style={{ padding: '4px 8px', fontSize: '11px', background: '#fce8e6', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#c5221f', fontWeight: 500 }}>✕</button>
                </div>
            </div>
            {capacity > 0 && (
                <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5f6368', marginBottom: '3px' }}>
                        <span>{vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}</span>
                        <span>{capacity} capacity</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f3f4', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width 0.3s' }} />
                    </div>
                </div>
            )}
            {!capacity && (
                <p style={{ fontSize: '11px', color: '#9aa0a6', margin: '8px 0 0' }}>{vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}</p>
            )}
            {yard.address && <p style={{ fontSize: '10px', color: '#9aa0a6', margin: '6px 0 0' }}>{yard.address}</p>}
        </div>
    )
}

export default YardManagementPage
