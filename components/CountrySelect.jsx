'use client'
import React, { useState, useRef, useEffect, useMemo } from 'react'

export const ALL_COUNTRIES = [
    'Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahrain',
    'Bangladesh','Belarus','Belgium','Benin','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
    'Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia',
    'Comoros','Congo (DRC)','Congo','Costa Rica','Cote d\u0027Ivoire','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
    'Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
    'Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Guatemala',
    'Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hong Kong','Hungary','Iceland','India','Indonesia',
    'Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya',
    'Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg',
    'Madagascar','Malawi','Malaysia','Maldives','Mali','Mauritania','Mauritius','Mexico','Moldova','Mongolia',
    'Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger',
    'Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palestine','Panama','Papua New Guinea','Paraguay',
    'Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal',
    'Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','South Sudan',
    'Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania',
    'Thailand','Togo','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates',
    'United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

const CountrySelect = ({ value, onChange, placeholder = 'Select country…', extraOptions = [], required, autoFocus, style, onFocus, onBlur }) => {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [highlight, setHighlight] = useState(0)
    const ref = useRef(null)
    const inputRef = useRef(null)

    const options = useMemo(() => {
        const combined = [...new Set([...ALL_COUNTRIES, ...(Array.isArray(extraOptions) ? extraOptions : [])].map(x => String(x).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))
        const q = query.trim().toLowerCase()
        return q ? combined.filter(c => c.toLowerCase().includes(q)) : combined
    }, [query, extraOptions])

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    const select = (c) => {
        onChange(c)
        setOpen(false)
        setQuery('')
    }

    const shown = open ? options : []

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <input
                ref={inputRef}
                autoFocus={autoFocus}
                type="text"
                value={open ? query : (value || '')}
                onChange={e => { setQuery(e.target.value); setOpen(true); setHighlight(0) }}
                onFocus={e => { setOpen(true); setHighlight(0); onFocus?.(e) }}
                onBlur={e => onBlur?.(e)}
                onKeyDown={e => {
                    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, options.length - 1)) }
                    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)) }
                    else if (e.key === 'Enter') { e.preventDefault(); if (options[highlight]) select(options[highlight]) }
                    else if (e.key === 'Escape') { setOpen(false) }
                }}
                placeholder={placeholder}
                required={required}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff', ...style }}
            />
            <svg style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9aa0a6', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {shown.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 30, background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.14)', marginTop: '4px', maxHeight: '220px', overflowY: 'auto' }}>
                    {shown.map((c, i) => (
                        <div key={c} onMouseDown={e => { e.preventDefault(); select(c) }} onMouseEnter={() => setHighlight(i)}
                            style={{ padding: '7px 10px', fontSize: '13px', cursor: 'pointer', background: i === highlight ? '#e8f0fe' : '#fff', color: '#202124', fontWeight: i === highlight ? 600 : 400 }}>
                            {c}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CountrySelect
