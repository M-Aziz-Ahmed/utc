'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

const FALLBACK_SLIDE = {
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
}

export default function HeroCarousel({ vehicleCount = 0, initialSlides = [] }) {
    const [slides, setSlides] = useState([])
    const [current, setCurrent] = useState(0)
    const [fading, setFading] = useState(false)
    const timer = useRef(null)

    // Load slides: server-provided → client fetch → fallback
    useEffect(() => {
        if (initialSlides && initialSlides.length > 0) {
            setSlides(initialSlides)
            return
        }
        fetch('/api/heroSlides?active=true')
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                setSlides(Array.isArray(data) && data.length > 0 ? data : [FALLBACK_SLIDE])
            })
            .catch(() => setSlides([FALLBACK_SLIDE]))
    }, [])  // eslint-disable-line

    const total = slides.length

    const goTo = useCallback((idx) => {
        if (fading || !total) return
        setFading(true)
        setTimeout(() => { setCurrent(idx); setFading(false) }, 400)
    }, [fading, total])

    const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo])
    const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo])

    const resetTimer = useCallback(() => {
        clearInterval(timer.current)
        if (total > 1) timer.current = setInterval(next, 6000)
    }, [total, next])

    useEffect(() => {
        if (total > 1) timer.current = setInterval(next, 6000)
        return () => clearInterval(timer.current)
    }, [total, next])

    if (!total) return (
        <section className="hero-section" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 40%,#0f172a 100%)' }} />
    )

    const slide = slides[current]
    const overlayRgba = `rgba(0,0,0,${((slide.overlay ?? 55) / 100).toFixed(2)})`
    const textColor = slide.textColor || '#ffffff'
    const sectionBg = slide.backgroundImage
        ? 'transparent'
        : 'linear-gradient(135deg,#0f172a 0%,#1e293b 40%,#0f172a 100%)'

    // Build heading: if headingAccent present, wrap it in red span
    const renderHeading = () => {
        const full = (slide.heading || '').trim()
        const accent = (slide.headingAccent || '').trim()
        if (accent && full.includes(accent)) {
            const idx = full.indexOf(accent)
            return (
                <>
                    {full.slice(0, idx)}
                    <span style={{ color: '#ef4444' }}>{accent}</span>
                    {full.slice(idx + accent.length)}
                </>
            )
        }
        // heading may contain HTML from rich-text editor
        if (full.includes('<')) {
            return <span dangerouslySetInnerHTML={{ __html: full }} />
        }
        return full
    }

    return (
        <section
            className="hero-section"
            style={{ background: sectionBg }}
        >
            {/* Background image */}
            {slide.backgroundImage && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    opacity: fading ? 0 : 1,
                    transition: 'opacity 0.4s ease',
                }}>
                    <img
                        key={slide._id}
                        src={slide.backgroundImage}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                </div>
            )}

            {/* Overlay */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: overlayRgba,
                opacity: fading ? 0 : 1,
                transition: 'opacity 0.4s ease',
            }} />

            {/* Content */}
            <div
                className="hero-content"
                style={{
                    position: 'relative', zIndex: 2,
                    color: textColor,
                    opacity: fading ? 0 : 1,
                    transform: fading ? 'translateY(8px)' : 'translateY(0)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
            >
                {slide.badgeText && (
                    <div className="hero-badge"
                        dangerouslySetInnerHTML={{ __html: slide.badgeText }} />
                )}

                <h1 className="hero-title" style={{ color: textColor }}>
                    {renderHeading()}
                </h1>

                {slide.subheading && (
                    <p className="hero-subtitle" style={{ color: textColor }}
                        dangerouslySetInnerHTML={{ __html: slide.subheading }} />
                )}

                {(slide.features || []).length > 0 && (
                    <div className="hero-features">
                        {slide.features.map((f, i) => (
                            <div key={i} className="hero-feature" style={{ color: textColor }}>
                                <div className="hero-feature-icon">{f.icon}</div>
                                {f.text?.includes('<')
                                    ? <span dangerouslySetInnerHTML={{ __html: f.text }} />
                                    : <span>{f.text}</span>
                                }
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

            {/* Stats */}
            <div className="hero-stats" style={{ position: 'relative', zIndex: 2 }}>
                <div className="hero-stat-card">
                    <div className="hero-stat-number">{vehicleCount.toLocaleString()}+</div>
                    <div className="hero-stat-label">Vehicles Available</div>
                </div>
            </div>

            {/* Arrows */}
            {total > 1 && (
                <>
                    <button onClick={() => { prev(); resetTimer() }} aria-label="Previous"
                        style={arrowStyle('left')}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button onClick={() => { next(); resetTimer() }} aria-label="Next"
                        style={arrowStyle('right')}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Dots */}
                    <div style={{
                        position: 'absolute', bottom: 18, left: '50%',
                        transform: 'translateX(-50%)', zIndex: 3,
                        display: 'flex', gap: 8,
                    }}>
                        {slides.map((_, i) => (
                            <button key={i} aria-label={`Slide ${i + 1}`}
                                onClick={() => { goTo(i); resetTimer() }}
                                style={{
                                    width: i === current ? 24 : 8, height: 8,
                                    borderRadius: 4, border: 'none', padding: 0, cursor: 'pointer',
                                    background: i === current ? '#ef4444' : 'rgba(255,255,255,0.5)',
                                    transition: 'all 0.25s',
                                }} />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

const arrowStyle = (side) => ({
    position: 'absolute', top: '50%', [side]: 16,
    transform: 'translateY(-50%)', zIndex: 3,
    width: 44, height: 44, borderRadius: '50%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.18s',
    backdropFilter: 'blur(4px)',
})
