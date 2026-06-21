'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// ── helpers ────────────────────────────────────────────────────────────────────
const getVehicleImages = (vehicle) => {
    const imgs = []
    Object.values(vehicle).forEach(val => {
        if (Array.isArray(val)) val.forEach(item => {
            if (item?.path && item?.type?.startsWith('image/')) imgs.push(item.path)
        })
    })
    if (vehicle.files) vehicle.files.forEach(f => {
        if (f?.type?.startsWith('image/')) imgs.push(f.path)
    })
    return imgs
}

const getTitle = (v) => {
    for (const k of ['model','Model','name','Name','title','Title','make','Make']) if (v[k]) return v[k]
    return 'Vehicle'
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'

const SKIP = new Set(['_id','__v','files','createdAt','updatedAt','createdBy','manufacturer','manufacturerId'])
const isId = (k) => /^[a-f0-9]{24}$/i.test(k)

// ── Vehicle card ───────────────────────────────────────────────────────────────
const VehicleCard = ({ vehicle, fields, onView }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const imgs = getVehicleImages(vehicle)
    const title = getTitle(vehicle)

    const getLabel = (key) => {
        if (isId(key)) {
            const f = fields.find(f => f._id === key)
            return f ? f.label : key
        }
        return key.replace(/([A-Z])/g, ' $1').trim()
    }

    const entries = Object.entries(vehicle).filter(([k, v]) => {
        if (SKIP.has(k) || k === 'model' || k === 'variant') return false
        if (Array.isArray(v) || (typeof v === 'object' && v !== null)) return false
        if (v === '' || v === null || v === undefined) return false
        return true
    }).slice(0, 6)

    return (
        <div className="jp-card overflow-hidden hover:shadow-md transition-all cursor-pointer group" onClick={() => onView(vehicle)}>
            {/* Image */}
            <div className="relative bg-gray-100 overflow-hidden" style={{height:'140px'}}>
                {imgs.length > 0 ? (
                    <>
                        <img src={imgs[imgIdx]} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {imgs.length > 1 && (
                            <div className="absolute bottom-1 right-1 flex gap-1">
                                {imgs.slice(0,5).map((_, i) => (
                                    <button key={i} onClick={e => { e.stopPropagation(); setImgIdx(i) }}
                                        className={`w-1.5 h-1.5 rounded-full transition ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                                ))}
                            </div>
                        )}
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-white font-bold"
                             style={{background:'var(--accent)', fontSize:'9px', letterSpacing:'0.05em'}}>
                            {imgs.length} PHOTO{imgs.length !== 1 ? 'S' : ''}
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="p-2">
                {/* Title row */}
                <div className="flex items-start justify-between gap-1 mb-2 pb-1.5 border-b border-gray-100">
                    <div>
                        <p className="font-bold leading-tight" style={{fontSize:'var(--text-md)', color:'var(--foreground)'}}>
                            {title}{vehicle.variant ? ` ${vehicle.variant}` : ''}
                        </p>
                        {vehicle.auctionGroup && (
                            <p style={{fontSize:'var(--text-xs)', color:'var(--accent)', fontWeight:600}}>{vehicle.auctionGroup}{vehicle.auctionVenue ? ` / ${vehicle.auctionVenue}` : ''}</p>
                        )}
                    </div>
                    <Link href={`/admin/vehicles/edit/${vehicle._id}`}
                        onClick={e => e.stopPropagation()}
                        className="px-2 py-1 rounded text-white shrink-0"
                        style={{background:'var(--accent)', fontSize:'9px', fontWeight:700, letterSpacing:'0.05em'}}>
                        EDIT
                    </Link>
                </div>

                {/* Field grid — like auction sheet */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {entries.map(([k, v]) => (
                        <div key={k}>
                            <p className="uppercase font-bold" style={{fontSize:'9px', color:'var(--foreground-muted)', letterSpacing:'0.08em'}}>{getLabel(k)}</p>
                            <p className="font-semibold truncate" style={{fontSize:'var(--text-xs)', color:'var(--foreground)'}}>{String(v)}</p>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                    <span style={{fontSize:'9px', color:'var(--foreground-faint)'}}>
                        📅 {fmtDate(vehicle.createdAt)}
                    </span>
                    <button className="px-2 py-0.5 rounded text-white font-bold"
                            style={{background:'#1c2b3a', fontSize:'9px', letterSpacing:'0.05em'}}>
                        VIEW →
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Detail modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ vehicle, fields, onClose }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const imgs = getVehicleImages(vehicle)

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [onClose])

    const getLabel = (key) => {
        if (isId(key)) {
            const f = fields.find(f => f._id === key)
            return f ? f.label : key
        }
        return key.replace(/([A-Z])/g, ' $1').trim()
    }

    const entries = Object.entries(vehicle).filter(([k, v]) => {
        if (SKIP.has(k)) return false
        if (Array.isArray(v) || (typeof v === 'object' && v !== null)) return false
        if (v === '' || v === null || v === undefined) return false
        return true
    })

    const title = [vehicle.auctionGroup, vehicle.auctionVenue, getTitle(vehicle), vehicle.variant].filter(Boolean).join(' / ')

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
                 onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{borderColor:'var(--border)', background:'var(--ink)'}}>
                    <div>
                        <p className="font-bold text-white" style={{fontSize:'var(--text-md)'}}>{title}</p>
                        <p style={{fontSize:'var(--text-xs)', color:'rgba(255,255,255,0.5)'}}>Added {fmtDate(vehicle.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/vehicles/edit/${vehicle._id}`}
                            className="px-3 py-1 rounded font-bold text-white"
                            style={{background:'var(--accent)', fontSize:'var(--text-xs)'}}>
                            Edit Vehicle
                        </Link>
                        <button onClick={onClose} className="text-white/60 hover:text-white p-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Images */}
                        <div className="border-r" style={{borderColor:'var(--border)'}}>
                            {imgs.length > 0 ? (
                                <>
                                    <div className="relative bg-black" style={{height:'240px'}}>
                                        <img src={imgs[imgIdx]} alt="" className="w-full h-full object-contain" />
                                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white font-bold"
                                             style={{fontSize:'10px'}}>{imgIdx+1}/{imgs.length}</div>
                                        {imgs.length > 1 && <>
                                            <button onClick={() => setImgIdx((imgIdx-1+imgs.length)%imgs.length)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <button onClick={() => setImgIdx((imgIdx+1)%imgs.length)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </>}
                                    </div>
                                    {imgs.length > 1 && (
                                        <div className="flex gap-1 p-2 overflow-x-auto" style={{background:'var(--surface-muted)'}}>
                                            {imgs.map((img, i) => (
                                                <button key={i} onClick={() => setImgIdx(i)}
                                                    className="shrink-0 rounded overflow-hidden transition"
                                                    style={{width:'52px', height:'40px', border: i===imgIdx ? '2px solid var(--accent)' : '2px solid transparent'}}>
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="h-60 flex items-center justify-center bg-gray-50">
                                    <p style={{fontSize:'var(--text-xs)', color:'var(--foreground-faint)'}}>No images</p>
                                </div>
                            )}
                        </div>

                        {/* Data sheet */}
                        <div className="p-3 overflow-y-auto" style={{maxHeight:'320px'}}>
                            <p className="jp-section-title mb-3">Vehicle Details</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {entries.map(([k, v]) => (
                                    <div key={k} className="border-b pb-1" style={{borderColor:'var(--border)'}}>
                                        <p className="uppercase font-bold" style={{fontSize:'9px', color:'var(--foreground-muted)', letterSpacing:'0.08em'}}>{getLabel(k)}</p>
                                        <p className="font-semibold" style={{fontSize:'var(--text-xs)', color:'var(--foreground)'}}>{String(v)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Main page ──────────────────────────────────────────────────────────────────
const Page = () => {
    const [vehicles, setVehicles] = useState([])
    const [fields, setFields] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        Promise.all([
            fetch('/api/vehicles').then(r => r.json()),
            fetch('/api/fields', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({belongsto:'add-vehicles'}) }).then(r => r.json())
        ]).then(([v, f]) => {
            setVehicles(Array.isArray(v) ? v : [])
            setFields(Array.isArray(f) ? f : [])
        }).catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }, [])

    const filtered = vehicles.filter(v => {
        if (!search) return true
        const q = search.toLowerCase()
        return JSON.stringify(v).toLowerCase().includes(q)
    })

    return (
        <div className="px-4 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-5 rounded-full" style={{background:'var(--accent)'}}></div>
                    <h1 className="font-bold" style={{fontSize:'var(--text-2xl)'}}>Vehicle Management</h1>
                    <span style={{fontSize:'var(--text-xs)', color:'var(--foreground-muted)'}}>
                        {loading ? '…' : `${filtered.length} vehicles`}
                    </span>
                </div>
                <Link href="/admin/vehicles/add"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-white transition"
                    style={{background:'var(--accent)', fontSize:'var(--text-sm)'}}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Vehicle
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-4 max-w-xs">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search vehicles..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-200 outline-none focus:border-red-400"
                    style={{fontSize:'var(--text-sm)'}} />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div>
                </div>
            ) : error ? (
                <div className="p-4 rounded border text-center" style={{background:'#fef2f2', borderColor:'#fecaca', color:'var(--accent)', fontSize:'var(--text-sm)'}}>
                    {error}
                </div>
            ) : filtered.length === 0 ? (
                <div className="jp-card p-12 text-center">
                    <p className="font-semibold mb-2" style={{fontSize:'var(--text-md)'}}>
                        {search ? 'No vehicles match your search' : 'No vehicles yet'}
                    </p>
                    {!search && (
                        <Link href="/admin/vehicles/add" className="inline-block mt-3 px-4 py-2 rounded text-white font-bold"
                              style={{background:'var(--accent)', fontSize:'var(--text-sm)'}}>
                            Add First Vehicle
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))'}}>
                    {filtered.map(v => (
                        <VehicleCard key={v._id} vehicle={v} fields={fields} onView={setSelected} />
                    ))}
                </div>
            )}

            {selected && (
                <DetailModal vehicle={selected} fields={fields} onClose={() => setSelected(null)} />
            )}
        </div>
    )
}

export default Page
