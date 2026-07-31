'use client'
import { useState, useRef, useCallback } from 'react'

export default function VoiceSearchButton({ onResult, disabled = false, size = 32 }) {
    const [listening, setListening] = useState(false)
    const [supported, setSupported] = useState(true)
    const recognitionRef = useRef(null)

    const start = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setSupported(false)
            return
        }
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            onResult(transcript)
            setListening(false)
        }
        recognition.onerror = () => setListening(false)
        recognition.onend = () => setListening(false)

        recognitionRef.current = recognition
        recognition.start()
        setListening(true)
    }, [onResult])

    const stop = useCallback(() => {
        recognitionRef.current?.stop()
        setListening(false)
    }, [])

    if (!supported) return null

    return (
        <button
            type="button"
            onClick={listening ? stop : start}
            disabled={disabled}
            title={listening ? 'Stop listening' : 'Voice search'}
            style={{
                width: size, height: size, borderRadius: '50%', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: listening ? '#dc2626' : '#f1f5f9',
                color: listening ? '#fff' : '#64748b',
                transition: 'all 0.15s',
                flexShrink: 0,
                animation: listening ? 'pulse 1.5s infinite' : 'none',
            }}
        >
            <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </button>
    )
}
