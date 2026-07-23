'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

const PRESET_COLORS = [
    '#ffffff', '#f44336', '#e91e63', '#9c27b0',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#4caf50', '#8bc34a', '#ffeb3b', '#ff9800',
    '#795548', '#607d8b', '#000000',
]

export default function BgEditorModal({ src, onConfirm, onClose }) {
    const displayRef = useRef(null)
    const maskCanvasRef = useRef(null)
    const origCanvasRef = useRef(null)
    const previewCanvasRef = useRef(null)

    const [tool, setTool] = useState('auto')
    const [brushSize, setBrushSize] = useState(30)
    const [hardness, setHardness] = useState(0.5)
    const [bgMode, setBgMode] = useState('transparent')
    const [bgColor, setBgColor] = useState('#ffffff')
    const [bgImageFile, setBgImageFile] = useState(null)
    const [showOriginal, setShowOriginal] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [ready, setReady] = useState(false)
    const [undoStack, setUndoStack] = useState([])
    const [redoStack, setRedoStack] = useState([])
    const [zoom, setZoom] = useState(1)
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 })

    const drawing = useRef(false)
    const lastPt = useRef(null)
    const bgImageObj = useRef(null)

    const W = useRef(0)
    const H = useRef(0)

    const loadOriginal = useCallback(async () => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = typeof src === 'string' ? src : URL.createObjectURL(src)
        await new Promise((r, e) => { img.onload = r; img.onerror = e })

        let w = img.naturalWidth, h = img.naturalHeight
        const maxDim = 2000
        if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h)
            w = Math.round(w * ratio); h = Math.round(h * ratio)
        }
        W.current = w; H.current = h

        const origC = document.createElement('canvas')
        origC.width = w; origC.height = h
        origC.getContext('2d').drawImage(img, 0, 0, w, h)
        origCanvasRef.current = origC

        const maskC = document.createElement('canvas')
        maskC.width = w; maskC.height = h
        const mCtx = maskC.getContext('2d')
        const maskData = mCtx.createImageData(w, h)
        for (let i = 3; i < maskData.data.length; i += 4) maskData.data[i] = 255
        mCtx.putImageData(maskData, 0, 0)
        maskCanvasRef.current = maskC

        const previewC = document.createElement('canvas')
        previewC.width = w; previewC.height = h
        previewCanvasRef.current = previewC

        setImgSize({ w, h })
        setUndoStack([])
        setRedoStack([])
        setReady(true)
    }, [src])

    useEffect(() => { loadOriginal() }, [loadOriginal])

    const compositeToPreview = useCallback(() => {
        const w = W.current, h = H.current
        const previewC = previewCanvasRef.current
        const origC = origCanvasRef.current
        const maskC = maskCanvasRef.current
        if (!previewC || !origC || !maskC || !w) return

        // Step 1: mask the original onto a temp canvas (original * mask alpha)
        const tmpC = document.createElement('canvas')
        tmpC.width = w; tmpC.height = h
        const tmpCtx = tmpC.getContext('2d')
        tmpCtx.drawImage(origC, 0, 0)
        tmpCtx.globalCompositeOperation = 'destination-in'
        tmpCtx.drawImage(maskC, 0, 0)
        tmpCtx.globalCompositeOperation = 'source-over'

        // Step 2: draw background, then masked original on top
        const ctx = previewC.getContext('2d')
        ctx.clearRect(0, 0, w, h)

        if (bgMode === 'color') {
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, w, h)
        } else if (bgMode === 'image' && bgImageObj.current) {
            const bi = bgImageObj.current
            const scale = Math.max(w / bi.naturalWidth, h / bi.naturalHeight)
            const dw = bi.naturalWidth * scale, dh = bi.naturalHeight * scale
            ctx.drawImage(bi, (w - dw) / 2, (h - dh) / 2, dw, dh)
        }

        // Layer masked original on top (transparent bg shows through where mask = 0)
        ctx.drawImage(tmpC, 0, 0)
    }, [bgMode, bgColor])

    const compositeToDisplay = useCallback(() => {
        const displayC = displayRef.current
        const previewC = previewCanvasRef.current
        const w = W.current, h = H.current
        if (!displayC || !previewC || !w) return
        displayC.width = w; displayC.height = h
        const ctx = displayC.getContext('2d')

        if (showOriginal) {
            ctx.drawImage(origCanvasRef.current, 0, 0)
            return
        }

        const sz = 10
        for (let y = 0; y < h; y += sz) {
            for (let x = 0; x < w; x += sz) {
                ctx.fillStyle = ((x / sz + y / sz) % 2 === 0) ? '#888' : '#aaa'
                ctx.fillRect(x, y, sz, sz)
            }
        }

        ctx.drawImage(previewC, 0, 0)
    }, [showOriginal])

    useEffect(() => {
        compositeToPreview()
        compositeToDisplay()
    }, [compositeToPreview, compositeToDisplay, ready])

    useEffect(() => {
        if (bgMode === 'image' && bgImageFile) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = URL.createObjectURL(bgImageFile)
            img.onload = () => { bgImageObj.current = img; compositeToPreview(); compositeToDisplay() }
        } else {
            bgImageObj.current = null
            compositeToPreview()
            compositeToDisplay()
        }
    }, [bgMode, bgImageFile, compositeToPreview, compositeToDisplay])

    const saveMaskState = useCallback(() => {
        const maskC = maskCanvasRef.current
        if (!maskC) return
        const data = maskC.getContext('2d').getImageData(0, 0, W.current, H.current)
        setUndoStack(prev => [...prev, data])
        setRedoStack([])
    }, [])

    const getCanvasPoint = useCallback((e) => {
        const c = displayRef.current
        if (!c) return null
        const rect = c.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        return {
            x: (clientX - rect.left) * (W.current / rect.width),
            y: (clientY - rect.top) * (H.current / rect.height)
        }
    }, [])

    const stampBrush = useCallback((cx, cy) => {
        const w = W.current, h = H.current
        const maskC = maskCanvasRef.current
        const origC = origCanvasRef.current
        if (!maskC || !origC) return
        const mCtx = maskC.getContext('2d')
        const maskData = mCtx.getImageData(0, 0, w, h)
        const origCtx = origC.getContext('2d')
        const origData = origCtx.getImageData(0, 0, w, h)
        const isErase = tool === 'erase'
        const radius = brushSize / 2
        const hard = hardness

        const x0 = Math.max(0, Math.floor(cx - radius))
        const y0 = Math.max(0, Math.floor(cy - radius))
        const x1 = Math.min(w, Math.ceil(cx + radius))
        const y1 = Math.min(h, Math.ceil(cy + radius))

        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                const dx = x - cx, dy = y - cy
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist > radius) continue
                const norm = dist / radius
                let strength
                if (hard >= 0.99) {
                    strength = 1
                } else if (norm <= hard) {
                    strength = 1
                } else {
                    strength = 1 - (norm - hard) / (1 - hard)
                }

                const mi = (y * w + x) * 4 + 3
                if (isErase) {
                    maskData.data[mi] = Math.max(0, Math.round(maskData.data[mi] * (1 - strength)))
                } else {
                    const origAlpha = origData.data[(y * w + x) * 4 + 3]
                    maskData.data[mi] = Math.min(255, Math.round(maskData.data[mi] + origAlpha * strength))
                }
            }
        }
        mCtx.putImageData(maskData, 0, 0)
        compositeToPreview()
        compositeToDisplay()
    }, [tool, brushSize, hardness, compositeToPreview, compositeToDisplay])

    const handlePointerDown = useCallback((e) => {
        if (tool !== 'erase' && tool !== 'restore') return
        drawing.current = true
        lastPt.current = null
        saveMaskState()
        const pt = getCanvasPoint(e)
        if (pt) {
            stampBrush(pt.x, pt.y)
            lastPt.current = pt
        }
    }, [tool, getCanvasPoint, stampBrush, saveMaskState])

    const handlePointerMove = useCallback((e) => {
        if (!drawing.current) return
        const pt = getCanvasPoint(e)
        if (!pt) return
        if (lastPt.current) {
            const dx = pt.x - lastPt.current.x
            const dy = pt.y - lastPt.current.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const step = Math.max(1, brushSize * 0.15)
            const steps = Math.ceil(dist / step)
            for (let i = 1; i <= steps; i++) {
                stampBrush(
                    lastPt.current.x + (dx * i) / steps,
                    lastPt.current.y + (dy * i) / steps
                )
            }
        }
        lastPt.current = pt
    }, [getCanvasPoint, stampBrush, brushSize])

    const handlePointerUp = useCallback(() => {
        drawing.current = false
        lastPt.current = null
    }, [])

    const undo = useCallback(() => {
        setUndoStack(prev => {
            if (prev.length === 0) return prev
            const next = prev.slice(0, -1)
            const current = prev[prev.length - 1]
            setRedoStack(rp => [...rp, maskCanvasRef.current.getContext('2d').getImageData(0, 0, W.current, H.current)])
            maskCanvasRef.current.getContext('2d').putImageData(current, 0, 0)
            compositeToPreview()
            compositeToDisplay()
            return next
        })
    }, [compositeToPreview, compositeToDisplay])

    const redo = useCallback(() => {
        setRedoStack(prev => {
            if (prev.length === 0) return prev
            const next = prev.slice(0, -1)
            const current = prev[prev.length - 1]
            setUndoStack(up => [...up, maskCanvasRef.current.getContext('2d').getImageData(0, 0, W.current, H.current)])
            maskCanvasRef.current.getContext('2d').putImageData(current, 0, 0)
            compositeToPreview()
            compositeToDisplay()
            return next
        })
    }, [compositeToPreview, compositeToDisplay])

    const handleAutoRemove = useCallback(async () => {
        setProcessing(true)
        try {
            const { removeBackground } = await import('@imgly/background-removal')
            const inputBlob = typeof src === 'string' ? await (await fetch(src)).blob() : src
            const blob = await removeBackground(inputBlob)
            const bmp = await createImageBitmap(blob)
            const w = W.current, h = H.current
            const tmpC = document.createElement('canvas')
            tmpC.width = w; tmpC.height = h
            tmpC.getContext('2d').drawImage(bmp, 0, 0, w, h)
            const result = tmpC.getContext('2d').getImageData(0, 0, w, h)

            saveMaskState()
            const maskC = maskCanvasRef.current
            const mCtx = maskC.getContext('2d')
            const maskData = mCtx.createImageData(w, h)
            for (let i = 0; i < result.data.length; i += 4) {
                maskData.data[i + 3] = result.data[i + 3] > 127 ? 255 : 0
            }
            mCtx.putImageData(maskData, 0, 0)
            compositeToPreview()
            compositeToDisplay()
        } catch (err) {
            console.error('Auto remove failed:', err)
            alert('Background removal failed. Try again.')
        } finally {
            setProcessing(false)
        }
    }, [src, saveMaskState, compositeToPreview, compositeToDisplay])

    const handleExport = useCallback(() => {
        const w = W.current, h = H.current
        compositeToPreview()
        previewCanvasRef.current.toBlob((blob) => {
            if (blob) onConfirm(blob)
        }, 'image/png')
    }, [onConfirm, compositeToPreview])

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose()
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose, undo, redo])

    const isBrush = tool === 'erase' || tool === 'restore'

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', flexDirection: 'column', userSelect: 'none', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Top toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', background: '#16161e', borderBottom: '1px solid #2a2a3a', flexWrap: 'wrap' }}>
                <ToolBtn icon="auto" active={tool === 'auto'} onClick={handleAutoRemove} disabled={processing} label="Auto Remove" />
                <ToolBtn icon="erase" active={tool === 'erase'} onClick={() => setTool('erase')} label="Erase" />
                <ToolBtn icon="restore" active={tool === 'restore'} onClick={() => setTool('restore')} label="Restore" />

                <Sep />

                {isBrush && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#888', fontSize: '11px' }}>Size</span>
                            <input type="range" min="3" max="200" value={brushSize} onChange={e => setBrushSize(+e.target.value)}
                                style={{ width: '70px', accentColor: '#818cf8' }} />
                            <span style={{ color: '#bbb', fontSize: '11px', minWidth: '22px' }}>{brushSize}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#888', fontSize: '11px' }}>Edge</span>
                            <input type="range" min="0" max="100" value={Math.round(hardness * 100)} onChange={e => setHardness(+e.target.value / 100)}
                                style={{ width: '50px', accentColor: '#818cf8' }} />
                            <span style={{ color: '#bbb', fontSize: '11px', minWidth: '28px' }}>{Math.round(hardness * 100)}%</span>
                        </div>
                        <Sep />
                    </>
                )}

                <ToolBtn icon="eye" active={showOriginal} onClick={() => setShowOriginal(s => !s)} label={showOriginal ? 'Original' : 'Preview'} />
                <ToolBtn icon="undo" onClick={undo} disabled={undoStack.length === 0} label="Undo" />
                <ToolBtn icon="redo" onClick={redo} disabled={redoStack.length === 0} label="Redo" />

                <Sep />

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ToolBtn icon="minus" onClick={() => setZoom(z => Math.max(0.1, z - 0.25))} />
                    <span style={{ color: '#bbb', fontSize: '11px', minWidth: '34px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                    <ToolBtn icon="plus" onClick={() => setZoom(z => Math.min(5, z + 0.25))} />
                </div>
            </div>

            {/* Canvas area */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d14', padding: '20px' }}>
                {processing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #333', borderTopColor: '#818cf8', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ color: '#888', fontSize: '13px' }}>Removing background — this may take a moment...</p>
                    </div>
                ) : (
                    <div style={{ position: 'relative', transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.12s' }}>
                        <canvas ref={displayRef} style={{
                            maxWidth: '80vw', maxHeight: 'calc(100vh - 180px)',
                            borderRadius: '4px',
                            cursor: isBrush ? 'none' : 'default',
                        }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                        />
                        {isBrush && (
                            <BrushCursor canvasRef={displayRef} size={brushSize} tool={tool} />
                        )}
                    </div>
                )}
            </div>

            {/* Bottom bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#16161e', borderTop: '1px solid #2a2a3a', gap: '12px', flexWrap: 'wrap' }}>
                {/* Background picker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#666', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BG</span>
                    <BgSwatch active={bgMode === 'transparent'} onClick={() => setBgMode('transparent')} title="Transparent">
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid #444', background: 'repeating-conic-gradient(#444 0% 25%, #222 0% 50%) 50%/8px 8px' }} />
                    </BgSwatch>
                    {PRESET_COLORS.map(c => (
                        <BgSwatch key={c} active={bgMode === 'color' && bgColor === c} onClick={() => { setBgMode('color'); setBgColor(c) }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: c, border: c === '#ffffff' ? '1px solid #444' : 'none' }} />
                        </BgSwatch>
                    ))}
                    <BgSwatch active={false} title="Pick color">
                        <label style={{ cursor: 'pointer', display: 'flex' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: bgColor, border: '2px dashed #666', position: 'relative' }}>
                                <input type="color" value={bgColor} onChange={e => { setBgColor(e.target.value); setBgMode('color') }}
                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                            </div>
                        </label>
                    </BgSwatch>
                    <div style={{ width: '1px', height: '18px', background: '#333' }} />
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', background: bgMode === 'image' ? '#818cf8' : '#222', color: bgMode === 'image' ? '#fff' : '#888', fontSize: '11px', fontWeight: 600, transition: 'all 0.12s' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        BG Image
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setBgImageFile(f); setBgMode('image') } }} />
                    </label>
                    {bgMode === 'image' && (
                        <button onClick={() => { setBgImageFile(null); setBgMode('transparent') }}
                            style={{ padding: '4px 8px', borderRadius: '4px', background: '#333', color: '#888', border: 'none', fontSize: '10px', cursor: 'pointer' }}>Clear</button>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={onClose}
                        style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #333', background: 'transparent', color: '#888', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                    <button onClick={handleExport} disabled={!ready || processing}
                        style={{ padding: '8px 28px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: ready ? 'pointer' : 'not-allowed', opacity: ready ? 1 : 0.5 }}>
                        Apply ✓
                    </button>
                </div>
            </div>
        </div>
    )
}

function BrushCursor({ canvasRef, size, tool }) {
    const cursorRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const move = (e) => {
            if (!cursorRef.current) return
            const rect = canvas.getBoundingClientRect()
            const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left
            const y = (e.clientY ?? e.touches?.[0]?.clientY ?? 0) - rect.top
            const scale = rect.width / canvas.width
            cursorRef.current.style.left = `${x}px`
            cursorRef.current.style.top = `${y}px`
            cursorRef.current.style.width = `${size * scale}px`
            cursorRef.current.style.height = `${size * scale}px`
            cursorRef.current.style.opacity = '1'
        }
        const leave = () => { if (cursorRef.current) cursorRef.current.style.opacity = '0' }
        canvas.addEventListener('pointermove', move)
        canvas.addEventListener('pointerleave', leave)
        return () => { canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave) }
    }, [canvasRef, size])

    return (
        <div ref={cursorRef} style={{
            position: 'absolute', pointerEvents: 'none', borderRadius: '50%',
            border: `2px solid ${tool === 'erase' ? '#f87171' : '#4ade80'}`,
            background: tool === 'erase' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
            transform: 'translate(-50%, -50%)', opacity: 0, transition: 'width 0.1s, height 0.1s, opacity 0.15s',
        }} />
    )
}

function ToolBtn({ icon, active, disabled, onClick, label }) {
    const icons = {
        auto: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
        erase: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16l9-9 8 8-4 4z"/><path d="M6.5 13.5L14.5 5.5"/></svg>,
        restore: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
        eye: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
        undo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 015 5v2"/><path d="M3 10l5-5M3 10l5 5"/></svg>,
        redo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 00-5 5v2"/><path d="M21 10l-5-5M21 10l-5 5"/></svg>,
        minus: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg>,
        plus: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>,
    }
    return (
        <button onClick={onClick} disabled={disabled} title={label}
            style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px',
                border: active ? '1px solid #818cf8' : '1px solid transparent',
                background: active ? '#818cf822' : 'transparent',
                color: active ? '#c7d2fe' : disabled ? '#333' : '#888',
                fontSize: '11px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.35 : 1, transition: 'all 0.1s',
            }}>
            {icons[icon]}
            {label && <span>{label}</span>}
        </button>
    )
}

function BgSwatch({ active, onClick, title, children }) {
    return (
        <button onClick={onClick} title={title}
            style={{
                padding: '2px', borderRadius: '4px',
                border: active ? '2px solid #818cf8' : '2px solid transparent',
                background: 'transparent', cursor: 'pointer', display: 'flex',
            }}>
            {children}
        </button>
    )
}

function Sep() {
    return <div style={{ width: '1px', height: '22px', background: '#2a2a3a', margin: '0 4px' }} />
}
