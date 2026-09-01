'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VehicleFilterBar, applyVehicleFilters, EMPTY_FILTERS } from '@/components/VehicleFilters'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const getMainImage = (vehicle) => {
    if (vehicle.mainImageUrl) return vehicle.mainImageUrl
    for (const val of Object.values(vehicle)) {
        if (Array.isArray(val) && val[0]?.path && val[0]?.type?.startsWith('image/'))
            return val[0].path
    }
    return null
}

const getCookie = (n) => {
    if (typeof document === 'undefined') return null
    const m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'))
    return m ? decodeURIComponent(m[1]) : null
}
const setCookie = (n, v) => {
    document.cookie = `${n}=${encodeURIComponent(v)};max-age=${365*86400};path=/`
}

// ── Vehicle card for accounts list ───────────────────────────────────────────
const AccountVehicleCard = ({ vehicle, fields, accountFields, onClick }) => {
    const [hov, setHov] = useState(false)
    const img = getMainImage(vehicle)
    const nameLine = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const subtitle = vehicle.modelDescription || vehicle.variant || ''
    const headerLine = [vehicle.stockId ? `#${vehicle.stockId}` : '', vehicle.auctionGroup, vehicle.auctionVenue].filter(Boolean).join(' / ')

    const chassisField = fields.find(f => f.label?.toLowerCase().includes('chassis'))
    const chassisVal   = chassisField ? (vehicle[chassisField._id] || vehicle[chassisField.label]) : ''

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
                {chassisVal && (
                    <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#2563eb', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.02em' }}>
                        Chassis No: {chassisVal}
                    </p>
                )}
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

// ── Vehicle row for list view ────────────────────────────────────────────────
const AccountVehicleRow = ({ vehicle, fields, accountFields, onClick }) => {
    const img = getMainImage(vehicle)
    const nameLine = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const subtitle = vehicle.modelDescription || vehicle.variant || ''
    const headerLine = [vehicle.stockId ? `#${vehicle.stockId}` : '', vehicle.auctionGroup, vehicle.auctionVenue].filter(Boolean).join(' / ')

    const chassisField = fields.find(f => f.label?.toLowerCase().includes('chassis'))
    const chassisVal   = chassisField ? (vehicle[chassisField._id] || vehicle[chassisField.label]) : ''

    const filled = accountFields.filter(f => {
        const v = vehicle[f._id] ?? vehicle[f.label]
        return v !== undefined && v !== null && v !== ''
    }).length
    const total = accountFields.length
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0

    return (
        <tr
            onClick={onClick}
            style={{ cursor: 'pointer', borderBottom: '1px solid #f0f4f8', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
        >
            {/* Thumb */}
            <td style={{ padding: '5px 8px', width: '48px' }}>
                <div style={{ width: '42px', height: '32px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                    {img
                        ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f1f5f9' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '9px' }}>—</div>
                    }
                </div>
            </td>
            {/* Group / Venue */}
            <td style={{ padding: '5px 8px', minWidth: '100px', maxWidth: '130px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{headerLine || '—'}</div>
            </td>
            {/* Name */}
            <td style={{ padding: '5px 8px', minWidth: '120px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }} className="uppercase">{nameLine || '—'}</div>
                {subtitle && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{subtitle}</div>}
            </td>
            {/* Chassis No */}
            <td style={{ padding: '5px 8px', minWidth: '120px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{chassisVal || '—'}</div>
            </td>
            {/* Account completion */}
            <td style={{ padding: '5px 8px', minWidth: '120px' }}>
                {total > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '5px', background: '#e8eaed', borderRadius: '99px', overflow: 'hidden', minWidth: '50px' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#34a853' : '#1a73e8', borderRadius: '99px', transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: pct === 100 ? '#137333' : pct > 0 ? '#1a73e8' : '#9aa0a6', whiteSpace: 'nowrap' }}>
                            {filled}/{total}
                        </span>
                    </div>
                ) : (
                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>No fields</span>
                )}
            </td>
            {/* Date */}
            <td style={{ padding: '5px 8px', width: '80px', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{fmtDate(vehicle.createdAt)}</div>
            </td>
            {/* Action */}
            <td style={{ padding: '5px 8px', width: '60px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Open →
                </span>
            </td>
        </tr>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const AccountsPage = () => {
    const router = useRouter()
    const [vehicles, setVehicles] = useState([])
    const [fields, setFields] = useState([])
    const [accountFields, setAccountFields] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState(EMPTY_FILTERS)
    const [viewMode, setViewMode] = useState('grid')
    const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'updated' | 'pending'
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 25

    useEffect(() => {
        const saved = getCookie('accounts_view')
        if (saved === 'list' || saved === 'grid') {
            const run = async () => { setViewMode(saved) }
            run()
        }
    }, [])

    const switchView = (mode) => {
        setViewMode(mode)
        setCookie('accounts_view', mode)
    }

    useEffect(() => {
        Promise.all([
            fetch('/api/vehicles').then(r => r.json()),
            fetch('/api/fields').then(r => r.json()),
            fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'accounts' }) }).then(r => r.json()),
        ]).then(([v, all, af]) => {
            setVehicles(Array.isArray(v) ? v : [])
            setFields(Array.isArray(all) ? all : [])
            setAccountFields(Array.isArray(af) ? af : [])
        }).catch(console.error)
        .finally(() => setLoading(false))
    }, [])

    const filteredAll = applyVehicleFilters(vehicles, fields, search, filters)

    // Updated = all account fields filled; Pending = some/most account fields still empty
    const isUpdated = (v) => {
        const filled = accountFields.filter(f => {
            const val = v[f._id] ?? v[f.label]
            return val !== undefined && val !== null && val !== ''
        }).length
        return accountFields.length > 0 && filled === accountFields.length
    }

    const filtered = statusFilter === 'upd' ? filteredAll.filter(isUpdated)
        : statusFilter === 'pend' ? filteredAll.filter(v => !isUpdated(v))
        : filteredAll

    React.useEffect(() => {
        const run = async () => { setPage(1) }
        run()
    }, [search, filters, viewMode, statusFilter])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <div style={{ padding: '16px', minHeight: '100vh', background: '#f6f8fc' }}>
            {/* Header */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#202124', margin: 0 }}>Vehicle Accounts</h1>
                    <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '4px 0 0' }}>
                        {loading ? '…' : `${filtered.length} vehicles · click to manage account details`}
                    </p>
                </div>
                {/* View toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '2px', padding: '2px', background: '#f1f3f4', borderRadius: '8px' }}>
                        <button onClick={() => switchView('grid')} title="Grid view"
                            style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                                background: viewMode === 'grid' ? '#fff' : 'transparent',
                                color: viewMode === 'grid' ? '#1a73e8' : '#5f6368',
                                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                            }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                            </svg>
                        </button>
                        <button onClick={() => switchView('list')} title="List view"
                            style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                                background: viewMode === 'list' ? '#fff' : 'transparent',
                                color: viewMode === 'list' ? '#1a73e8' : '#5f6368',
                                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                            }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>


            {/* Status filter: ALL / UPDATED / PENDING */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: 'ALL' },
                    { key: 'upd', label: 'UPDATED' },
                    { key: 'pend', label: 'PENDING' },
                ].map(tab => {
                    const count = tab.key === 'all' ? filteredAll.length
                        : tab.key === 'upd' ? filteredAll.filter(isUpdated).length
                        : filteredAll.filter(v => !isUpdated(v)).length
                    const active = statusFilter === tab.key
                    return (
                        <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: active ? '1.5px solid #1a73e8' : '1px solid #e2e8f0', background: active ? '#e8f0fe' : '#fff', color: active ? '#1a73e8' : '#5f6368', transition: 'all 0.15s' }}>
                            {tab.label}
                            <span style={{ fontSize: '10px', fontWeight: 700, background: active ? '#1a73e8' : '#e8eaed', color: active ? '#fff' : '#64748b', borderRadius: '99px', padding: '1px 7px' }}>{count}</span>
                        </button>
                    )
                })}
            </div>

            {/* Search + Filters */}
            <VehicleFilterBar
                vehicles={vehicles}
                fields={fields}
                search={search}
                onSearchChange={setSearch}
                filters={filters}
                onFiltersChange={setFilters}
                searchPlaceholder="Search vehicles..."
            />

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed' }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#5f6368', margin: '0 0 8px' }}>
                        {statusFilter !== 'all' ? `No ${statusFilter === 'upd' ? 'updated' : 'pending'} vehicles` : search ? 'No vehicles match your search' : 'No vehicles yet'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    {filtered.map(v => (
                        <AccountVehicleCard
                            key={v._id}
                            vehicle={v}
                            fields={fields}
                            accountFields={accountFields}
                            onClick={() => {
                                const ids = filtered.map(x => x._id).join(',')
                                router.push(`/admin/vehicles/accounts/${v._id}?list=${encodeURIComponent(ids)}`)
                            }}
                        />
                    ))}
                </div>
            ) : (
                <>
                    <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f0f4f8', background: '#f8fafc' }}>
                                    <th style={{ padding: '7px 8px', width: '48px' }}></th>
                                    <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Group / Venue</th>
                                    <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Vehicle</th>
                                    <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Chassis No</th>
                                    <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Account Progress</th>
                                    <th style={{ padding: '7px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Date</th>
                                    <th style={{ padding: '7px 8px', width: '60px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(v => (
                                    <AccountVehicleRow
                                        key={v._id}
                                        vehicle={v}
                                        fields={fields}
                                        accountFields={accountFields}
                                        onClick={() => {
                                            const ids = filtered.map(x => x._id).join(',')
                                            router.push(`/admin/vehicles/accounts/${v._id}?list=${encodeURIComponent(ids)}`)
                                        }}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div style={{ display: 'flex', gap: '3px' }}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', color: page === 1 ? '#cbd5e1' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600 }}
                                >‹ Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                                        acc.push(p)
                                        return acc
                                    }, [])
                                    .map((p, i) => p === '...'
                                        ? <span key={`e${i}`} style={{ padding: '4px 6px', color: '#94a3b8', fontSize: '12px' }}>…</span>
                                        : <button key={p} onClick={() => setPage(p)}
                                            style={{ padding: '4px 9px', borderRadius: '5px', border: '1px solid', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                                borderColor: p === page ? '#1a73e8' : '#e2e8f0',
                                                background: p === page ? '#e8f0fe' : '#fff',
                                                color: p === page ? '#1a73e8' : '#374151' }}
                                          >{p}</button>
                                    )
                                }
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', color: page === totalPages ? '#cbd5e1' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600 }}
                                >Next ›</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default AccountsPage
