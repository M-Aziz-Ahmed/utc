'use client'
import { useState } from 'react'
import { useAuth } from './AuthContext'

const ORANGE = '#e8450a'

export default function SignupModal() {
    const { modalOpen, closeAuthModal, refreshAuth } = useAuth()

    const [tab, setTab] = useState('login')          // 'login' | 'register'
    const [loginData, setLoginData] = useState({ email: '', password: '' })
    const [regData, setRegData] = useState({ name: '', email: '', password: '', confirm: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [busy, setBusy] = useState(false)

    if (!modalOpen) return null

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(''); setSuccess(''); setBusy(true)
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginData.email, password: loginData.password }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.message || 'Login failed'); return }
            await refreshAuth()
            setSuccess('Welcome back! You can now see vehicle prices.')
            setTimeout(() => closeAuthModal(), 1200)
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(''); setSuccess('')
        if (regData.password !== regData.confirm) { setError('Passwords do not match.'); return }
        if (regData.password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setBusy(true)
        try {
            const fd = new FormData()
            fd.append('userData', JSON.stringify({
                name: regData.name,
                email: regData.email,
                pass: regData.password,
                role: 'User',
            }))
            const res = await fetch('/api/createUser', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) { setError(data.message || 'Registration failed'); return }
            await refreshAuth()
            setSuccess('Account created! You can now see all vehicle prices.')
            setTimeout(() => closeAuthModal(), 1400)
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                onClick={closeAuthModal}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
                    zIndex: 9998, backdropFilter: 'blur(3px)',
                }}
            />

            {/* ── Modal shell ── */}
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                width: '92vw', maxWidth: 900,
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
                display: 'flex', flexDirection: 'column',
            }}>

                {/* ── Orange top bar ── */}
                <div style={{
                    background: ORANGE, padding: '10px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {tab === 'login' ? 'Login' : 'Create Account'}
                    </span>
                    <button
                        onClick={closeAuthModal}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#fff', fontSize: 20, lineHeight: 1, padding: '0 2px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        aria-label="Close"
                    >
                        &#10005;
                    </button>
                </div>

                {/* ── Three-column body ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', minHeight: 340 }}>

                    {/* ── LEFT: dark benefits panel ── */}
                    <div style={{
                        background: '#2d2d2d', color: '#fff',
                        padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 10,
                    }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{
                                width: 38, height: 38, background: ORANGE,
                                borderRadius: 3, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0,
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '0.04em' }}>UNIVERSAL</div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '0.04em' }}>TRADING CO.</div>
                            </div>
                        </div>

                        <p style={{ fontSize: 12, color: '#ccc', marginBottom: 12, lineHeight: 1.5 }}>
                            More than 1500<br />Vehicles in stock
                        </p>

                        {[
                            { icon: '💰', text: 'Special prices' },
                            { icon: '🚢', text: 'Fast delivery' },
                            { icon: '🔑', text: 'Access for Vehicle dealers only' },
                        ].map(({ icon, text }) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0', lineHeight: 1.4 }}>{text}</span>
                            </div>
                        ))}

                        <div style={{ flex: 1 }} />

                        <button
                            onClick={() => { setTab('register'); setError(''); setSuccess('') }}
                            style={{
                                background: 'none', border: '2px solid #fff', color: '#fff',
                                padding: '9px 12px', borderRadius: 2, cursor: 'pointer',
                                fontWeight: 800, fontSize: 12, letterSpacing: '0.08em',
                                textTransform: 'uppercase', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#2d2d2d' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fff' }}
                        >
                            Register Now
                        </button>
                        <p
                            style={{ fontSize: 11, color: '#aaa', cursor: 'pointer', textAlign: 'center', marginTop: 6 }}
                            onClick={() => { setTab('login'); setError(''); setSuccess('') }}
                        >
                            Why should I register?
                        </p>
                    </div>

                    {/* ── CENTRE: login / register form ── */}
                    <div style={{ background: '#fff', padding: '28px 28px 24px' }}>

                        {/* Tab switcher */}
                        <div style={{ display: 'flex', gap: 0, marginBottom: 22, borderBottom: '2px solid #f0f0f0' }}>
                            {['login', 'register'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setTab(t); setError(''); setSuccess('') }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '6px 18px 10px', fontSize: 13, fontWeight: 700,
                                        color: tab === t ? ORANGE : '#888',
                                        borderBottom: tab === t ? `2px solid ${ORANGE}` : '2px solid transparent',
                                        marginBottom: -2, transition: 'all 0.15s',
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {t === 'login' ? 'Login' : 'Register'}
                                </button>
                            ))}
                        </div>

                        {/* ── LOGIN form ── */}
                        {tab === 'login' && (
                            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Email</label>
                                    <input
                                        type="email" required autoComplete="email"
                                        placeholder="Enter your email"
                                        value={loginData.email}
                                        onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = ORANGE}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Password</label>
                                    <input
                                        type="password" required autoComplete="current-password"
                                        placeholder="Enter the password"
                                        value={loginData.password}
                                        onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = ORANGE}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>

                                {error && <p style={errorStyle}>{error}</p>}
                                {success && <p style={successStyle}>{success}</p>}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={busy} style={submitBtn(busy)}>
                                        {busy ? 'Logging in…' : 'Log In'}
                                    </button>
                                </div>
                                <p style={{ fontSize: 11, color: '#aaa', textAlign: 'right', cursor: 'pointer', marginTop: -8 }}>
                                    Lost password?
                                </p>

                                {/* App download hint */}
                                <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {/* Android */}
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#3ddc84"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C14.15 1.23 13.1 1 12 1c-1.1 0-2.15.23-3.09.63L7.43.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.01 3.23 5 5.02 5 7h14c0-1.98-1.01-3.77-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/></svg>
                                        {/* Apple */}
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#555"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                    </div>
                                    <span style={{ fontSize: 11, color: '#555' }}>Download the UTC app<br /><strong>ios/Android</strong></span>
                                </div>
                            </form>
                        )}

                        {/* ── REGISTER form ── */}
                        {tab === 'register' && (
                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Full Name</label>
                                    <input
                                        type="text" required autoComplete="name"
                                        placeholder="Your full name"
                                        value={regData.name}
                                        onChange={e => setRegData(p => ({ ...p, name: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = ORANGE}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Email</label>
                                    <input
                                        type="email" required autoComplete="email"
                                        placeholder="Enter your email"
                                        value={regData.email}
                                        onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = ORANGE}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Password</label>
                                    <input
                                        type="password" required autoComplete="new-password"
                                        placeholder="Min. 6 characters"
                                        value={regData.password}
                                        onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = ORANGE}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Confirm Password</label>
                                    <input
                                        type="password" required autoComplete="new-password"
                                        placeholder="Repeat password"
                                        value={regData.confirm}
                                        onChange={e => setRegData(p => ({ ...p, confirm: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = ORANGE}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>

                                {error && <p style={errorStyle}>{error}</p>}
                                {success && <p style={successStyle}>{success}</p>}

                                <button type="submit" disabled={busy} style={{ ...submitBtn(busy), marginTop: 2 }}>
                                    {busy ? 'Creating account…' : 'Create Account'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* ── RIGHT: car image promo panel ── */}
                    <div style={{
                        background: '#1a1a1a',
                        position: 'relative', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', padding: '22px 20px',
                    }}>
                        {/* Background gradient */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a0a 60%, #1a1a1a 100%)',
                        }} />

                        {/* Logo top-left */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 32, height: 32, background: ORANGE, borderRadius: 3,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '0.05em' }}>UNIVERSAL</div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '0.05em' }}>TRADING CO.</div>
                            </div>
                        </div>

                        {/* "Special Offer" script text */}
                        <div style={{ position: 'relative', textAlign: 'right', marginTop: 8 }}>
                            <span style={{
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                fontStyle: 'italic', fontSize: 28, fontWeight: 700,
                                color: ORANGE, textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                                lineHeight: 1,
                            }}>
                                Special Offer
                            </span>
                        </div>

                        {/* Car illustration placeholder */}
                        <div style={{
                            position: 'relative', flex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '10px 0',
                        }}>
                            {/* SVG car silhouette */}
                            <svg viewBox="0 0 220 90" width="100%" style={{ maxHeight: 100, opacity: 0.85 }}>
                                <defs>
                                    <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#555" />
                                        <stop offset="50%" stopColor="#ccc" />
                                        <stop offset="100%" stopColor="#555" />
                                    </linearGradient>
                                </defs>
                                {/* Body */}
                                <path d="M15 62 Q20 62 25 58 L60 38 Q75 28 100 26 Q130 24 150 28 L185 40 Q198 44 205 52 L210 62 Z" fill="url(#carGrad)" />
                                {/* Roof */}
                                <path d="M60 38 Q75 18 105 16 Q135 14 155 24 L185 40 Z" fill="#aaa" />
                                {/* Windows */}
                                <path d="M70 36 Q80 22 100 20 L130 20 L145 36 Z" fill="#334" opacity="0.7" />
                                <path d="M148 36 L160 26 L178 38 Z" fill="#334" opacity="0.6" />
                                {/* Wheels */}
                                <circle cx="58" cy="65" r="13" fill="#222" />
                                <circle cx="58" cy="65" r="7" fill="#555" />
                                <circle cx="163" cy="65" r="13" fill="#222" />
                                <circle cx="163" cy="65" r="7" fill="#555" />
                                {/* Ground line */}
                                <line x1="0" y1="78" x2="220" y2="78" stroke="#444" strokeWidth="1" />
                                {/* Speed lines */}
                                <line x1="0" y1="50" x2="12" y2="50" stroke="#666" strokeWidth="1.5" />
                                <line x1="0" y1="56" x2="8" y2="56" stroke="#555" strokeWidth="1" />
                                <line x1="0" y1="62" x2="10" y2="62" stroke="#555" strokeWidth="1" />
                            </svg>
                        </div>

                        {/* CTA button */}
                        <div style={{ position: 'relative', textAlign: 'center' }}>
                            <button
                                onClick={() => { setTab('register'); setError(''); setSuccess('') }}
                                style={{
                                    background: ORANGE, color: '#fff',
                                    border: 'none', borderRadius: 2, cursor: 'pointer',
                                    padding: '11px 28px', fontSize: 13, fontWeight: 800,
                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                    boxShadow: '0 4px 16px rgba(232,69,10,0.4)',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#c73a08'}
                                onMouseLeave={e => e.currentTarget.style.background = ORANGE}
                            >
                                Buy Vehicle
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

/* ── Shared style helpers ── */
const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1px solid #ddd', borderRadius: 2,
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
    background: '#fafafa', transition: 'border-color 0.15s',
    fontFamily: 'inherit',
}

const submitBtn = (busy) => ({
    background: busy ? '#ccc' : '#e8450a',
    color: '#fff', border: 'none', borderRadius: 2,
    padding: '10px 28px', fontSize: 13, fontWeight: 800,
    cursor: busy ? 'not-allowed' : 'pointer',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    boxShadow: busy ? 'none' : '0 3px 10px rgba(232,69,10,0.35)',
    transition: 'all 0.15s',
})

const errorStyle = {
    fontSize: 12, color: '#c5221f', background: '#fce8e6',
    border: '1px solid #f5c6c2', borderRadius: 3,
    padding: '7px 10px', margin: 0,
}

const successStyle = {
    fontSize: 12, color: '#137333', background: '#e6f4ea',
    border: '1px solid #b7dfbe', borderRadius: 3,
    padding: '7px 10px', margin: 0,
}
