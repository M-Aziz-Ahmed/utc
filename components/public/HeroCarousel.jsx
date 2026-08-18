'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// Fallback slide shown when DB has no active slides
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
    const [slides, setSlides] = useState(initialSlides.length ? initialSlides : FALLBACK)
    const [current, setCurrent] = useState(0)
    const [animating, setAnimating] = useState(false)
    const timerRef = useRef(null)

    // Fetch on client if server didn't pre-load
    useEffect(() => {
        if (initialSlides.length) return
        fetch('/api/heroSlides?active=true')
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setSlides(data)
            })
            .catch(() => {})
    }, [initialSlides.length])

    const goTo = useCallback((idx) => {
        if (animating || idx === current) return
        setAnimating(true)
        setTimeout(() => {
            setCurrent(idx)
            setAnimating(false)
        }, 300)
    }, [animating, current])

    const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo])
    const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo])

    // Auto-advance every 6 s
    useEffect(() => {
        if (slides.length <= 1) return
        timerRef.current = setInterval(next, 6000)
        return () => clearInterval(timerRef.current)
    }, [slides.length, next])

    const resetTimer = () => {
        clearInterval(timerRef.current)
        timerRef.current = setInterval(next, 6000)
    }

    const slide = slides[current] || slides[0]
    if (!slide) return null

    const bgStyle = slide.backgroundImage
        ? { backgroundImage: `url(${slide.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)' }

    const overlayOpacity = ((slide.overlay ?? 50) / 100).toFixed(2)
    const textColor = slide.textColor || '#ffffff'

    // Split heading to highlight accent word(s)
    const renderHeading = () => {
        const full = slide.heading || ''
        const accent = slide.headingAccent || ''
        if (!accent || !full.includes(accent)) {
            return <>{full}</>
        }
        const parts = full.split(accent)
        return (
            <>
                {parts[0]}
                <span style={{ color: '#ef4444' }}>{accent}</span>
                {parts[1]}
            </>
        )
    }

    return (
        <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* Background */}
            <div
                className="hero-bg"
                style={{
                    ...bgStyle,
                    transition: 'opacity 0.3s',
                    opacity: animating ? 0 : 1,
                }}
            />

            {/* Overlay */}
            <div
                className="hero-overlay"
                style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
            />

            {/* Content */}
            <div
                className="hero-content"
                style={{
                    color: textColor,
                    opacity: animating ? 0 : 1,
                    transform: animating ? 'translateY(8px)' : 'translateY(0)',
                    transition: 'opacity 0.3s, transform 0.3s',
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
                    <Link
                        href={slide.ctaHref || '/stock'}
                        className="btn-primary"
                        style={{ fontSize: 15, padding: '14px 32px' }}
                    >
                        {slide.ctaText}
                    </Link>
                )}
            </div>

            {/* Stats card */}
            <div className="hero-stats">
                <div className="hero-stat-card">
                    <div className="hero-stat-number">{vehicleCount.toLocaleString()}+</div>
                    <div className="hero-stat-label">Vehicles Available</div>
                </div>
            </div>

            {/* Prev / Next arrows — only if multiple slides */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={() => { prev(); resetTimer() }}
                        aria-label="Previous slide"
                        style={arrowStyle('left')}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                    >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => { next(); resetTimer() }}
                        aria-label="Next slide"
                        style={arrowStyle('right')}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                    >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Dot indicators */}
                    <div style={{
                        position: 'absolute', bottom: 18, left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', gap: 8, zIndex: 10,
                    }}>
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { goTo(i); resetTimer() }}
                                aria-label={`Go to slide ${i + 1}`}
                                style={{
                                    width: i === current ? 24 : 8,
                                    height: 8, borderRadius: 4,
                                    background: i === current ? '#ef4444' : 'rgba(255,255,255,0.5)',
                                    border: 'none', cursor: 'pointer', padding: 0,
                                    transition: 'all 0.25s',
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

const arrowStyle = (side) => ({
    position: 'absolute',
    top: '50%', [side]: 16,
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: 44, height: 44,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.18s',
    backdropFilter: 'blur(4px)',
})
