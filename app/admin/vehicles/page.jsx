'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

const getVehicleImages = (vehicle) => {
    const all = []
    Object.entries(vehicle).forEach(([key, val]) => {
        if (key === 'files' || key === 'mainImageUrl') return
        if (Array.isArray(val)) {
            val.forEach(item => {
                if (item?.path && item?.type?.startsWith('image/')) all.push(item.path)
            })
        }
    })
    if (vehicle.files) {
        vehicle.files.forEach(f => {
            if (f?.type?.startsWith('image/')) all.push(f.path)
        })
    }
    const unique = [...new Set(all)]
    // Put mainImageUrl first if set
    if (vehicle.mainImageUrl && unique.includes(vehicle.mainImageUrl)) {
        return [vehicle.mainImageUrl, ...unique.filter(u => u !== vehicle.mainImageUrl)]
    }
    return unique
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'

// ── Vehicle card ───────────────────────────────────────────────────────────────
const VehicleCard = ({ vehicle, fields, onView, onDelete }) => {
    const [imgIdx, setImgIdx] = useState(0)
    const [hov, setHov] = useState(false)
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

    const lotField   = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal     = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.auctionGroup, vehicle.auctionVenue, lotVal || null].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ').toUpperCase()
    const descLine = vehicle.modelDescription || vehicle.variant || vehicle['Description'] || vehicle['description'] || ''
    const isPreSold  = vehicle.allocationStatus === true

    const pDateField = fields.find(f => f.label?.toLowerCase().includes('purchase') && f.label?.toLowerCase().includes('date'))
    const pDateVal   = pDateField ? (vehicle[pDateField._id] || vehicle[pDateField.label]) : null
    const footerDate = pDateVal ? fmtDate(pDateVal) : fmtDate(vehicle.createdAt)

    const alloc  = (vehicle.allocation || '').toLowerCase()
    const rikuso = !!vehicle.rikusoStatus

    const btnBase = { width:'28px',height:'28px',borderRadius:'6px',cursor:'pointer',
        display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s' }

    // ── swipe support ──
    const touchStartX = React.useRef(null)
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
    const handleTouchEnd   = (e) => {
        if (touchStartX.current === null || imgs.length < 2) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 30)
            setImgIdx(diff > 0 ? (imgIdx+1)%imgs.length : (imgIdx-1+imgs.length)%imgs.length)
        touchStartX.current = null
    }

    return (
        <div onClick={() => onView(vehicle)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                background:'#fff', borderRadius:'8px', overflow:'hidden', cursor:'pointer',
                border: hov ? '1px solid #1a73e8' : '1px solid #e2e8f0',
                boxShadow: hov ? '0 4px 16px rgba(26,115,232,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
                transition:'all 0.18s', display:'flex', flexDirection:'column',
                fontFamily:'"Inter","Segoe UI",Arial,sans-serif',
            }}>

            {/* header */}
            <div style={{background: hov ? '#1a73e8' : '#1e293b', padding:'6px 12px', transition:'background 0.18s'}}>
                <p style={{margin:0, fontSize:'11px', fontWeight:600, color:'#fff', letterSpacing:'0.04em',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', opacity: headerLine ? 1 : 0.5}}>
                    {headerLine || 'No Group / Venue'}
                </p>
            </div>

            {/* image */}
            <div
                style={{position:'relative', height:'175px', background:'#f1f5f9', flexShrink:0}}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {imgs.length > 0 ? (
                    <>
                        <img src={imgs[imgIdx]} alt="" style={{width:'100%',height:'100%',objectFit:'contain',display:'block',background:'#f1f5f9'}} />
                        {imgs.length > 1 && (<>
                            <button onClick={e=>{e.stopPropagation();setImgIdx((imgIdx-1+imgs.length)%imgs.length)}}
                                style={{position:'absolute',left:'6px',top:'50%',transform:'translateY(-50%)',
                                background:'rgba(0,0,0,0.45)',border:'none',color:'#fff',borderRadius:'50%',
                                width:'24px',height:'24px',fontSize:'16px',cursor:'pointer',display:'flex',
                                alignItems:'center',justifyContent:'center',padding:0}}>‹</button>
                            <button onClick={e=>{e.stopPropagation();setImgIdx((imgIdx+1)%imgs.length)}}
                                style={{position:'absolute',right:'6px',top:'50%',transform:'translateY(-50%)',
                                background:'rgba(0,0,0,0.45)',border:'none',color:'#fff',borderRadius:'50%',
                                width:'24px',height:'24px',fontSize:'16px',cursor:'pointer',display:'flex',
                                alignItems:'center',justifyContent:'center',padding:0}}>›</button>
                            {/* Dot indicators — clickable */}
                            <div style={{
                                position:'absolute',bottom:'8px',left:0,right:0,
                                display:'flex',justifyContent:'center',gap:'5px'
                            }}>
                                {imgs.map((_,i) => (
                                    <span
                                        key={i}
                                        onClick={e=>{e.stopPropagation();setImgIdx(i)}}
                                        style={{
                                            width: i===imgIdx?'18px':'7px', height:'7px',
                                            borderRadius:'4px',
                                            background: i===imgIdx?'#fff':'rgba(255,255,255,0.5)',
                                            boxShadow:'0 1px 3px rgba(0,0,0,0.4)',
                                            transition:'all 0.2s', display:'block',
                                            cursor:'pointer',
                                        }}
                                    />
                                ))}
                            </div>
                        </>)}
                        {isPreSold && (
                            <div style={{position:'absolute',top:-1,right:0,overflow:'hidden',width:'84px',height:'84px',pointerEvents:'none'}}>
                                <div style={{position:'absolute',top:'18px',right:'-24px',width:'100px',
                                    background:'#1a3060',color:'#fff',fontSize:'10px',fontWeight:800,
                                    fontStyle:'italic',letterSpacing:'0.08em',textAlign:'center',padding:'4px 0',
                                    transform:'rotate(45deg)',boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>PRE-SOLD</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',
                        alignItems:'center',justifyContent:'center',color:'#94a3b8',gap:'6px'}}>
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span style={{fontSize:'11px'}}>No Image</span>
                    </div>
                )}
            </div>

            {/* title */}
            <div style={{padding:'9px 12px 7px', borderBottom:'1px solid #f0f4f8'}}>
                <p style={{margin:0,fontSize:'13px',fontWeight:700,color:'#0f172a',lineHeight:1.25,letterSpacing:'0.02em'}}>{nameLine||'—'}</p>
                {descLine && <p style={{margin:'3px 0 0',fontSize:'10.5px',color:'#64748b',lineHeight:1.3,fontWeight:500}}>{descLine}</p>}
            </div>

            {/* specs */}
            <div style={{padding:'10px 14px 8px', flex:1, borderBottom:'1px solid #f0f4f8'}}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0px 16px'}}>
                    {entries.slice(0, 10).map((e, i) => (
                        <div key={i} style={{
                            padding:'5px 0',
                            borderBottom:'1px solid #f4f4f4',
                        }}>
                            <div style={{fontSize:'10px', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', lineHeight:1.2}}>{e.label}</div>
                            <div style={{fontSize:'12.5px', fontWeight:600, color:'#1e293b', marginTop:'2px', lineHeight:1.3}}>{e.value}</div>
                        </div>
                    ))}
                </div>
                {entries.length === 0 && <p style={{fontSize:'11px',color:'#cbd5e1',margin:0,fontStyle:'italic'}}>No details</p>}
            </div>

            {/* status dots */}
            <div style={{padding:'7px 12px', background:'#f8fafc', borderBottom:'1px solid #f0f4f8'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <div style={{display:'flex', flexDirection:'column', gap:'3px'}}>
                        {[
                            {label:'Export', active: alloc==='export'},
                            {label:'Khitai', active: alloc==='khitai'},
                            {label:'Resale', active: alloc==='resale-to-auction'},
                            {label:'Rikso',  active: rikuso},
                        ].map(s => (
                            <div key={s.label} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                <span style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,
                                    background: s.active?'#ef4444':'#e2e8f0',
                                    boxShadow: s.active?'0 0 5px rgba(239,68,68,0.4)':'none'}}/>
                                <span style={{fontSize:'11px',fontWeight:s.active?700:400,color:s.active?'#dc2626':'#94a3b8'}}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:'3px'}}>
                        {['Docs','EC','TBS','BL'].map(l => (
                            <div key={l} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                <span style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,background:'#e2e8f0'}}/>
                                <span style={{fontSize:'11px',color:'#cbd5e1'}}>{l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* footer */}
            <div style={{padding:'7px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fff'}}>
                <span style={{fontSize:'11px',color:'#94a3b8',fontWeight:500}}>{footerDate}</span>
                <div style={{display:'flex',gap:'6px'}}>
                    <button onClick={e=>{e.stopPropagation();onDelete(vehicle._id)}} title="Delete"
                        style={{...btnBase,border:'1px solid #fecaca',background:'#fff5f5',color:'#dc2626'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='#dc2626';e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='#dc2626'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='#fff5f5';e.currentTarget.style.color='#dc2626';e.currentTarget.style.borderColor='#fecaca'}}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                    <Link href={`/admin/vehicles/edit/${vehicle._id}`} onClick={e=>e.stopPropagation()} title="Edit"
                        style={{...btnBase,border:'1px solid #bfdbfe',background:'#eff6ff',color:'#2563eb',textDecoration:'none'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='#2563eb';e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor='#2563eb'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='#eff6ff';e.currentTarget.style.color='#2563eb';e.currentTarget.style.borderColor='#bfdbfe'}}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
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
                            style={{background:'#c5221f'}}
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
// ── Cookie helpers ─────────────────────────────────────────────────────────────
const getCookie = (n) => {
    if (typeof document === 'undefined') return null
    const m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'))
    return m ? decodeURIComponent(m[1]) : null
}
const setCookie = (n, v) => {
    document.cookie = `${n}=${encodeURIComponent(v)};max-age=${365*86400};path=/`
}

// ── Compact list row (table-style) ────────────────────────────────────────────
const VehicleRow = ({ vehicle, fields, onView, onDelete }) => {
    const imgs    = getVehicleImages(vehicle)
    const alloc   = (vehicle.allocation || '').toLowerCase()
    const rikuso  = !!vehicle.rikusoStatus
    const isPreSold = vehicle.allocationStatus === true

    const lotField = fields.find(f => f.label?.toLowerCase().includes('lot'))
    const lotVal   = lotField ? (vehicle[lotField._id] || vehicle[lotField.label]) : null
    const headerLine = [vehicle.auctionGroup, vehicle.auctionVenue, lotVal || null].filter(Boolean).join(' / ')
    const nameLine   = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ')

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

    const pDateField = fields.find(f => f.label?.toLowerCase().includes('purchase') && f.label?.toLowerCase().includes('date'))
    const pDateVal   = pDateField ? (vehicle[pDateField._id] || vehicle[pDateField.label]) : null
    const footerDate = pDateVal ? fmtDate(pDateVal) : fmtDate(vehicle.createdAt)

    const activeAlloc = alloc === 'export' ? 'Export' : alloc === 'khitai' ? 'Khitai' : alloc === 'resale-to-auction' ? 'Resale' : null

    return (
        <tr
            onClick={() => onView(vehicle)}
            style={{cursor:'pointer', borderBottom:'1px solid #f0f4f8', transition:'background 0.1s'}}
            onMouseEnter={e => e.currentTarget.style.background='#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background=''}
        >
            {/* Thumb */}
            <td style={{padding:'5px 8px', width:'48px'}}>
                <div style={{width:'42px', height:'32px', borderRadius:'4px', overflow:'hidden', background:'#f1f5f9', flexShrink:0, position:'relative'}}>
                    {imgs.length > 0
                        ? <img src={imgs[0]} alt="" style={{width:'100%',height:'100%',objectFit:'contain',background:'#f1f5f9'}} />
                        : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#cbd5e1',fontSize:'9px'}}>—</div>
                    }
                    {isPreSold && (
                        <div style={{position:'absolute',top:0,right:0,background:'#1a3060',color:'#fff',fontSize:'6px',fontWeight:800,padding:'1px 3px',borderRadius:'0 4px 0 3px',letterSpacing:'0.04em'}}>PRE</div>
                    )}
                </div>
            </td>
            {/* Group / Venue */}
            <td style={{padding:'5px 8px', minWidth:'100px', maxWidth:'130px'}}>
                <div style={{fontSize:'10px', color:'#64748b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{headerLine || '—'}</div>
            </td>
            {/* Name */}
            <td style={{padding:'5px 8px', minWidth:'120px'}}>
                <div style={{fontSize:'12px', fontWeight:700, color:'#0f172a', whiteSpace:'nowrap'}}>{nameLine || '—'}</div>
                {(vehicle.modelDescription || vehicle['Description'] || vehicle['description']) && (
                    <div style={{fontSize:'10px', color:'#94a3b8'}}>
                        {vehicle.modelDescription || vehicle['Description'] || vehicle['description']}
                    </div>
                )}
            </td>
            {/* Dynamic fields — all fields with showOnCard enabled */}
            {entries.map((e, i) => {
                // Only normalize case if the value is all-caps text (not a code/number)
                const isAllCaps = e.value === e.value.toUpperCase() && /[A-Z]{2,}/.test(e.value)
                const display = isAllCaps
                    ? e.value.charAt(0).toUpperCase() + e.value.slice(1).toLowerCase()
                    : e.value
                return (
                    <td key={i} style={{padding:'5px 8px', minWidth:'70px'}}>
                        <div style={{fontSize:'11px', fontWeight:600, color:'#1e293b', whiteSpace:'nowrap'}}>{display}</div>
                    </td>
                )
            })}
            {/* Pad missing cells */}
            {entries.length < 5 && Array.from({length: 5 - entries.length}).map((_, i) => (
                <td key={`pad-${i}`} style={{padding:'5px 8px'}} />
            ))}            {/* Status */}
            <td style={{padding:'5px 8px', width:'72px'}}>
                <div style={{display:'flex', flexDirection:'column', gap:'1px'}}>
                    {activeAlloc && <span style={{fontSize:'9px', fontWeight:700, color:'#dc2626', background:'#fff1f1', padding:'1px 5px', borderRadius:'999px', display:'inline-block'}}>{activeAlloc}</span>}
                    {rikuso && <span style={{fontSize:'9px', fontWeight:700, color:'#dc2626', background:'#fff1f1', padding:'1px 5px', borderRadius:'999px', display:'inline-block'}}>Rikso</span>}
                    {!activeAlloc && !rikuso && <span style={{fontSize:'9px', color:'#cbd5e1'}}>—</span>}
                </div>
            </td>
            {/* Date */}
            <td style={{padding:'5px 8px', width:'72px', whiteSpace:'nowrap'}}>
                <div style={{fontSize:'10px', color:'#94a3b8'}}>{footerDate}</div>
            </td>
            {/* Actions */}
            <td style={{padding:'5px 8px', width:'60px'}} onClick={e => e.stopPropagation()}>
                <div style={{display:'flex', gap:'4px'}}>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(vehicle._id) }}
                        title="Delete"
                        style={{width:'24px',height:'24px',borderRadius:'5px',border:'1px solid #fecaca',background:'#fff5f5',color:'#dc2626',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,transition:'all 0.12s'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='#dc2626';e.currentTarget.style.color='#fff'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='#fff5f5';e.currentTarget.style.color='#dc2626'}}
                    >
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                    <Link
                        href={`/admin/vehicles/edit/${vehicle._id}`}
                        onClick={e => e.stopPropagation()}
                        title="Edit"
                        style={{width:'24px',height:'24px',borderRadius:'5px',border:'1px solid #bfdbfe',background:'#eff6ff',color:'#2563eb',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.12s'}}
                        onMouseEnter={e=>{e.currentTarget.style.background='#2563eb';e.currentTarget.style.color='#fff'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='#eff6ff';e.currentTarget.style.color='#2563eb'}}
                    >
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </Link>
                </div>
            </td>
        </tr>
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
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 25

    // Restore view mode from cookie
    useEffect(() => {
        const saved = getCookie('vehicles_view')
        if (saved === 'list' || saved === 'grid') setViewMode(saved)
    }, [])

    const switchView = (mode) => {
        setViewMode(mode)
        setCookie('vehicles_view', mode)
    }

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

    const filtered = vehicles.filter(v =>
        !search || JSON.stringify(v).toLowerCase().includes(search.toLowerCase())
    )

    // Reset to page 1 when search or view changes
    React.useEffect(() => { setPage(1) }, [search, viewMode])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

    const btnStyle = (active) => ({
        width:'32px', height:'32px', borderRadius:'6px', border: active ? '1px solid var(--accent)' : '1px solid #e2e8f0',
        background: active ? 'var(--accent-light)' : '#fff', color: active ? 'var(--accent)' : '#6b7280',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s'
    })

    return (
        <div className="px-5 py-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="font-medium" style={{fontSize:'var(--text-2xl)', color:'#202124'}}>Vehicle Management</h1>
                    <span style={{fontSize:'var(--text-xs)', color:'#5f6368'}}>
                        {loading ? '…' : `${filtered.length} vehicles`}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div style={{display:'flex', gap:'2px', padding:'2px', background:'#f1f3f4', borderRadius:'8px'}}>
                        <button onClick={() => switchView('grid')} title="Grid view"
                            style={{width:'30px', height:'30px', borderRadius:'6px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                                background: viewMode==='grid' ? '#fff' : 'transparent',
                                color: viewMode==='grid' ? '#1a73e8' : '#5f6368',
                                boxShadow: viewMode==='grid' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                            }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                            </svg>
                        </button>
                        <button onClick={() => switchView('list')} title="List view"
                            style={{width:'30px', height:'30px', borderRadius:'6px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                                background: viewMode==='list' ? '#fff' : 'transparent',
                                color: viewMode==='list' ? '#1a73e8' : '#5f6368',
                                boxShadow: viewMode==='list' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                            }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                            </svg>
                        </button>
                    </div>
                    <Link href="/admin/vehicles/add"
                        className="flex items-center gap-1.5"
                        style={{padding:'8px 16px', borderRadius:'20px', background:'var(--accent)', color:'#fff', fontSize:'var(--text-sm)', fontWeight:500, textDecoration:'none'}}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Vehicle
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'#9aa0a6'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{paddingLeft:'32px', fontSize:'var(--text-sm)'}} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{borderColor:'#e8f0fe', borderTopColor:'var(--accent)'}}></div>
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
            ) : viewMode === 'grid' ? (
                <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))'}}>
                    {filtered.map(v => (
                        <VehicleCard key={v._id} vehicle={v} fields={fields} onView={setSelected} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div style={{background:'#fff', borderRadius:'8px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
                        <table style={{width:'100%', borderCollapse:'collapse', tableLayout:'auto'}}>
                            <thead>
                                <tr style={{borderBottom:'2px solid #f0f4f8', background:'#f8fafc'}}>
                                    <th style={{padding:'7px 8px', width:'48px'}}></th>
                                    <th style={{padding:'7px 8px', textAlign:'left', fontSize:'11px', fontWeight:600, color:'#64748b'}}>Group / Venue</th>
                                    <th style={{padding:'7px 8px', textAlign:'left', fontSize:'11px', fontWeight:600, color:'#64748b'}}>Vehicle</th>
                                    {fields.filter(f => f.showOnCard !== false && f.belongsto === 'add-vehicles').sort((a,b)=>(a.order??0)-(b.order??0)).map(f => (
                                        <th key={f._id} style={{padding:'7px 8px', textAlign:'left', fontSize:'11px', fontWeight:600, color:'#64748b', whiteSpace:'nowrap'}}>{f.label}</th>
                                    ))}
                                    <th style={{padding:'7px 8px', textAlign:'left', fontSize:'11px', fontWeight:600, color:'#64748b'}}>Status</th>
                                    <th style={{padding:'7px 8px', textAlign:'left', fontSize:'11px', fontWeight:600, color:'#64748b'}}>Date</th>
                                    <th style={{padding:'7px 8px', width:'60px'}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(v => (
                                    <VehicleRow key={v._id} vehicle={v} fields={fields} onView={setSelected} onDelete={handleDelete} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 4px', marginTop:'8px'}}>
                            <span style={{fontSize:'12px', color:'#64748b'}}>
                                Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div style={{display:'flex', gap:'3px'}}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p-1))}
                                    disabled={page === 1}
                                    style={{padding:'4px 10px', borderRadius:'5px', border:'1px solid #e2e8f0', background: page===1?'#f8fafc':'#fff', color: page===1?'#cbd5e1':'#374151', cursor: page===1?'not-allowed':'pointer', fontSize:'12px', fontWeight:600}}
                                >‹ Prev</button>
                                {Array.from({length: totalPages}, (_, i) => i+1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && p - arr[i-1] > 1) acc.push('...')
                                        acc.push(p)
                                        return acc
                                    }, [])
                                    .map((p, i) => p === '...'
                                        ? <span key={`e${i}`} style={{padding:'4px 6px', color:'#94a3b8', fontSize:'12px'}}>…</span>
                                        : <button key={p} onClick={() => setPage(p)}
                                            style={{padding:'4px 9px', borderRadius:'5px', border:'1px solid', fontSize:'12px', fontWeight:600, cursor:'pointer',
                                                borderColor: p===page?'var(--accent)':'#e2e8f0',
                                                background: p===page?'var(--accent-light)':'#fff',
                                                color: p===page?'var(--accent)':'#374151'}}
                                          >{p}</button>
                                    )
                                }
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p+1))}
                                    disabled={page === totalPages}
                                    style={{padding:'4px 10px', borderRadius:'5px', border:'1px solid #e2e8f0', background: page===totalPages?'#f8fafc':'#fff', color: page===totalPages?'#cbd5e1':'#374151', cursor: page===totalPages?'not-allowed':'pointer', fontSize:'12px', fontWeight:600}}
                                >Next ›</button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {selected && <DetailModal vehicle={selected} fields={fields} onClose={() => setSelected(null)} onDelete={handleDelete} />}
        </div>
    )
}

export default Page
