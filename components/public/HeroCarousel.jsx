'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

const FALLBACK = [{
    _id: 'fallback',
    backgroundImage: '',
    overlay: 55,
    textColor: '#ffffff',
    badgeText: '🇯🇵 Japanese Vehicle Export Specialist',
    heading: 'FIND YOUR',
    headingAccent: 'DREAM CAR',
    subheading: 'DIRECT FROM JAPAN',
    ctaText: 'Browse Our Stock',
    ctaHref: '/stock',
    features: [
        { icon: '🏆', text: 'Japanese Auction Direct' },
        { icon: '✅', text: 'Best Quality Vehicles' },
        { icon: '🚚', text: 'Worldwide Shipping' },
    ],
}]

export default function HeroCarousel({ vehicleCount = 0, initialSlides = [] }) {
    const [slides, setSlides] = useState(FALLBACK)   // always start with fallback
    const [loaded, setLoaded] = useState(false)
    const [current, setCurrent] = useState(0)
    const [animating, setAnimating] = useState(false)
    const timerRef = useRef(null)

    // Merge server slides once available, then fetch from client if still empty
    useEffect(() => {
        if (initialSlides && initialSlides.length > 0) {
            setSlides(initialSlides)
            setLoaded(true)
            return
        }
        // Server had no slides — try client-side fetch
        fetch('/api/heroSlides?active=true')
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setSlides(data)
                }
                setLoaded(true)
            })
            .catch(() => setLoaded(true))
    }, [initialSlides])

    const total = slides.length

    const goTo = useCallback((idx) => {
        if (animating) return
        setAnimating(true)
        setTimeout(() => {
            setCurrent(idx)
            setAnimating(false)
        }, 350)
    }, [animating])

    const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo])
    const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo])

    // Auto-advance
    useEffect(() => {
        if (total <= 1) return
        timerRef.current = setInterval(next, 6000)
        return () => clearInterval(timerRef.current)
    }, [total, next])

    const resetTimer = () => {
        clearInterval(timerRef.current)
        if (total > 1) timerRef.current = setInterval(next, 6000)
    }

    const slide = slides[current] || slides[0]
    if (!slide) return null

    const overlayOpacity = ((slide.overlay ?? 55) / 100).toFixed(2)
    const textColor = slide.textColor || '#ffffff'

    const renderHeading = () => {
        const full = (slide.heading || '').trim()
        const accent = (slide.headingAccent || '').trim()
        if (!accent || !full.includes(accent)) return <>{full}</>
        const [before, ...afterParts] = full.split(accent)
        return (
            <>
                {before}
                <span style={{ color: '#ef4444' }}>{accent}</span>
                {afterParts.join(accent)}
            </>
        )
    }

    return (
        <section className="hero-section">

            {/* ── Background image layer ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                transition: 'opacity 0.35s',
                opacity: animating ? 0 : 1,
            }}>
                {slide.backgroundImage ? (
                    <img
                        src={slide.backgroundImage}
                        alt=""
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'center',
                            display: 'block',
                        }}
                    />
                ) : (
                    // Fallback gradient when no image
                    <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
                    }} />
                )}
            </div>

            {/* ── Dark overlay ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: `rgba(0,0,0,${overlayOpacity})`,
                transition: 'opacity 0.35s',
                opacity: animating ? 0 : 1,
            }} />

            {/* ── Content ── */}
            <div
                className="hero-content"
                style={{
                    position: 'relative', zIndex: 2,
                    color: textColor,
                    opacity: animating ? 0 : 1,
                    transform: animating ? 'translateY(10px)' : 'translateY(0)',
                    transition: 'opacity 0.35s, transform 0.35s',
                }}
            >
                {slide.badgeText && (
                    <div className="hero-badge">{slide.badgeText}</div>
                )}

                <h1 className="hero-title" style={{ color: textColor }}>
                    {renderHeading()}
                </h1>

                {slide.subheading && (
                    <p className="hero-subtitle" style={{ color: textColor }}>{slide.subheading}</p>
                )}

                {(slide.features || []).length > 0 && (
                    <div className="hero-features">
                        {slide.features.map((f, i) => (
                            <div key={i} className="hero-feature" style={{ color: textColor }}>
                                <div className="hero-feature-icon">{f.icon}</div>
                                <span>{f.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {slide.ctaText && (
                    <Link href={slide.ctaHref || '/stock'} className="btn-primary"
                        style={{ fontSize: 15, padding: '14px 32px' }}>
                        {slide.ctaText}
                    </Link>
                )}
            </div>

            {/* ── Stats card ── */}
            <div className="hero-stats" style={{ position: 'relative', zIndex: 2 }}>
                <div className="hero-stat-card">
                    <div className="hero-stat-number">{vehicleCount.toLocaleString()}+</div>
                    <div className="hero-stat-label">Vehicles Available</div>
                </div>
            </div>

            {/* ── Prev / Next ── */}
            {total > 1 && (
                <>
                    <button onClick={() => { prev(); resetTimer() }} aria-label="Previous"
                        style={arrowBtn('left')}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.38)'}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button onClick={() => { next(); resetTimer() }} aria-label="Next"
                        style={arrowBtn('right')}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.38)'}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Dots */}
                    <div style={{
                        position: 'absolute', bottom: 16, left: '50%',
                        transform: 'translateX(-50%)', zIndex: 3,
                        display: 'flex', gap: 8,
                    }}>
                        {slides.map((_, i) => (
                            <button key={i} aria-label={`Slide ${i + 1}`}
                                onClick={() => { goTo(i); resetTimer() }}
                                style={{
                                    width: i === current ? 24 : 8, height: 8,
                                    borderRadius: 4, border: 'none', padding: 0,
                                    background: i === current ? '#ef4444' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer', transition: 'all 0.25s',
                                }} />
                        ))}
                    </div>
                </>
            )}

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </section>
    )
}

const arrowBtn = (side) => ({
    position: 'absolute', top: '50%', [side]: 16,
    transform: 'translateY(-50%)', zIndex: 3,
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.18s',
    backdropFilter: 'blur(4px)',
})
