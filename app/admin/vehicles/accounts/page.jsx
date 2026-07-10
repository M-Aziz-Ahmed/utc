'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const getMainImage = (vehicle) => {
    if (vehicle.mainImageUrl) return vehicle.mainImageUrl
    // scan all keys for image arrays
    for (const val of Object.values(vehicle)) {
        if (Array.isArray(val) && val[0]?.path && val[0]?.type?.startsWith('image/'))
            return val[0].path
    }
    return null
}

// ── Vehicle card for accounts list ───────────────────────────────────────────
const AccountVehicleCard = ({ vehicle, accountFields, onClick }) => {
    const [hov, setHov] = useState(false)
    const img = getMainImage(vehicle)
    const nameLine = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const subtitle = vehicle.modelDescription || vehicle.variant || ''
    const headerLine = [vehicle.auctionGroup, vehicle.auctionVenue].filter(Boolean).join(' / ')

    // How many account fields are already filled
    const filled = accountFields.filter(f => {
        const v = vehicle[f._id] ?? vehicle[f.label]
        return v !== undefined && v !== null && v !== ''
    }).length
    const total = accountFields.length
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: '#fff', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                border: hov ? '1px solid #1a73e8' : '1px solid #e2e8f0',
                boxShadow: hov ? '0 4px 16px rgba(26,115,232,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.18s', display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Header strip */}
            <div style={{ background: hov ? '#45556c' : '#62748e', padding: '6px 12px', transition: 'background 0.18s' }}>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: headerLine ? 1 : 0.5 }}>
                    {headerLine || 'No Group / Venue'}
                </p>
            </div>

            {/* Image */}
            <div style={{ height: '150px', background: '#f1f5f9', flexShrink: 0 }}>
                {img
                    ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#f1f5f9' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '6px' }}>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span style={{ fontSize: '10px' }}>No Image</span>
                    </div>
                }
            </div>

            {/* Title */}
            <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #f0f4f8' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>{nameLine || '—'}</p>
                {subtitle && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b' }}>{subtitle}</p>}
            </div>

            {/* Account completion */}
            <div style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#5f6368' }}>Account Fields</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: pct === 100 ? '#137333' : pct > 0 ? '#1a73e8' : '#9aa0a6' }}>
                        {total === 0 ? 'No fields' : `${filled}/${total} filled`}
                    </span>
                </div>
                {total > 0 && (
                    <div style={{ height: '5px', background: '#e8eaed', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#34a853' : '#1a73e8', borderRadius: '99px', transition: 'width 0.3s' }} />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ padding: '6px 12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{fmtDate(vehicle.createdAt)}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Open →
                </span>
            </div>
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const AccountsPage = () => {
    const router = useRouter()
    const [vehicles, setVehicles] = useState([])
    const [accountFields, setAccountFields] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        Promise.all([
            fetch('/api/vehicles').then(r => r.json()),
            fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'accounts' }) }).then(r => r.json()),
        ]).then(([v, f]) => {
            setVehicles(Array.isArray(v) ? v : [])
            setAccountFields(Array.isArray(f) ? f : [])
        }).catch(console.error)
        .finally(() => setLoading(false))
    }, [])

    const filtered = vehicles.filter(v =>
        !search || JSON.stringify(v).toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ padding: '24px 28px', minHeight: '100vh', background: '#f6f8fc' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#202124', margin: 0 }}>Vehicle Accounts</h1>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '4px 0 0' }}>
                        {loading ? '…' : `${filtered.length} vehicles · click to manage account details`}
                    </p>
                </div>
                {/* Search */}
                <div style={{ position: 'relative', width: '260px' }}>
                    <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9aa0a6', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicles..."
                        style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                        onFocus={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)' }}
                        onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none' }} />
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed' }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#5f6368', margin: '0 0 8px' }}>
                        {search ? 'No vehicles match your search' : 'No vehicles yet'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    {filtered.map(v => (
                        <AccountVehicleCard
                            key={v._id}
                            vehicle={v}
                            accountFields={accountFields}
                            onClick={() => router.push(`/admin/vehicles/accounts/${v._id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default AccountsPage
