'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const LoginPage = () => {
    const router = useRouter()
    const [values, setValues] = useState({ email: '', password: '' })
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        setLoading(true)
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            })
            const data = await res.json()
            if (res.ok) {
                setIsError(false)
                setMessage('Login successful. Redirecting...')
                setTimeout(() => router.push('/admin'), 800)
            } else {
                setIsError(true)
                setMessage(data.message || 'Login failed')
            }
        } catch {
            setIsError(true)
            setMessage('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--ink)'}}>
            {/* Left accent bar */}
            <div className="fixed left-0 top-0 bottom-0 w-1" style={{background:'var(--accent)'}}></div>

            <div className="w-full max-w-sm">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3"
                         style={{background:'var(--accent)'}}>
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="font-black tracking-widest uppercase text-white" style={{fontSize:'var(--text-lg)', letterSpacing:'0.2em'}}>UTC ADMIN</h1>
                    <p style={{fontSize:'var(--text-xs)', color:'rgba(255,255,255,0.4)', marginTop:'4px', letterSpacing:'0.08em'}}>Universal Trading Co.</p>
                </div>

                {/* Card */}
                <div className="rounded-lg p-6" style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)'}}>
                    <h2 className="font-bold text-white mb-5" style={{fontSize:'var(--text-md)'}}>Sign In</h2>

                    {message && (
                        <div className={`mb-4 px-3 py-2 rounded text-xs font-medium ${isError ? 'bg-red-900/40 text-red-300 border border-red-700/50' : 'bg-green-900/40 text-green-300 border border-green-700/50'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1.5 font-semibold uppercase tracking-widest" style={{fontSize:'var(--text-xs)', color:'rgba(255,255,255,0.5)'}}>
                                Email
                            </label>
                            <input
                                type="email" required
                                value={values.email}
                                onChange={e => setValues({...values, email: e.target.value})}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2 rounded"
                                style={{
                                    background:'rgba(255,255,255,0.07)',
                                    border:'1px solid rgba(255,255,255,0.15)',
                                    color:'#fff',
                                    fontSize:'var(--text-sm)',
                                    outline:'none'
                                }}
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 font-semibold uppercase tracking-widest" style={{fontSize:'var(--text-xs)', color:'rgba(255,255,255,0.5)'}}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'} required
                                    value={values.password}
                                    onChange={e => setValues({...values, password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 pr-10 rounded"
                                    style={{
                                        background:'rgba(255,255,255,0.07)',
                                        border:'1px solid rgba(255,255,255,0.15)',
                                        color:'#fff',
                                        fontSize:'var(--text-sm)',
                                        outline:'none'
                                    }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                                    style={{color:'rgba(255,255,255,0.4)'}}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {showPassword
                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                        }
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-2.5 rounded font-bold tracking-wider uppercase transition disabled:opacity-50"
                            style={{background:'var(--accent)', color:'#fff', fontSize:'var(--text-sm)', letterSpacing:'0.1em'}}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/setupUser" style={{fontSize:'var(--text-xs)', color:'rgba(255,255,255,0.35)'}}>
                        Don't have an account? Register
                    </Link>
                </div>

                <p className="text-center mt-6" style={{fontSize:'var(--text-xs)', color:'rgba(255,255,255,0.2)'}}>
                    © 2026 Universal Trading Co.
                </p>
            </div>
        </div>
    )
}

export default LoginPage
