'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const YardScanPage = () => {
    const [yards, setYards] = useState([])
    const [selectedYard, setSelectedYard] = useState('')
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [recentScans, setRecentScans] = useState([])
    const [cameraReady, setCameraReady] = useState(false)
    const html5QrCodeRef = useRef(null)
    const yardsRef = useRef([])
    const selectedYardRef = useRef('')

    useEffect(() => { yardsRef.current = yards }, [yards])
    useEffect(() => { selectedYardRef.current = selectedYard }, [selectedYard])

    useEffect(() => {
        fetch('/api/yard').then(r => r.ok ? r.json() : []).then(y => {
            setYards(Array.isArray(y) ? y : [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const processScan = async (decodedText) => {
        const yardId = selectedYardRef.current
        const currentYards = yardsRef.current

        if (!yardId) {
            setError('Please select a yard first')
            return
        }

        try {
            const parsed = JSON.parse(decodedText)
            if (parsed.type !== 'UTC_VEHICLE' || !parsed.id) {
                setError('Invalid QR code. This is not a UTC vehicle QR code.')
                return
            }

            setResult(null)
            setError(null)

            const res = await fetch('/api/qr/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicleId: parsed.id, yardId }),
            })

            const data = await res.json()

            if (res.status === 409) {
                setError(`Vehicle already checked in! ${data.vehicle.manufacturer || ''} ${data.vehicle.model || ''} was already scanned on ${new Date(data.vehicle.physicalInDate).toLocaleString()}.`)
                return
            }

            if (!res.ok) {
                setError(data.message || 'Failed to process scan')
                return
            }

            const yardObj = currentYards.find(y => y._id === yardId)
            setResult({
                vehicle: data.vehicle,
                gatePass: data.gatePass,
                yard: yardObj,
            })

            setRecentScans(prev => [{
                vehicle: data.vehicle,
                gatePass: data.gatePass,
                time: new Date(),
                yard: yardObj,
            }, ...prev].slice(0, 20))
        } catch (e) {
            setError('Failed to parse QR code data')
        }
    }

    const startScanner = async () => {
        if (!selectedYard) {
            setError('Please select a yard first')
            return
        }

        setScanning(true)
        setResult(null)
        setError(null)
        setCameraReady(false)

        try {
            if (html5QrCodeRef.current) {
                try { await html5QrCodeRef.current.stop() } catch (e) {}
                try { html5QrCodeRef.current.clear() } catch (e) {}
                html5QrCodeRef.current = null
            }

            const { Html5Qrcode } = await import('html5-qrcode')

            const html5QrCode = new Html5Qrcode('qr-reader')
            html5QrCodeRef.current = html5QrCode

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    processScan(decodedText)
                },
                () => {}
            )
            setCameraReady(true)
        } catch (e) {
            console.error('Scanner error:', e)
            setError('Camera access denied or not available. Please allow camera access and try again.')
            setScanning(false)
            setCameraReady(false)
        }
    }

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try { await html5QrCodeRef.current.stop() } catch (e) {}
            try { html5QrCodeRef.current.clear() } catch (e) {}
            html5QrCodeRef.current = null
        }
        setScanning(false)
        setCameraReady(false)
    }

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                try { html5QrCodeRef.current.stop() } catch (e) {}
                try { html5QrCodeRef.current.clear() } catch (e) {}
            }
        }
    }, [])

    return (
        <div style={{ padding: '16px', minHeight: '100vh', background: '#f6f8fc' }}>
            <style>{`
                #qr-reader { border: none !important; width: 100% !important; max-width: 340px; margin: 0 auto; }
                #qr-reader video { border-radius: 12px !important; width: 100% !important; }
                #qr-reader__scan_region { min-height: 200px; }
                #qr-reader__dashboard { display: none !important; }
                #qr-reader img[alt="Info icon"] { display: none !important; }
                #qr-reader__header_message { display: none !important; }
                @media (max-width: 768px) {
                    .scan-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Link href="/admin/yard" style={{ color: '#1a73e8', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Yards
                </Link>
                <span style={{ color: '#dadce0' }}>›</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#202124' }}>QR Scan Entry</span>
            </div>

            <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#202124', margin: '0 0 4px' }}>Yard Entry Scanner</h1>
            <p style={{ fontSize: '12px', color: '#5f6368', margin: '0 0 16px' }}>Scan a vehicle QR code to register entry into a yard</p>

            <div className="scan-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

                {/* Scanner Card */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #f0f4f8' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: '0 0 12px' }}>Select Yard & Scan</h3>
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Yard *</label>
                            <select value={selectedYard} onChange={e => { setSelectedYard(e.target.value); setError(null) }}
                                disabled={scanning}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box', color: selectedYard ? '#202124' : '#9aa0a6' }}>
                                <option value="">{loading ? 'Loading yards...' : 'Select yard...'}</option>
                                {yards.map(y => <option key={y._id} value={y._id}>{y.name}{y.location ? ` (${y.location})` : ''}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ padding: '16px', textAlign: 'center' }}>
                        <div id="qr-reader" style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }} />

                        {scanning && !cameraReady && (
                            <div style={{ padding: '20px', color: '#5f6368', fontSize: '12px' }}>
                                <div style={{ width: '24px', height: '24px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 8px' }} />
                                Starting camera...
                            </div>
                        )}

                        {!scanning ? (
                            <button onClick={startScanner} disabled={!selectedYard}
                                style={{ padding: '12px 24px', background: selectedYard ? '#059669' : '#e0e0e0', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: selectedYard ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Start Scanner
                            </button>
                        ) : (
                            <button onClick={stopScanner}
                                style={{ padding: '12px 24px', background: '#c5221f', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                                Stop Scanner
                            </button>
                        )}

                        {result && (
                            <div style={{ marginTop: '16px', padding: '14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                    <svg style={{ width: '18px', height: '18px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>Checked In Successfully</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.8 }}>
                                    <div><strong>Vehicle:</strong> {result.vehicle.manufacturer} {result.vehicle.model}</div>
                                    <div><strong>GP Number:</strong> {result.gatePass.gatePassNumber}</div>
                                    <div><strong>Yard:</strong> {result.gatePass.yard?.name || result.yard?.name}</div>
                                    <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{ marginTop: '16px', padding: '14px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <svg style={{ width: '18px', height: '18px', color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>Error</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#991b1b' }}>{error}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Scans */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #f0f4f8' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>Recent Scans</h3>
                        <p style={{ fontSize: '11px', color: '#9aa0a6', margin: '2px 0 0' }}>{recentScans.length} vehicles checked in this session</p>
                    </div>

                    {recentScans.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <svg style={{ width: '32px', height: '32px', color: '#dadce0', margin: '0 auto 8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            <p style={{ fontSize: '12px', color: '#9aa0a6', margin: 0 }}>No scans yet. Start scanning QR codes.</p>
                        </div>
                    ) : (
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {recentScans.map((scan, i) => (
                                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{scan.vehicle.manufacturer} {scan.vehicle.model}</div>
                                        <div style={{ fontSize: '11px', color: '#9aa0a6' }}>{scan.gatePass.gatePassNumber} • {scan.yard?.name}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: '#9aa0a6' }}>{scan.time.toLocaleTimeString()}</div>
                                        <div style={{ display: 'inline-block', padding: '2px 8px', background: '#dcfce7', borderRadius: '10px', fontSize: '10px', fontWeight: 600, color: '#166534' }}>Checked In</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

export default YardScanPage
