'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

const PRESET_COLORS = [
    '#ffffff', '#f44336', '#e91e63', '#9c27b0',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#4caf50', '#8bc34a', '#ffeb3b', '#ff9800',
    '#795548', '#607d8b', '#000000',
]

let overlayId = 0
function makeOverlay(partial) {
    return { id: ++overlayId, x: 100, y: 100, rotation: 0, ...partial }
}

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

    const [overlays, setOverlays] = useState([])
    const [selectedOverlayId, setSelectedOverlayId] = useState(null)
    const [overlayTool, setOverlayTool] = useState(null)
    const [textInput, setTextInput] = useState('')

    const drawing = useRef(false)
    const lastPt = useRef(null)
    const bgImageObj = useRef(null)
    const overlayDrag = useRef(null)

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

        setUndoStack([])
        setRedoStack([])
        setReady(true)
    }, [src])

    useEffect(() => { loadOriginal() }, [loadOriginal])

    const redraw = useCallback(() => {
        const w = W.current, h = H.current
        const previewC = previewCanvasRef.current
        const displayC = displayRef.current
        const origC = origCanvasRef.current
        const maskC = maskCanvasRef.current
        if (!previewC || !displayC || !origC || !maskC || !w) return

        // --- Preview canvas: bg + masked original + overlays ---
        const pCtx = previewC.getContext('2d')
        pCtx.clearRect(0, 0, w, h)

        // Background
        if (bgMode === 'color') {
            pCtx.fillStyle = bgColor
            pCtx.fillRect(0, 0, w, h)
        } else if (bgMode === 'image' && bgImageObj.current) {
            const bi = bgImageObj.current
            const scale = Math.max(w / bi.naturalWidth, h / bi.naturalHeight)
            const dw = bi.naturalWidth * scale, dh = bi.naturalHeight * scale
            pCtx.drawImage(bi, (w - dw) / 2, (h - dh) / 2, dw, dh)
        }

        // Masked original (temp canvas)
        const tmpC = document.createElement('canvas')
        tmpC.width = w; tmpC.height = h
        const tmpCtx = tmpC.getContext('2d')
        tmpCtx.drawImage(origC, 0, 0)
        tmpCtx.globalCompositeOperation = 'destination-in'
        tmpCtx.drawImage(maskC, 0, 0)
        tmpCtx.globalCompositeOperation = 'source-over'
        pCtx.drawImage(tmpC, 0, 0)

        // Overlays
        overlays.forEach(ov => {
            pCtx.save()
            pCtx.translate(ov.x + (ov.w || 0) / 2, ov.y + (ov.h || 0) / 2)
            pCtx.rotate((ov.rotation || 0) * Math.PI / 180)
            if (ov.type === 'image' && ov.imgObj) {
                pCtx.drawImage(ov.imgObj, -(ov.w || 0) / 2, -(ov.h || 0) / 2, ov.w || 0, ov.h || 0)
            } else if (ov.type === 'text') {
                pCtx.font = `${ov.bold ? 'bold ' : ''}${ov.fontSize || 24}px ${ov.fontFamily || 'sans-serif'}`
                pCtx.fillStyle = ov.color || '#ffffff'
                pCtx.textAlign = 'center'
                pCtx.textBaseline = 'middle'
                if (ov.stroke) {
                    pCtx.strokeStyle = ov.strokeColor || '#000000'
                    pCtx.lineWidth = ov.strokeWidth || 2
                    pCtx.strokeText(ov.text || '', 0, 0)
                }
                pCtx.fillText(ov.text || '', 0, 0)
            }
            pCtx.restore()
        })

        // Selection handles on preview
        const sel = overlays.find(o => o.id === selectedOverlayId)
        if (sel && !showOriginal) {
            pCtx.save()
            pCtx.translate(sel.x + (sel.w || 0) / 2, sel.y + (sel.h || 0) / 2)
            pCtx.rotate((sel.rotation || 0) * Math.PI / 180)
            const hw = (sel.w || 0) / 2, hh = (sel.h || 0) / 2
            pCtx.strokeStyle = '#818cf8'
            pCtx.lineWidth = 2
            pCtx.setLineDash([6, 4])
            pCtx.strokeRect(-hw, -hh, hw * 2, hh * 2)
            pCtx.setLineDash([])
            // Resize handles
            const hs = 8
            ;[[-hw, -hh], [hw, -hh], [-hw, hh], [hw, hh]].forEach(([cx, cy]) => {
                pCtx.fillStyle = '#fff'
                pCtx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs)
                pCtx.strokeStyle = '#818cf8'
                pCtx.strokeRect(cx - hs / 2, cy - hs / 2, hs, hs)
            })
            // Rotate handle
            pCtx.beginPath()
            pCtx.moveTo(0, -hh)
            pCtx.lineTo(0, -hh - 28)
            pCtx.strokeStyle = '#818cf8'
            pCtx.lineWidth = 2
            pCtx.stroke()
            pCtx.beginPath()
            pCtx.arc(0, -hh - 28, 6, 0, Math.PI * 2)
            pCtx.fillStyle = '#818cf8'
            pCtx.fill()
            pCtx.restore()
        }

        // --- Display canvas: checkerboard + preview ---
        displayC.width = w; displayC.height = h
        const dCtx = displayC.getContext('2d')

        if (showOriginal) {
            dCtx.drawImage(origC, 0, 0)
            return
        }

        const sz = 10
        for (let y = 0; y < h; y += sz) {
            for (let x = 0; x < w; x += sz) {
                dCtx.fillStyle = ((x / sz + y / sz) % 2 === 0) ? '#888' : '#aaa'
                dCtx.fillRect(x, y, sz, sz)
            }
        }
        dCtx.drawImage(previewC, 0, 0)
    }, [bgMode, bgColor, overlays, selectedOverlayId, showOriginal])

    useEffect(() => { redraw() }, [redraw, ready])

    useEffect(() => {
        if (bgMode === 'image' && bgImageFile) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = URL.createObjectURL(bgImageFile)
            img.onload = () => { bgImageObj.current = img; redraw() }
        } else {
            bgImageObj.current = null
            redraw()
        }
    }, [bgMode, bgImageFile, redraw])

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
                if (hard >= 0.99) strength = 1
                else if (norm <= hard) strength = 1
                else strength = 1 - (norm - hard) / (1 - hard)

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
        redraw()
    }, [tool, brushSize, hardness, redraw])

    const handlePointerDown = useCallback((e) => {
        if (e.button && e.button !== 0) return
        const pt = getCanvasPoint(e)
        if (!pt) return

        if (overlayTool === 'image' || overlayTool === 'text') {
            if (overlayTool === 'text' && textInput.trim()) {
                const ov = makeOverlay({
                    type: 'text', text: textInput.trim(),
                    x: pt.x - 60, y: pt.y - 15, w: 120, h: 30,
                    fontSize: 24, color: '#ffffff', fontFamily: 'sans-serif',
                    bold: false, stroke: true, strokeColor: '#000000', strokeWidth: 2,
                })
                setOverlays(prev => [...prev, ov])
                setSelectedOverlayId(ov.id)
                setOverlayTool(null)
                setTextInput('')
            }
            return
        }

        if (tool === 'erase' || tool === 'restore') {
            drawing.current = true
            lastPt.current = null
            saveMaskState()
            stampBrush(pt.x, pt.y)
            lastPt.current = pt
            return
        }

        // Check if clicking on an overlay
        const clickedOverlay = [...overlays].reverse().find(ov => {
            const cx = ov.x + (ov.w || 0) / 2
            const cy = ov.y + (ov.h || 0) / 2
            const rad = -(ov.rotation || 0) * Math.PI / 180
            const dx = pt.x - cx, dy = pt.y - cy
            const rx = dx * Math.cos(rad) - dy * Math.sin(rad)
            const ry = dx * Math.sin(rad) + dy * Math.cos(rad)
            return Math.abs(rx) <= (ov.w || 0) / 2 && Math.abs(ry) <= (ov.h || 0) / 2
        })

        if (clickedOverlay) {
            setSelectedOverlayId(clickedOverlay.id)

            const cx = clickedOverlay.x + (clickedOverlay.w || 0) / 2
            const cy = clickedOverlay.y + (clickedOverlay.h || 0) / 2
            const rad = -(clickedOverlay.rotation || 0) * Math.PI / 180
            const dx = pt.x - cx, dy = pt.y - cy
            const rx = dx * Math.cos(rad) - dy * Math.sin(rad)
            const ry = dx * Math.sin(rad) + dy * Math.cos(rad)
            const hw = (clickedOverlay.w || 0) / 2, hh = (clickedOverlay.h || 0) / 2

            // Check rotate handle (circle at top center)
            const rotDx = rx, rotDy = ry + hh + 28
            if (Math.sqrt(rotDx * rotDx + rotDy * rotDy) <= 12) {
                overlayDrag.current = {
                    id: clickedOverlay.id, mode: 'rotate',
                    startAngle: Math.atan2(pt.x - cx, pt.y - cy),
                    origRotation: clickedOverlay.rotation || 0,
                }
            }
            // Check corner resize handles
            else {
                const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
                const cornerNames = ['nw', 'ne', 'sw', 'se']
                const hs = 8
                let foundCorner = null
                for (let i = 0; i < corners.length; i++) {
                    const [sx, sy] = corners[i]
                    const hx = sx * hw, hy = sy * hh
                    if (Math.abs(rx - hx) <= hs && Math.abs(ry - hy) <= hs) {
                        foundCorner = cornerNames[i]
                        break
                    }
                }

                if (foundCorner) {
                    overlayDrag.current = {
                        id: clickedOverlay.id, mode: 'resize-' + foundCorner,
                        startX: pt.x, startY: pt.y,
                        origW: clickedOverlay.w || 0, origH: clickedOverlay.h || 0,
                        origX: clickedOverlay.x, origY: clickedOverlay.y,
                        origRotation: clickedOverlay.rotation || 0,
                    }
                } else {
                    overlayDrag.current = {
                        id: clickedOverlay.id, mode: 'move',
                        startX: pt.x, startY: pt.y,
                        origX: clickedOverlay.x, origY: clickedOverlay.y,
                    }
                }
            }
        } else {
            setSelectedOverlayId(null)
        }
    }, [tool, overlayTool, textInput, overlays, getCanvasPoint, saveMaskState, stampBrush])

    const handlePointerMove = useCallback((e) => {
        const pt = getCanvasPoint(e)
        if (!pt) return

        if (drawing.current) {
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
            return
        }

        if (overlayDrag.current) {
            const d = overlayDrag.current
            const dx = pt.x - d.startX
            const dy = pt.y - d.startY

            if (d.mode === 'move') {
                setOverlays(prev => prev.map(o => o.id === d.id ? { ...o, x: d.origX + dx, y: d.origY + dy } : o))
            } else if (d.mode === 'rotate') {
                const ov = overlays.find(o => o.id === d.id)
                if (!ov) return
                const cx = ov.x + (ov.w || 0) / 2
                const cy = ov.y + (ov.h || 0) / 2
                const angle = Math.atan2(pt.x - cx, pt.y - cy)
                const delta = ((angle - d.startAngle) * 180) / Math.PI
                setOverlays(prev => prev.map(o => o.id === d.id ? { ...o, rotation: d.origRotation - delta } : o))
            } else if (d.mode.startsWith('resize-')) {
                const ov = overlays.find(o => o.id === d.id)
                if (!ov) return
                const cx = ov.x + (ov.w || 0) / 2
                const cy = ov.y + (ov.h || 0) / 2
                const rad = -(d.origRotation || 0) * Math.PI / 180
                const rdx = dx * Math.cos(rad) - dy * Math.sin(rad)
                const rdy = dx * Math.sin(rad) + dy * Math.cos(rad)

                const corner = d.mode.replace('resize-', '')
                const sx = corner.includes('e') ? 1 : -1
                const sy = corner.includes('s') ? 1 : -1
                const aspect = d.origW / d.origH
                const deltaW = rdx * sx + rdy * sy
                const newW = Math.max(20, d.origW + deltaW)
                const newH = newW / aspect

                // Adjust position: when dragging left/up, anchor the opposite corner
                const newX = sx < 0 ? d.origX + (d.origW - newW) : d.origX
                const newY = sy < 0 ? d.origY + (d.origH - newH) : d.origY

                setOverlays(prev => prev.map(o => o.id === d.id ? { ...o, w: newW, h: newH, x: newX, y: newY } : o))
            }
        }
    }, [getCanvasPoint, brushSize, stampBrush])

    const handlePointerUp = useCallback((e) => {
        if (drawing.current) {
            drawing.current = false
            lastPt.current = null
            return
        }

        if (overlayDrag.current) {
            overlayDrag.current = null
            return
        }
    }, [])

    const handleOverlayDoubleClick = useCallback((e) => {
        const pt = getCanvasPoint(e)
        if (!pt) return
        const clicked = [...overlays].reverse().find(ov => {
            const cx = ov.x + (ov.w || 0) / 2
            const cy = ov.y + (ov.h || 0) / 2
            const rad = -(ov.rotation || 0) * Math.PI / 180
            const dx = pt.x - cx, dy = pt.y - cy
            const rx = dx * Math.cos(rad) - dy * Math.sin(rad)
            const ry = dx * Math.sin(rad) + dy * Math.cos(rad)
            return Math.abs(rx) <= (ov.w || 0) / 2 && Math.abs(ry) <= (ov.h || 0) / 2
        })
        if (clicked && clicked.type === 'text') {
            const newText = prompt('Edit text:', clicked.text)
            if (newText !== null) {
                setOverlays(prev => prev.map(o => o.id === clicked.id ? { ...o, text: newText } : o))
            }
        }
    }, [overlays, getCanvasPoint])

    const handlePointerWheel = useCallback((e) => {
        if (!overlayDrag.current) return
        e.preventDefault()
        const d = overlayDrag.current
        const ov = overlays.find(o => o.id === d.id)
        if (!ov) return
        const delta = e.deltaY > 0 ? -5 : 5
        setOverlays(prev => prev.map(o => o.id === d.id ? { ...o, rotation: (o.rotation || 0) + delta } : o))
    }, [overlays])

    const undo = useCallback(() => {
        setUndoStack(prev => {
            if (prev.length === 0) return prev
            const next = prev.slice(0, -1)
            const current = prev[prev.length - 1]
            setRedoStack(rp => [...rp, maskCanvasRef.current.getContext('2d').getImageData(0, 0, W.current, H.current)])
            maskCanvasRef.current.getContext('2d').putImageData(current, 0, 0)
            redraw()
            return next
        })
    }, [redraw])

    const redo = useCallback(() => {
        setRedoStack(prev => {
            if (prev.length === 0) return prev
            const next = prev.slice(0, -1)
            const current = prev[prev.length - 1]
            setUndoStack(up => [...up, maskCanvasRef.current.getContext('2d').getImageData(0, 0, W.current, H.current)])
            maskCanvasRef.current.getContext('2d').putImageData(current, 0, 0)
            redraw()
            return next
        })
    }, [redraw])

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
            redraw()
        } catch (err) {
            console.error('Auto remove failed:', err)
            alert('Background removal failed. Try again.')
        } finally {
            setProcessing(false)
        }
    }, [src, saveMaskState, redraw])

    const handleAddImageOverlay = useCallback(() => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const img = new Image()
            img.src = URL.createObjectURL(file)
            img.onload = () => {
                const maxW = W.current * 0.5
                const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1
                const w = img.naturalWidth * scale
                const h = img.naturalHeight * scale
                const ov = makeOverlay({
                    type: 'image', imgObj: img, imgSrc: img.src,
                    x: (W.current - w) / 2, y: (H.current - h) / 2, w, h,
                })
                setOverlays(prev => [...prev, ov])
                setSelectedOverlayId(ov.id)
            }
        }
        input.click()
    }, [])

    const handleExport = useCallback(() => {
        const w = W.current, h = H.current
        redraw()
        setTimeout(() => {
            previewCanvasRef.current.toBlob((blob) => {
                if (blob) onConfirm(blob)
            }, 'image/png')
        }, 50)
    }, [onConfirm, redraw])

    const deleteSelectedOverlay = useCallback(() => {
        if (!selectedOverlayId) return
        setOverlays(prev => prev.filter(o => o.id !== selectedOverlayId))
        setSelectedOverlayId(null)
    }, [selectedOverlayId])

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedOverlayId && document.activeElement === document.body) {
                    e.preventDefault()
                    deleteSelectedOverlay()
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose, undo, redo, selectedOverlayId, deleteSelectedOverlay])

    const isBrush = tool === 'erase' || tool === 'restore'

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100, display: 'flex', flexDirection: 'column', userSelect: 'none', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Top toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', background: '#16161e', borderBottom: '1px solid #2a2a3a', flexWrap: 'wrap' }}>
                <ToolBtn icon="auto" active={tool === 'auto'} onClick={handleAutoRemove} disabled={processing} label="Auto Remove" />
                <ToolBtn icon="erase" active={tool === 'erase'} onClick={() => { setTool('erase'); setOverlayTool(null) }} label="Erase" />
                <ToolBtn icon="restore" active={tool === 'restore'} onClick={() => { setTool('restore'); setOverlayTool(null) }} label="Restore" />

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

                <ToolBtn icon="plus" onClick={handleAddImageOverlay} label="Add Image" />
                <ToolBtn icon="text" active={overlayTool === 'text'} onClick={() => { setOverlayTool(overlayTool === 'text' ? null : 'text'); setTool('select') }} label="Add Text" />

                {selectedOverlayId && (
                    <>
                        <Sep />
                        <ToolBtn icon="trash" onClick={deleteSelectedOverlay} label="Delete" />
                    </>
                )}

                <Sep />

                <ToolBtn icon="eye" active={showOriginal} onClick={() => setShowOriginal(s => !s)} label={showOriginal ? 'Original' : 'Preview'} />
                <ToolBtn icon="undo" onClick={undo} disabled={undoStack.length === 0} label="Undo" />
                <ToolBtn icon="redo" onClick={redo} disabled={redoStack.length === 0} label="Redo" />

                <Sep />

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ToolBtn icon="minus" onClick={() => setZoom(z => Math.max(0.1, z - 0.25))} />
                    <span style={{ color: '#bbb', fontSize: '11px', minWidth: '34px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                    <ToolBtn icon="plus2" onClick={() => setZoom(z => Math.min(5, z + 0.25))} />
                </div>
            </div>

            {/* Text input bar */}
            {overlayTool === 'text' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#1e1e2e', borderBottom: '1px solid #2a2a3a' }}>
                    <span style={{ color: '#888', fontSize: '11px' }}>Type text, then click canvas to place:</span>
                    <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && textInput.trim()) { handlePointerDown(e) } }}
                        autoFocus placeholder="Your text here..."
                        style={{ flex: 1, maxWidth: '300px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #333', background: '#222', color: '#fff', fontSize: '13px', outline: 'none' }} />
                    <button onClick={() => { setOverlayTool(null); setTextInput('') }}
                        style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', background: '#333', color: '#888', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                </div>
            )}

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
                            cursor: isBrush ? 'none' : overlayTool === 'text' ? 'crosshair' : 'default',
                        }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerUp}
                            onDoubleClick={handleOverlayDoubleClick}
                            onWheel={handlePointerWheel}
                        />
                        {isBrush && (
                            <BrushCursor canvasRef={displayRef} size={brushSize} tool={tool} />
                        )}
                    </div>
                )}
            </div>

            {/* Bottom bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#16161e', borderTop: '1px solid #2a2a3a', gap: '12px', flexWrap: 'wrap' }}>
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
        plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
        plus2: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>,
        text: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>,
        trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
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
