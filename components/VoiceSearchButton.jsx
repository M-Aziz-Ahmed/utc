'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

let pulseStyleAdded = false
function ensurePulseKeyframes() {
    if (pulseStyleAdded || typeof document === 'undefined') return
    const style = document.createElement('style')
    style.textContent = '@keyframes voicePulse { 0%,100%{opacity:1} 50%{opacity:0.5} }'
    document.head.appendChild(style)
    pulseStyleAdded = true
}

export default function VoiceSearchButton({ onResult, disabled = false, size = 32 }) {
    const [listening, setListening] = useState(false)
    const [supported, setSupported] = useState(true)
    const recognitionRef = useRef(null)
    const onResultRef = useRef(onResult)
    onResultRef.current = onResult

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) setSupported(false)
        ensurePulseKeyframes()
    }, [])

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = null
            recognitionRef.current.onerror = null
            recognitionRef.current.onend = null
            recognitionRef.current.stop()
            recognitionRef.current = null
        }
        setListening(false)
    }, [])

    const start = useCallback(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SR) { setSupported(false); return }

        stop()

        const recognition = new SR()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            onResultRef.current(transcript)
            setListening(false)
            recognitionRef.current = null
        }
        recognition.onerror = (e) => {
            if (e.error !== 'aborted') console.warn('Voice error:', e.error)
            setListening(false)
            recognitionRef.current = null
        }
        recognition.onend = () => {
            setListening(false)
            recognitionRef.current = null
        }

        recognitionRef.current = recognition
        recognition.start()
        setListening(true)
    }, [stop])

    useEffect(() => () => stop(), [stop])

    if (!supported) return null

    return (
        <button
            type="button"
            onClick={listening ? stop : start}
            disabled={disabled}
            title={listening ? 'Stop listening' : 'Voice search'}
            aria-label={listening ? 'Stop listening' : 'Voice search'}
            style={{
                width: size, height: size, borderRadius: '50%', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: listening ? '#dc2626' : '#f1f5f9',
                color: listening ? '#fff' : '#64748b',
                transition: 'all 0.15s',
                flexShrink: 0,
                animation: listening ? 'voicePulse 1.5s infinite' : 'none',
            }}
        >
            <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
        </button>
    )
}
