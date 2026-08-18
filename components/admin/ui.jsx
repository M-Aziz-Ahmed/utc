/**
 * Shared admin UI design system.
 * Import from any admin page:  import { PageHeader, Card, Btn, InputField, ... } from '@/components/admin/ui'
 *
 * Design tokens
 * ─────────────
 * Background page : #f6f8fc
 * Background card : #fff
 * Border          : #e8eaed
 * Border light    : #f0f4f8
 * Text primary    : #0f172a
 * Text secondary  : #5f6368
 * Text muted      : #9aa0a6
 * Accent blue     : #1a73e8
 * Accent green    : #059669
 * Accent red      : #dc2626
 * Accent amber    : #f59e0b
 * Radius card     : 10px
 * Radius input    : 8px
 * Radius btn      : 20px (pill) | 8px (square)
 */

'use client'
import { useState } from 'react'

// ── Tokens ────────────────────────────────────────────────────────────────────
export const T = {
    bg: '#f6f8fc',
    card: '#fff',
    border: '#e8eaed',
    borderLight: '#f0f4f8',
    text: '#0f172a',
    textSec: '#5f6368',
    textMuted: '#9aa0a6',
    blue: '#1a73e8',
    green: '#059669',
    red: '#dc2626',
    amber: '#f59e0b',
    purple: '#7c3aed',
}

// ── Page shell ────────────────────────────────────────────────────────────────

/** Full-page wrapper — consistent padding + background */
export const Page = ({ children, style }) => (
    <div style={{ padding: '20px 24px', minHeight: '100vh', background: T.bg, ...style }}>
        {children}
    </div>
)

/** Page title + optional subtitle + right-side actions */
export const PageHeader = ({ title, subtitle, actions, style }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', marginBottom: '20px', ...style }}>
        <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
            {subtitle && <p style={{ fontSize: '12px', color: T.textMuted, margin: '3px 0 0' }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
)

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, noPad }) => (
    <div style={{
        background: T.card, borderRadius: '10px',
        border: `1px solid ${T.border}`,
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        padding: noPad ? 0 : '20px',
        ...style,
    }}>
        {children}
    </div>
)

/** Section heading inside a card */
export const CardSection = ({ title, subtitle, style }) => (
    <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${T.borderLight}`, ...style }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: T.textSec, textTransform: 'uppercase',
            letterSpacing: '0.07em', margin: 0 }}>{title}</p>
        {subtitle && <p style={{ fontSize: '11px', color: T.textMuted, margin: '2px 0 0' }}>{subtitle}</p>}
    </div>
)

// ── Buttons ───────────────────────────────────────────────────────────────────
const BTN_VARIANTS = {
    primary:  { bg: T.blue,   color: '#fff', border: T.blue,     hover: '#1557b0' },
    success:  { bg: T.green,  color: '#fff', border: T.green,    hover: '#047857' },
    danger:   { bg: '#fff',   color: T.red,  border: '#fecaca',  hover: T.red,    hoverText: '#fff', hoverBorder: T.red },
    ghost:    { bg: '#fff',   color: T.textSec, border: T.border, hover: '#f1f3f4' },
    outline:  { bg: 'transparent', color: T.blue, border: T.blue, hover: '#e8f0fe' },
}

export const Btn = ({ children, variant = 'ghost', size = 'md', onClick, disabled, type = 'button', icon, style }) => {
    const [hov, setHov] = useState(false)
    const v = BTN_VARIANTS[variant] || BTN_VARIANTS.ghost
    const pad = size === 'sm' ? '5px 12px' : size === 'lg' ? '11px 28px' : '8px 18px'
    const fs  = size === 'sm' ? '11px' : size === 'lg' ? '14px' : '12px'
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: pad, fontSize: fs, fontWeight: 600, borderRadius: '20px',
                border: `1px solid ${hov && v.hoverBorder ? v.hoverBorder : v.border}`,
                background: hov ? v.hover : v.bg,
                color: hov && v.hoverText ? v.hoverText : v.color,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.55 : 1,
                transition: 'all 0.14s',
                whiteSpace: 'nowrap',
                boxShadow: (variant === 'primary' || variant === 'success') && !disabled
                    ? `0 2px 6px ${v.bg}55` : 'none',
                ...style,
            }}
        >
            {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
            {children}
        </button>
    )
}

// ── Form helpers ──────────────────────────────────────────────────────────────

/** Labelled field wrapper */
export const Field = ({ label, required, hint, children, style }) => (
    <div style={style}>
        {label && (
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: T.textSec,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                {label}
                {required && <span style={{ color: T.red, marginLeft: '2px' }}>*</span>}
            </label>
        )}
        {children}
        {hint && <p style={{ fontSize: '10px', color: T.textMuted, margin: '3px 0 0' }}>{hint}</p>}
    </div>
)

const inputBase = {
    width: '100%', padding: '8px 11px',
    border: `1px solid ${T.border}`, borderRadius: '8px',
    fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
    color: T.text, fontFamily: 'inherit',
    transition: 'border-color 0.14s, box-shadow 0.14s',
}

const inputFocus = (e) => {
    e.target.style.borderColor = T.blue
    e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)'
}
const inputBlur = (e) => {
    e.target.style.borderColor = T.border
    e.target.style.boxShadow = 'none'
}

export const Input = ({ value, onChange, placeholder, type = 'text', required, readOnly, style, ...rest }) => (
    <input
        type={type} value={value ?? ''} onChange={onChange}
        placeholder={placeholder} required={required} readOnly={readOnly}
        onFocus={inputFocus} onBlur={inputBlur}
        style={{ ...inputBase, background: readOnly ? '#f8f9fa' : '#fff', cursor: readOnly ? 'default' : 'text', ...style }}
        {...rest}
    />
)

export const Textarea = ({ value, onChange, placeholder, rows = 3, style, ...rest }) => (
    <textarea
        value={value ?? ''} onChange={onChange} placeholder={placeholder} rows={rows}
        onFocus={inputFocus} onBlur={inputBlur}
        style={{ ...inputBase, resize: 'vertical', ...style }}
        {...rest}
    />
)

export const Select = ({ value, onChange, children, style, ...rest }) => (
    <select
        value={value ?? ''} onChange={onChange}
        onFocus={inputFocus} onBlur={inputBlur}
        style={{ ...inputBase, cursor: 'pointer', ...style }}
        {...rest}
    >
        {children}
    </select>
)

// ── Search bar ────────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = 'Search...', style }) => (
    <div style={{ position: 'relative', ...style }}>
        <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            width: '13px', height: '13px', color: T.textMuted, pointerEvents: 'none' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
            type="text" value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ ...inputBase, paddingLeft: '30px', borderRadius: '20px' }}
            onFocus={inputFocus} onBlur={inputBlur}
        />
    </div>
)

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, width = '480px', footer }) => (
    <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9990, padding: '16px', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
    >
        <div
            style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: width,
                maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: T.text, margin: 0 }}>{title}</h3>
                <button onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted,
                        display: 'flex', padding: '2px', borderRadius: '50%' }}>
                    <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            {/* Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>{children}</div>
            {/* Footer */}
            {footer && (
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`,
                    display: 'flex', justifyContent: 'flex-end', gap: '8px', flexShrink: 0, background: '#fafafa' }}>
                    {footer}
                </div>
            )}
        </div>
    </div>
)

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    pending:   { color: '#92400e', bg: '#fef3c7' },
    approved:  { color: '#1e40af', bg: '#dbeafe' },
    completed: { color: '#065f46', bg: '#d1fae5' },
    cancelled: { color: '#991b1b', bg: '#fee2e2' },
    active:    { color: '#065f46', bg: '#d1fae5' },
    inactive:  { color: T.textMuted, bg: '#f1f3f4' },
}

export const Badge = ({ label, variant, style }) => {
    const c = STATUS_COLORS[variant] || { color: T.textSec, bg: '#f1f3f4' }
    return (
        <span style={{
            display: 'inline-block', padding: '2px 9px', borderRadius: '10px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
            color: c.color, background: c.bg, ...style,
        }}>
            {label}
        </span>
    )
}

// ── Loading spinner ───────────────────────────────────────────────────────────
export const Spinner = ({ size = 32 }) => (
    <>
        <div style={{
            width: size, height: size, borderRadius: '50%',
            border: '3px solid #e8f0fe', borderTopColor: T.blue,
            animation: 'admin-spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes admin-spin { to { transform: rotate(360deg) } }`}</style>
    </>
)

export const LoadingCenter = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
        <Spinner />
    </div>
)

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState = ({ message = 'No records found', action }) => (
    <div style={{ textAlign: 'center', padding: '48px 20px', background: T.card,
        borderRadius: '10px', border: `1px solid ${T.border}` }}>
        <svg style={{ width: '36px', height: '36px', color: '#cbd5e1', margin: '0 auto 12px', display: 'block' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p style={{ fontSize: '13px', color: T.textMuted, margin: '0 0 12px' }}>{message}</p>
        {action}
    </div>
)

// ── Table helpers ─────────────────────────────────────────────────────────────
export const Table = ({ children, style }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...style }}>{children}</table>
    </div>
)

export const Th = ({ children, center, style }) => (
    <th style={{
        padding: '9px 12px', textAlign: center ? 'center' : 'left',
        fontSize: '10px', fontWeight: 700, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        background: '#f8fafc', borderBottom: `2px solid ${T.borderLight}`,
        whiteSpace: 'nowrap', ...style,
    }}>{children}</th>
)

export const Td = ({ children, center, muted, style }) => (
    <td style={{
        padding: '9px 12px', fontSize: '12px',
        color: muted ? T.textMuted : T.text,
        textAlign: center ? 'center' : 'left',
        borderBottom: `1px solid ${T.borderLight}`, ...style,
    }}>{children}</td>
)

// ── Alert / Save message ──────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message, style }) => {
    const map = {
        success: { bg: '#e6f4ea', color: '#137333', border: '#b7dfbe' },
        error:   { bg: '#fce8e6', color: '#c5221f', border: '#f5c6c2' },
        info:    { bg: '#e8f0fe', color: '#1a73e8', border: '#d2e3fc' },
        warning: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    }
    const c = map[type] || map.info
    return (
        <div style={{
            padding: '10px 14px', borderRadius: '8px', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: c.bg, color: c.color, border: `1px solid ${c.border}`, ...style,
        }}>
            {message}
        </div>
    )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider = ({ style }) => (
    <div style={{ height: '1px', background: T.borderLight, margin: '16px 0', ...style }} />
)

// ── Grid helpers ──────────────────────────────────────────────────────────────
export const Grid = ({ cols = 2, gap = 14, children, style }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: typeof cols === 'number' ? `repeat(${cols}, 1fr)` : cols,
        gap,
        ...style,
    }}>
        {children}
    </div>
)
