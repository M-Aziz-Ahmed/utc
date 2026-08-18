'use client'
import { useState, useEffect } from 'react'

// Extract chassis number from the vehicle document regardless of which key it was saved under
const getChassisNo = (vehicle) => {
    if (!vehicle) return ''
    const keys = ['chassisNumber', 'Chassis No.', 'Chassis No', 'ChassisNo', 'VIN', 'chassis']
    for (const k of keys) {
        const v = vehicle[k]
        if (v && String(v).trim()) return String(v).trim()
    }
    // Fallback: scan all keys for anything that looks like a chassis field
    for (const [k, v] of Object.entries(vehicle)) {
        if ((k.toLowerCase().includes('chassis') || k.toLowerCase() === 'vin') && v && String(v).trim())
            return String(v).trim()
    }
    return ''
}

const PhotoReviewPage = () => {
    const [gatePasses, setGatePasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(null)
    const [search, setSearch] = useState('')

    const loadData = async () => {
        setLoading(true)
        const res = await fetch('/api/gatePass?type=IGP')
        const data = res.ok ? await res.json() : []
        setGatePasses(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    useEffect(() => { loadData() }, [])

    const reviewImage = async (gpId, path, approve) => {
        setBusy(path)
        try {
            const res = await fetch('/api/gatePass', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gatePassId: gpId, [approve ? 'approveImages' : 'rejectImages']: [path] }),
            })
            if (res.ok) {
                const gp = await res.json()
                setGatePasses(p => p.map(g => g._id === gpId ? gp : g))
            } else {
                let data = {}
                try { data = await res.json() } catch {}
                alert(data.error || data.message || 'Failed to update photo')
            }
        } catch (e) { alert(e.message || 'Failed to update photo') } finally { setBusy(null) }
    }

    const vehicles = []
    for (const g of gatePasses) {
        if (!g.images?.length) continue
        let name = '—'
        let chassis = ''
        if (g.vehicle) {
            name = [g.vehicle.manufacturer, g.vehicle.model].filter(Boolean).join(' ') || '—'
            chassis = getChassisNo(g.vehicle)
        }
        vehicles.push({ g, name, chassis })
    }

    const filtered = search
        ? vehicles.filter(v => [v.name, v.g.gatePassNumber, v.g.containerNumber].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase()))
        : vehicles

    const statusBadge = (img) => {
        if (img?.approved === true) return { label: 'Approved · Published', color: '#059669', bg: '#d1fae5' }
        if (img?.approved === false) return { label: 'Rejected', color: '#ef4444', bg: '#fee2e2' }
        return { label: 'Pending Review', color: '#f59e0b', bg: '#fef3c7' }
    }
    return (
        <div style={{ padding: '16px', minHeight: '100vh', background: '#f6f8fc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: 0 }}>Photo Review Portal</h1>
                    <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>
                        Approve IGP photos individually. Approved photos are published to the website and replace the auction photos.
                    </p>
                </div>
                <button onClick={loadData}
                    style={{ padding: '8px 16px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Refresh
                </button>
            </div>

            <div style={{ position: 'relative', maxWidth: '320px', marginBottom: '14px' }}>
                <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#9aa0a6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search vehicle or gate pass..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', paddingLeft: '30px', padding: '7px 10px 7px 30px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: 0 }}>No IGP photos waiting for review</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtered.map(({ g, name, chassis }) => (
                        <div key={g._id} style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #f0f4f8', flexWrap: 'wrap', gap: '6px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', marginRight: '10px' }}>{g.gatePassNumber}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{name.toUpperCase()}</span>
                                    {chassis && (
                                        <span style={{ marginLeft: '10px', fontSize: '11px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', background: '#0f172a', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                                            {chassis}
                                        </span>
                                    )}
                                </div>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>
                                    {g.images.filter(i => i?.approved === true).length} approved · {g.images.filter(i => i?.approved === false).length} rejected · {g.images.filter(i => i?.approved !== true && i?.approved !== false).length} pending
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '14px' }}>
                                {g.images.map((img, i) => {
                                    const badge = statusBadge(img)
                                    const isBusy = busy === img.path
                                    return (
                                        <div key={i} style={{ width: '160px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                                            <div style={{ position: 'relative', height: '110px', background: '#f1f5f9' }}>
                                                <a href={img.path} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                                                    <img src={img.path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                                </a>
                                                <span style={{ position: 'absolute', top: '4px', left: '4px', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 700, color: badge.color, background: badge.bg }}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', padding: '8px' }}>
                                                <button disabled={isBusy} onClick={() => reviewImage(g._id, img.path, true)}
                                                    style={{ flex: 1, padding: '6px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.6 : 1 }}>
                                                    Approve
                                                </button>
                                                <button disabled={isBusy} onClick={() => reviewImage(g._id, img.path, false)}
                                                    style={{ flex: 1, padding: '6px', background: '#fff', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.6 : 1 }}>
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

export default PhotoReviewPage
