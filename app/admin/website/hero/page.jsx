'use client'
import { useState, useEffect, useRef } from 'react'
import { Page, PageHeader, Card, Btn, Field, Input, Textarea, Select, Modal, Alert, T } from '@/components/admin/ui'
import { compressImage } from '@/utils/imageCompress'

// ── blank slide template ──────────────────────────────────────────────────────
const BLANK = {
    heading: 'FIND YOUR DREAM CAR',
    headingAccent: 'DREAM CAR',
    subheading: 'DIRECT FROM JAPAN',
    badgeText: '🇯🇵 Japanese Vehicle Export Specialist',
    textColor: '#ffffff',
    overlay: 50,
    ctaText: 'Browse Our Stock',
    ctaHref: '/stock',
    active: true,
    features: [
        { icon: '🏆', text: 'Japanese Auction Direct' },
        { icon: '✅', text: 'Best Quality Vehicles' },
        { icon: '🚚', text: 'Worldwide Shipping' },
    ],
}

// ── small preview card ────────────────────────────────────────────────────────
const SlideCard = ({ slide, idx, onEdit, onDelete, onToggle, onMoveUp, onMoveDown, total }) => {
    const [hov, setHov] = useState(false)
    const bg = slide.backgroundImage
        ? `url(${slide.backgroundImage})`
        : 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)'

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                borderRadius: 10, overflow: 'hidden',
                border: `2px solid ${hov ? T.blue : T.border}`,
                boxShadow: hov ? '0 4px 16px rgba(26,115,232,0.13)' : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.18s', background: '#fff',
            }}
        >
            {/* thumbnail */}
            <div style={{
                height: 130, position: 'relative',
                backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `rgba(0,0,0,${(slide.overlay ?? 50) / 100})`,
                }} />
                <div style={{
                    position: 'absolute', inset: 0, padding: '10px 12px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    color: slide.textColor || '#fff',
                }}>
                    {slide.badgeText && (
                        <p style={{ fontSize: 9, margin: '0 0 4px', opacity: 0.85, fontWeight: 600 }}>{slide.badgeText}</p>
                    )}
                    <p style={{ fontSize: 13, fontWeight: 800, margin: 0, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                        {slide.heading || '—'}
                    </p>
                    {slide.subheading && (
                        <p style={{ fontSize: 10, margin: '2px 0 0', opacity: 0.8 }}>{slide.subheading}</p>
                    )}
                </div>
                {/* order badge */}
                <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.55)', color: '#fff',
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                }}>#{idx + 1}</div>
                {/* active dot */}
                <div style={{
                    position: 'absolute', top: 8, left: 8,
                    width: 8, height: 8, borderRadius: '50%',
                    background: slide.active ? '#34d399' : '#ef4444',
                    border: '2px solid rgba(255,255,255,0.7)',
                }} />
            </div>

            {/* footer actions */}
            <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* reorder */}
                <button title="Move up" disabled={idx === 0} onClick={onMoveUp}
                    style={{ ...iconBtn, opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                <button title="Move down" disabled={idx === total - 1} onClick={onMoveDown}
                    style={{ ...iconBtn, opacity: idx === total - 1 ? 0.3 : 1 }}>▼</button>

                <div style={{ flex: 1 }} />

                {/* toggle active */}
                <button title={slide.active ? 'Deactivate' : 'Activate'} onClick={onToggle}
                    style={{ ...iconBtn, color: slide.active ? T.green : T.textMuted, borderColor: slide.active ? '#bbf7d0' : T.border }}>
                    {slide.active ? '●' : '○'}
                </button>
                <button title="Edit" onClick={onEdit}
                    style={{ ...iconBtn, color: T.blue, borderColor: '#d2e3fc' }}>
                    <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button title="Delete" onClick={onDelete}
                    style={{ ...iconBtn, color: T.red, borderColor: '#fecaca' }}>
                    <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

const iconBtn = {
    width: 26, height: 26, border: `1px solid ${T.border}`, borderRadius: 6,
    background: '#fff', cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 11,
    transition: 'all 0.14s', padding: 0, flexShrink: 0,
}

// ── slide editor modal ────────────────────────────────────────────────────────
const SlideEditor = ({ slide, onSave, onClose, saving }) => {
    const [form, setForm] = useState({ ...BLANK, ...slide })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(slide?.backgroundImage || '')
    const fileRef = useRef()

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
    const setFeature = (i, k, v) => setForm(p => {
        const f = [...p.features]
        f[i] = { ...f[i], [k]: v }
        return { ...p, features: f }
    })
    const addFeature = () => {
        if (form.features.length >= 5) return
        setForm(p => ({ ...p, features: [...p.features, { icon: '⭐', text: '' }] }))
    }
    const removeFeature = (i) => setForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))

    const handleImage = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const compressed = await compressImage(file)
        setImageFile(compressed)
        setImagePreview(URL.createObjectURL(compressed))
    }

    const handleSave = () => onSave(form, imageFile)

    return (
        <Modal
            title={slide._id ? 'Edit Slide' : 'New Slide'}
            onClose={onClose}
            width="680px"
            footer={<>
                <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                <Btn variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : slide._id ? 'Save Changes' : 'Create Slide'}
                </Btn>
            </>}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Background image */}
                <Field label="Background Image">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{
                            width: 180, height: 100, borderRadius: 8, overflow: 'hidden',
                            border: `1px solid ${T.border}`, flexShrink: 0,
                            background: imagePreview
                                ? `url(${imagePreview}) center/cover`
                                : 'linear-gradient(135deg,#0f172a,#1e293b)',
                            cursor: 'pointer',
                        }} onClick={() => fileRef.current?.click()}>
                            {!imagePreview && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: 6 }}>
                                    <svg style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span style={{ fontSize: 11 }}>Click to upload</span>
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                            <Btn variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                                {imagePreview ? 'Change Image' : 'Upload Image'}
                            </Btn>
                            {imagePreview && (
                                <Btn variant="danger" size="sm" style={{ marginLeft: 6 }} onClick={() => { setImageFile(null); setImagePreview(''); set('backgroundImage', '') }}>
                                    Remove
                                </Btn>
                            )}
                            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>
                                Recommended: 1920×700px. JPG/PNG/WebP.
                            </p>
                        </div>
                    </div>
                </Field>

                {/* Overlay + text color row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Field label="Overlay Darkness (0–100)">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="range" min={0} max={100} value={form.overlay ?? 50}
                                onChange={e => set('overlay', Number(e.target.value))}
                                style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text, width: 28 }}>{form.overlay ?? 50}</span>
                        </div>
                    </Field>
                    <Field label="Text Colour">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="color" value={form.textColor || '#ffffff'}
                                onChange={e => set('textColor', e.target.value)}
                                style={{ width: 40, height: 36, padding: 2, border: `1px solid ${T.border}`, borderRadius: 6, cursor: 'pointer' }} />
                            <Input value={form.textColor || '#ffffff'} onChange={e => set('textColor', e.target.value)}
                                placeholder="#ffffff" style={{ flex: 1 }} />
                        </div>
                    </Field>
                    <Field label="Active">
                        <Select value={form.active ? 'true' : 'false'} onChange={e => set('active', e.target.value === 'true')}>
                            <option value="true">✅ Visible</option>
                            <option value="false">⛔ Hidden</option>
                        </Select>
                    </Field>
                </div>

                {/* Badge */}
                <Field label="Badge Text (small pill above heading)">
                    <Input value={form.badgeText} onChange={e => set('badgeText', e.target.value)}
                        placeholder="🇯🇵 Japanese Vehicle Export Specialist" />
                </Field>

                {/* Heading */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Main Heading">
                        <Input value={form.heading} onChange={e => set('heading', e.target.value)}
                            placeholder="FIND YOUR DREAM CAR" />
                    </Field>
                    <Field label="Accent Word (highlighted part of heading)">
                        <Input value={form.headingAccent} onChange={e => set('headingAccent', e.target.value)}
                            placeholder="DREAM CAR" />
                    </Field>
                </div>

                {/* Subheading */}
                <Field label="Subheading">
                    <Input value={form.subheading} onChange={e => set('subheading', e.target.value)}
                        placeholder="DIRECT FROM JAPAN" />
                </Field>

                {/* CTA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Button Text">
                        <Input value={form.ctaText} onChange={e => set('ctaText', e.target.value)}
                            placeholder="Browse Our Stock" />
                    </Field>
                    <Field label="Button Link">
                        <Input value={form.ctaHref} onChange={e => set('ctaHref', e.target.value)}
                            placeholder="/stock" />
                    </Field>
                </div>

                {/* Features */}
                <Field label="Feature Icons (up to 5)">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {form.features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Input value={f.icon} onChange={e => setFeature(i, 'icon', e.target.value)}
                                    placeholder="🏆" style={{ width: 60, textAlign: 'center', fontSize: 18 }} />
                                <Input value={f.text} onChange={e => setFeature(i, 'text', e.target.value)}
                                    placeholder="Feature text" style={{ flex: 1 }} />
                                <button onClick={() => removeFeature(i)}
                                    style={{ ...iconBtn, color: T.red, borderColor: '#fecaca', flexShrink: 0 }}>×</button>
                            </div>
                        ))}
                        {form.features.length < 5 && (
                            <Btn variant="ghost" size="sm" onClick={addFeature}
                                icon={<svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
                                Add Feature
                            </Btn>
                        )}
                    </div>
                </Field>
            </div>
        </Modal>
    )
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function HeroCarouselPage() {
    const [slides, setSlides] = useState([])
    const [loading, setLoading] = useState(true)
    const [editSlide, setEditSlide] = useState(null)      // null = closed, {} = new, {...} = editing
    const [saving, setSaving] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [msg, setMsg] = useState(null)

    const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500) }

    const load = async () => {
        setLoading(true)
        const res = await fetch('/api/heroSlides')
        const data = res.ok ? await res.json() : []
        setSlides(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    // ── save (create or update) ──
    const handleSave = async (form, imageFile) => {
        setSaving(true)
        try {
            const isNew = !form._id
            const url = isNew ? '/api/heroSlides' : `/api/heroSlides/${form._id}`
            const method = isNew ? 'POST' : 'PATCH'

            let res
            if (imageFile) {
                const fd = new FormData()
                fd.append('slide', JSON.stringify(form))
                fd.append('backgroundImage', imageFile)
                res = await fetch(url, { method, body: fd })
            } else {
                res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
            }

            if (res.ok) {
                const saved = await res.json()
                setSlides(prev => isNew
                    ? [...prev, saved]
                    : prev.map(s => s._id === saved._id ? saved : s))
                setEditSlide(null)
                flash('success', isNew ? 'Slide created.' : 'Slide updated.')
            } else {
                const err = await res.json().catch(() => ({}))
                flash('error', err.message || 'Save failed.')
            }
        } catch (e) { flash('error', e.message) }
        finally { setSaving(false) }
    }

    // ── delete ──
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/heroSlides/${id}`, { method: 'DELETE' })
            if (res.ok) { setSlides(prev => prev.filter(s => s._id !== id)); flash('success', 'Slide deleted.') }
            else flash('error', 'Delete failed.')
        } catch (e) { flash('error', e.message) }
        finally { setDeleteTarget(null) }
    }

    // ── toggle active ──
    const handleToggle = async (slide) => {
        const res = await fetch(`/api/heroSlides/${slide._id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !slide.active }),
        })
        if (res.ok) {
            const updated = await res.json()
            setSlides(prev => prev.map(s => s._id === updated._id ? updated : s))
        }
    }

    // ── reorder ──
    const move = async (idx, dir) => {
        const next = [...slides]
        const target = idx + dir
        if (target < 0 || target >= next.length) return
        ;[next[idx], next[target]] = [next[target], next[idx]]
        setSlides(next)
        await fetch('/api/heroSlides', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: next.map(s => s._id) }),
        })
    }

    const addIcon = <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>

    return (
        <Page>
            <PageHeader
                title="Hero Carousel"
                subtitle={`${slides.length} slide${slides.length !== 1 ? 's' : ''} · drag ▲▼ to reorder`}
                actions={
                    <Btn variant="primary" icon={addIcon} onClick={() => setEditSlide({ ...BLANK })}>
                        New Slide
                    </Btn>
                }
            />

            {msg && <Alert type={msg.type} message={msg.text} style={{ marginBottom: 16 }} />}

            {/* Live preview banner */}
            {slides.filter(s => s.active).length > 0 && (
                <Card style={{ marginBottom: 20, overflow: 'hidden', padding: 0 }}>
                    <div style={{
                        padding: '8px 16px', background: '#0f172a',
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
                            Live preview — first active slide
                        </span>
                    </div>
                    {(() => {
                        const s = slides.find(sl => sl.active)
                        if (!s) return null
                        return (
                            <div style={{
                                height: 200, position: 'relative',
                                backgroundImage: s.backgroundImage ? `url(${s.backgroundImage})` : 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)',
                                backgroundSize: 'cover', backgroundPosition: 'center',
                            }}>
                                <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${(s.overlay ?? 50) / 100})` }} />
                                <div style={{ position: 'absolute', inset: 0, padding: '24px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: s.textColor || '#fff' }}>
                                    {s.badgeText && <span style={{ fontSize: 11, background: 'rgba(220,38,38,0.85)', color: '#fff', padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 10, fontWeight: 600, width: 'fit-content' }}>{s.badgeText}</span>}
                                    <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 4px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                                        {s.headingAccent
                                            ? s.heading?.replace(s.headingAccent, '') : s.heading}
                                        {s.headingAccent && <span style={{ color: '#ef4444' }}> {s.headingAccent}</span>}
                                    </h2>
                                    {s.subheading && <p style={{ fontSize: 13, margin: '0 0 12px', opacity: 0.85, letterSpacing: '0.12em' }}>{s.subheading}</p>}
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        {(s.features || []).map((f, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                                                <span style={{ fontSize: 16 }}>{f.icon}</span>
                                                <span style={{ opacity: 0.9 }}>{f.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </Card>
            )}

            {/* Slide grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e8f0fe', borderTopColor: T.blue, animation: 'spin 0.7s linear infinite' }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            ) : slides.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '52px 20px' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
                    <p style={{ fontSize: 14, color: T.textMuted, margin: '0 0 16px' }}>No slides yet. Create your first hero slide.</p>
                    <Btn variant="primary" icon={addIcon} onClick={() => setEditSlide({ ...BLANK })}>Create First Slide</Btn>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {slides.map((slide, idx) => (
                        <SlideCard
                            key={slide._id}
                            slide={slide}
                            idx={idx}
                            total={slides.length}
                            onEdit={() => setEditSlide({ ...slide })}
                            onDelete={() => setDeleteTarget(slide._id)}
                            onToggle={() => handleToggle(slide)}
                            onMoveUp={() => move(idx, -1)}
                            onMoveDown={() => move(idx, 1)}
                        />
                    ))}
                </div>
            )}

            {/* Editor modal */}
            {editSlide && (
                <SlideEditor
                    slide={editSlide}
                    onSave={handleSave}
                    onClose={() => setEditSlide(null)}
                    saving={saving}
                />
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <Modal
                    title="Delete Slide"
                    onClose={() => setDeleteTarget(null)}
                    footer={<>
                        <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
                        <Btn variant="danger" onClick={() => handleDelete(deleteTarget)}>Delete</Btn>
                    </>}
                >
                    <p style={{ fontSize: 13, color: T.textSec, margin: 0 }}>
                        This slide will be permanently removed from the carousel. This cannot be undone.
                    </p>
                </Modal>
            )}
        </Page>
    )
}
