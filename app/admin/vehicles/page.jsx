'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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
    return [...new Set(imgs)]
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'

// ── Vehicle card ───────────────────────────────────────────────────────────────
const VehicleCard = ({ vehicle, fields, onView, onDelete }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const imgs = getVehicleImages(vehicle)

    const cardFields = fields
        .filter(f => f.showOnCard !== false && f.belongsto === 'add-vehicles')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const entries = cardFields.map(f => {
        let val = vehicle[f._id]
        if (val === undefined || val === '' || val === null) val = vehicle[f.label]
        if (val === undefined || val === '' || val === null) return null
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return null
        return { label: f.label, value: String(val) }
    }).filter(Boolean)

    const lotField = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal   = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.auctionGroup, vehicle.auctionVenue, lotVal || null].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const descLine   = vehicle.modelDescription || vehicle.variant || ''
    const isPreSold  = vehicle.allocationStatus === true

    const purchaseDateField = fields.find(f =>
        f.label?.toLowerCase().includes('purchase') && f.label?.toLowerCase().includes('date'))
    const purchaseDateVal = purchaseDateField
        ? (vehicle[purchaseDateField._id] || vehicle[purchaseDateField.label]) : null
    const footerDate = purchaseDateVal ? fmtDate(purchaseDateVal) : fmtDate(vehicle.createdAt)

    const alloc  = (vehicle.allocation || '').toLowerCase()
    const rikuso = !!vehicle.rikusoStatus
    const statusLeft  = [
        { label:'Export', active: alloc === 'export' },
        { label:'Khitai', active: alloc === 'khitai' },
        { label:'Resale', active: alloc === 'resale-to-auction' },
        { label:'Rikso',  active: rikuso },
    ]
    const statusRight = [
        { label:'Docs' }, { label:'EC' }, { label:'TBS' }, { label:'BL' },
    ]

    return (
        <div
            onClick={() => onView(vehicle)}
            style={{
                background:'#fff',
                border:'1px solid #d0d0d0',
                borderRadius:'4px',
                fontFamily:'"Segoe UI",Arial,sans-serif',
                overflow:'hidden',
                cursor:'pointer',
                boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
                transition:'box-shadow 0.15s',
                display:'flex',
                flexDirection:'column',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.14)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.08)'}
        >
            {/* ── Header bar ── */}
            <div style={{background:'#ebebeb', borderBottom:'1px solid #ccc', padding:'4px 10px'}}>
                <p style={{
                    fontSize:'11px', fontWeight:700, color:'#333',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', margin:0
                }}>{headerLine || '—'}</p>
            </div>

            {/* ── Image ── */}
            <div style={{position:'relative', height:'170px', background:'#ddd', flexShrink:0}}>
                {imgs.length > 0 ? (
                    <>
                        <img src={imgs[imgIdx]} alt="" style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}} />
                        {imgs.length > 1 && (
                            <>
                                <button onClick={e=>{e.stopPropagation();setImgIdx((imgIdx-1+imgs.length)%imgs.length)}}
                                    style={{position:'absolute',left:'4px',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.55)',border:'none',color:'#fff',borderRadius:'50%',width:'22px',height:'22px',fontSize:'15px',cursor:'pointer',lineHeight:'22px',textAlign:'center',padding:0}}>‹</button>
                                <button onClick={e=>{e.stopPropagation();setImgIdx((imgIdx+1)%imgs.length)}}
                                    style={{position:'absolute',right:'4px',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.55)',border:'none',color:'#fff',borderRadius:'50%',width:'22px',height:'22px',fontSize:'15px',cursor:'pointer',lineHeight:'22px',textAlign:'center',padding:0}}>›</button>
                                <div style={{position:'absolute',bottom:'5px',left:'6px',background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:'9px',padding:'1px 5px',borderRadius:'3px'}}>{imgIdx+1}/{imgs.length}</div>
                            </>
                        )}
                        {isPreSold && (
                            <div style={{position:'absolute',top:0,right:0,overflow:'hidden',width:'80px',height:'80px',pointerEvents:'none'}}>
                                <div style={{
                                    position:'absolute', top:'16px', right:'-22px', width:'96px',
                                    background:'#1a3060', color:'#fff', fontSize:'10px',
                                    fontWeight:900, fontStyle:'italic', letterSpacing:'0.06em',
                                    textAlign:'center', padding:'4px 0',
                                    transform:'rotate(45deg)', transformOrigin:'center',
                                    boxShadow:'0 2px 4px rgba(0,0,0,0.35)'
                                }}>PRE-SOLD</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa',fontSize:'12px'}}>No Image</div>
                )}
            </div>

            {/* ── Name + description ── */}
            <div style={{padding:'6px 10px 5px', borderBottom:'1px solid #e8e8e8', background:'#f8f8f8'}}>
                <p style={{margin:0, fontSize:'12px', fontWeight:700, color:'#111', lineHeight:1.3, letterSpacing:'0.01em'}}>{nameLine || '—'}</p>
                {descLine && <p style={{margin:'1px 0 0', fontSize:'10px', color:'#777', lineHeight:1.3}}>{descLine}</p>}
            </div>

            {/* ── Fields ── */}
            <div style={{padding:'7px 10px 5px', flex:1}}>
                {entries.slice(0, 10).map((e, i) => {
                    // Pair up entries: even index = left col, odd = right col
                    if (i % 2 !== 0) return null
                    const right = entries[i + 1]
                    return (
                        <div key={i} style={{display:'flex', gap:'8px', marginBottom:'3px', alignItems:'baseline'}}>
                            <div style={{flex:1, minWidth:0}}>
                                <span style={{fontSize:'11px', fontWeight:700, color:'#222'}}>{e.label}: </span>
                                <span style={{fontSize:'11px', color:'#444'}}>{e.value}</span>
                            </div>
                            {right && (
                                <div style={{flex:1, minWidth:0}}>
                                    <span style={{fontSize:'11px', fontWeight:700, color:'#222'}}>{right.label}: </span>
                                    <span style={{fontSize:'11px', color:'#444'}}>{right.value}</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* ── Status dots ── */}
            <div style={{padding:'5px 10px', borderTop:'1px solid #eee', borderBottom:'1px solid #eee', background:'#fafafa'}}>
                <div style={{display:'flex', gap:'12px'}}>
                    {/* Left col */}
                    <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                        {statusLeft.map(s => (
                            <div key={s.label} style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                <span style={{
                                    width:'9px', height:'9px', borderRadius:'50%', flexShrink:0,
                                    background: s.active ? '#e74c3c' : '#d1d5db',
                                    boxShadow: s.active ? '0 0 4px rgba(231,76,60,0.5)' : 'none'
                                }}/>
                                <span style={{fontSize:'11px', fontWeight: s.active ? 700 : 400, color: s.active ? '#111' : '#999'}}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    {/* Right col */}
                    <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                        {statusRight.map(s => (
                            <div key={s.label} style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                <span style={{width:'9px', height:'9px', borderRadius:'50%', flexShrink:0, background:'#d1d5db'}}/>
                                <span style={{fontSize:'11px', color:'#bbb'}}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div style={{padding:'6px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff'}}>
                <span style={{fontSize:'10px', color:'#999', fontWeight:500}}>{footerDate}</span>
                <div style={{display:'flex', gap:'5px'}}>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(vehicle._id) }}
                        title="Delete"
                        style={{
                            width:'26px', height:'26px', borderRadius:'5px', border:'none',
                            background:'#7f1d1d', cursor:'pointer', color:'#fff',
                            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                        }}
                    >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <Link
                        href={`/admin/vehicles/edit/${vehicle._id}`}
                        onClick={e => e.stopPropagation()}
                        title="Edit"
                        style={{
                            width:'26px', height:'26px', borderRadius:'5px',
                            background:'#c0392b', cursor:'pointer', color:'#fff',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            flexShrink:0, textDecoration:'none'
                        }}
                    >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ── Detail modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ vehicle, fields, onClose, onDelete }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const [zoom, setZoom] = useState(1)          // 1 = 100%, max 3
    const [zoomOpen, setZoomOpen] = useState(false) // fullscreen zoom lightbox
    const imgs = getVehicleImages(vehicle)

    const ZOOM_STEP = 0.25
    const ZOOM_MIN  = 0.5
    const ZOOM_MAX  = 3

    useEffect(() => {
        const h = (e) => {
            if (e.key === 'Escape') { if (zoomOpen) setZoomOpen(false); else onClose() }
            if (e.key === 'ArrowLeft')  setImgIdx(i => (i - 1 + imgs.length) % imgs.length)
            if (e.key === 'ArrowRight') setImgIdx(i => (i + 1) % imgs.length)
            if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX))
            if (e.key === '-') setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN))
        }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [onClose, imgs.length, zoomOpen])

    // reset zoom when switching images
    useEffect(() => { setZoom(1) }, [imgIdx])

    const detailFields = fields
        .filter(f => f.belongsto === 'add-vehicles')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const detailEntries = detailFields.map(f => {
        let val = vehicle[f._id]
        if (val === undefined || val === '' || val === null) val = vehicle[f.label]
        if (val === undefined || val === '' || val === null) return null
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return null
        return { label: f.label, value: String(val) }
    }).filter(Boolean)

    const title = [vehicle.auctionGroup, vehicle.auctionVenue, vehicle.manufacturer, vehicle.model].filter(Boolean).join(' › ')

    return (
        <>
        {/* ── Main modal ── */}
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full flex flex-col overflow-hidden"
                style={{maxWidth:'1100px', height:'90vh'}}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{background:'var(--ink)'}}>
                    <p className="font-bold text-white truncate pr-3" style={{fontSize:'var(--text-md)'}}>{title || 'Vehicle Details'}</p>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href={`/admin/vehicles/edit/${vehicle._id}`}
                            className="px-3 py-1 rounded font-bold text-white text-xs"
                            style={{background:'var(--accent)'}}
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => onDelete(vehicle._id)}
                            className="px-3 py-1 rounded font-bold text-white text-xs flex items-center gap-1"
                            style={{background:'#7f1d1d'}}
                            title="Delete vehicle"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                        <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row flex-1 min-h-0">

                    {/* ── Left: images ── */}
                    <div className="flex flex-col md:w-[55%] shrink-0 border-r" style={{borderColor:'var(--border)'}}>
                        {imgs.length > 0 ? (
                            <>
                                {/* Main image */}
                                <div
                                    className="relative bg-black flex-1 min-h-0 overflow-hidden flex items-center justify-center cursor-zoom-in"
                                    style={{minHeight:'280px'}}
                                    onClick={() => setZoomOpen(true)}
                                    title="Click to open fullscreen"
                                >
                                    <img
                                        src={imgs[imgIdx]}
                                        alt=""
                                        style={{
                                            transform: `scale(${zoom})`,
                                            transformOrigin: 'center',
                                            transition: 'transform 0.2s',
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                            display: 'block',
                                        }}
                                    />

                                    {/* Counter */}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-bold" style={{fontSize:'10px'}}>
                                        {imgIdx + 1} / {imgs.length}
                                    </div>

                                    {/* Fullscreen hint */}
                                    <div className="absolute top-2 right-2 bg-black/50 text-white rounded p-1" title="Fullscreen">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    </div>

                                    {/* Prev / Next */}
                                    {imgs.length > 1 && (
                                        <>
                                            <button
                                                onClick={e => { e.stopPropagation(); setImgIdx((imgIdx - 1 + imgs.length) % imgs.length) }}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); setImgIdx((imgIdx + 1) % imgs.length) }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Zoom controls */}
                                <div className="flex items-center justify-center gap-2 py-2 shrink-0 border-t" style={{borderColor:'var(--border)', background:'#f9f9f9'}}>
                                    <button
                                        onClick={() => setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN))}
                                        disabled={zoom <= ZOOM_MIN}
                                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition font-bold text-lg leading-none"
                                        title="Zoom out (−)"
                                    >−</button>
                                    <span className="text-xs text-gray-500 font-semibold w-12 text-center">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                        onClick={() => setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX))}
                                        disabled={zoom >= ZOOM_MAX}
                                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition font-bold text-lg leading-none"
                                        title="Zoom in (+)"
                                    >+</button>
                                    <button
                                        onClick={() => setZoom(1)}
                                        className="px-2 py-0.5 text-xs text-gray-500 border border-gray-200 rounded hover:bg-gray-100 transition"
                                        title="Reset zoom"
                                    >Reset</button>
                                    <button
                                        onClick={() => setZoomOpen(true)}
                                        className="px-2 py-0.5 text-xs font-semibold text-white rounded transition"
                                        style={{background:'var(--ink)'}}
                                        title="Open fullscreen"
                                    >
                                        ⛶ Fullscreen
                                    </button>
                                </div>

                                {/* Thumbnails */}
                                {imgs.length > 1 && (
                                    <div className="flex gap-1.5 px-2 pb-2 pt-1 overflow-x-auto shrink-0" style={{background:'#f0f0f0'}}>
                                        {imgs.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setImgIdx(i)}
                                                className="shrink-0 rounded overflow-hidden transition"
                                                style={{
                                                    width: '56px', height: '44px',
                                                    border: i === imgIdx ? '2px solid var(--accent)' : '2px solid transparent',
                                                    opacity: i === imgIdx ? 1 : 0.65
                                                }}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gray-50">
                                <p className="text-gray-400 text-sm">No images</p>
                            </div>
                        )}
                    </div>

                    {/* ── Right: details ── */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <p className="jp-section-title mb-3">Vehicle Details</p>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
                            {detailEntries.map((e, i) => (
                                <div key={i} className="pb-2 border-b" style={{borderColor:'var(--border)'}}>
                                    <p style={{fontSize:'9px', color:'var(--foreground-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em'}}>{e.label}</p>
                                    <p style={{fontSize:'var(--text-sm)', color:'var(--foreground)', fontWeight:600}}>{e.value}</p>
                                </div>
                            ))}
                        </div>
                        {detailEntries.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-6">No details available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* ── Fullscreen lightbox ── */}
        {zoomOpen && (
            <div
                className="fixed inset-0 z-60 bg-black flex flex-col"
                onClick={() => setZoomOpen(false)}
            >
                {/* Lightbox toolbar */}
                <div className="flex items-center justify-between px-4 py-2 shrink-0 bg-black/80" onClick={e => e.stopPropagation()}>
                    <span className="text-white text-sm font-semibold">{imgIdx + 1} / {imgs.length}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN))} disabled={zoom <= ZOOM_MIN}
                            className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 font-bold text-lg transition">−</button>
                        <span className="text-white text-xs w-12 text-center font-semibold">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX))} disabled={zoom >= ZOOM_MAX}
                            className="w-8 h-8 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 font-bold text-lg transition">+</button>
                        <button onClick={() => setZoom(1)} className="px-2 py-1 text-xs text-white/70 bg-white/10 hover:bg-white/20 rounded transition">Reset</button>
                        <button onClick={() => setZoomOpen(false)} className="ml-2 text-white/60 hover:text-white p-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Lightbox image */}
                <div className="flex-1 overflow-auto flex items-center justify-center" onClick={e => e.stopPropagation()}>
                    <img
                        src={imgs[imgIdx]}
                        alt=""
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center',
                            transition: 'transform 0.2s',
                            maxWidth: zoom <= 1 ? '100%' : 'none',
                            maxHeight: zoom <= 1 ? '100%' : 'none',
                            objectFit: 'contain',
                        }}
                    />
                </div>

                {/* Lightbox nav */}
                {imgs.length > 1 && (
                    <>
                        <button
                            onClick={e => { e.stopPropagation(); setImgIdx((imgIdx - 1 + imgs.length) % imgs.length) }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); setImgIdx((imgIdx + 1) % imgs.length) }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </>
                )}

                {/* Lightbox thumbnails */}
                {imgs.length > 1 && (
                    <div className="flex gap-1.5 px-3 pb-3 pt-1 overflow-x-auto shrink-0 bg-black/60" onClick={e => e.stopPropagation()}>
                        {imgs.map((img, i) => (
                            <button key={i} onClick={() => setImgIdx(i)}
                                className="shrink-0 rounded overflow-hidden transition"
                                style={{width:'60px', height:'46px', border: i === imgIdx ? '2px solid #fff' : '2px solid transparent', opacity: i === imgIdx ? 1 : 0.5}}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}
        </>
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
            fetch('/api/fields').then(r => r.json())
        ]).then(([v, f]) => {
            setVehicles(Array.isArray(v) ? v : [])
            setFields(Array.isArray(f) ? f : [])
        }).catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }, [])

    const handleDelete = async (vehicleId) => {
        if (!confirm('Delete this vehicle? This cannot be undone.')) return
        try {
            const res = await fetch('/api/vehicles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleId }),
            })
            if (!res.ok) throw new Error('Failed to delete')
            setVehicles(prev => prev.filter(v => v._id !== vehicleId))
            if (selected?._id === vehicleId) setSelected(null)
        } catch (err) {
            alert('Failed to delete vehicle: ' + err.message)
        }
    }

    const filtered = vehicles.filter(v => {
        if (!search) return true
        return JSON.stringify(v).toLowerCase().includes(search.toLowerCase())
    })

    return (
        <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-5 rounded-full" style={{background:'var(--accent)'}}></div>
                    <h1 className="font-bold" style={{fontSize:'var(--text-2xl)'}}>Vehicle Management</h1>
                    <span style={{fontSize:'var(--text-xs)', color:'var(--foreground-muted)'}}>{loading ? '…' : `${filtered.length} vehicles`}</span>
                </div>
                <Link href="/admin/vehicles/add" className="flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-white transition" style={{background:'var(--accent)', fontSize:'var(--text-sm)'}}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Vehicle
                </Link>
            </div>

            <div className="relative mb-4 max-w-xs">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded border border-gray-200 outline-none focus:border-red-400"
                    style={{fontSize:'var(--text-sm)'}} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div>
                </div>
            ) : error ? (
                <div className="p-4 rounded border text-center" style={{background:'#fef2f2', borderColor:'#fecaca', color:'var(--accent)', fontSize:'var(--text-sm)'}}>{error}</div>
            ) : filtered.length === 0 ? (
                <div className="jp-card p-12 text-center">
                    <p className="font-semibold mb-2" style={{fontSize:'var(--text-md)'}}>
                        {search ? 'No vehicles match your search' : 'No vehicles yet'}
                    </p>
                    {!search && (
                        <Link href="/admin/vehicles/add" className="inline-block mt-3 px-4 py-2 rounded text-white font-bold" style={{background:'var(--accent)', fontSize:'var(--text-sm)'}}>
                            Add First Vehicle
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))'}}>
                    {filtered.map(v => (
                        <VehicleCard key={v._id} vehicle={v} fields={fields} onView={setSelected} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {selected && <DetailModal vehicle={selected} fields={fields} onClose={() => setSelected(null)} onDelete={handleDelete} />}
        </div>
    )
}

export default Page
