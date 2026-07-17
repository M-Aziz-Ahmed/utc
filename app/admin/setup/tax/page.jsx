'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const Btn = ({ children, onClick, variant = 'ghost', disabled, type = 'button' }) => {
    const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'
    const variants = {
        ghost:   'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 text-xs',
        primary: 'bg-[#1a73e8] text-white hover:bg-[#1557b0] border border-[#1a73e8] px-3 py-1.5 text-xs',
        danger:  'border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 text-xs',
    }
    return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>{children}</button>
}

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#202124', margin: 0 }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px', borderRadius: '50%' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div style={{ padding: '20px' }}>{children}</div>
        </div>
    </div>
)

const Field = ({ label, children, required }) => (
    <div>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
            {label}{required && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
        </label>
        {children}
    </div>
)

const Input = ({ value, onChange, placeholder, type = 'text', ...rest }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ width: '100%', padding: '7px 10px', border: '1px solid #c4c7c5', borderRadius: '4px', fontSize: '13px', color: '#202124', outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = '#1a73e8'}
        onBlur={e => e.target.style.borderColor = '#c4c7c5'}
        {...rest}
    />
)

const Select = ({ value, onChange, children, ...rest }) => (
    <select
        value={value}
        onChange={onChange}
        style={{ width: '100%', padding: '7px 10px', border: '1px solid #c4c7c5', borderRadius: '4px', fontSize: '13px', color: '#202124', outline: 'none', background: '#fff' }}
        {...rest}
    >{children}</select>
)

export default function TaxSetupPage() {
    const [taxes, setTaxes] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => { load() }, [])

    const load = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/tax')
            if (res.ok) setTaxes(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const saveTax = async (data) => {
        setSaving(true)
        try {
            if (data._id) {
                const res = await fetch(`/api/tax/${data._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: data.name, rate: data.rate, type: data.type, code: data.code, description: data.description, active: data.active })
                })
                if (!res.ok) throw new Error('Failed to update')
            } else {
                const res = await fetch('/api/tax', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: data.name, rate: data.rate, type: data.type, code: data.code, description: data.description, active: data.active })
                })
                if (!res.ok) {
                    const err = await res.json()
                    throw new Error(err.message || 'Failed to create')
                }
            }
            await load()
            setModal(null)
        } catch (e) { alert(e.message) }
        finally { setSaving(false) }
    }

    const deleteTax = async (id) => {
        if (!confirm('Delete this tax?')) return
        await fetch(`/api/tax/${id}`, { method: 'DELETE' })
        await load()
    }

    const toggleActive = async (tax) => {
        await fetch(`/api/tax/${tax._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !tax.active })
        })
        await load()
    }

    const filtered = taxes.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.code || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ padding: '20px 24px', minHeight: '100vh', background: '#f6f8fc' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Link href="/admin/setup" style={{ fontSize: '12px', color: '#9aa0a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onMouseEnter={e => e.currentTarget.style.color='#1a73e8'} onMouseLeave={e => e.currentTarget.style.color='#9aa0a6'}>
                            <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Vehicle Setup
                        </Link>
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#202124', margin: 0 }}>Tax Setup</h1>
                    <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>Define taxations that can be linked to dynamic fields</p>
                </div>
                <Btn variant="primary" onClick={() => setModal({ name: '', rate: '', type: 'percentage', code: '', description: '', active: true })}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Tax
                </Btn>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e8f0fe', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                    {/* Search */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9aa0a6', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search taxes by name or code..."
                                style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', padding: '7px 10px 7px 32px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <span style={{ fontSize: '11px', color: '#9aa0a6', whiteSpace: 'nowrap' }}>{filtered.length} tax{filtered.length !== 1 ? 'es' : ''}</span>
                    </div>

                    {/* Table */}
                    <div style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: '#9aa0a6', fontSize: '13px' }}>
                                {taxes.length === 0 ? 'No taxes defined yet. Add one above.' : 'No taxes match your search'}
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                                        <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Code</th>
                                        <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate</th>
                                        <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</th>
                                        <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                                        <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(tax => (
                                        <tr key={tax._id} style={{ borderBottom: '1px solid #f1f3f4' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '10px 16px' }}>
                                                <div style={{ fontWeight: 600, color: '#202124' }}>{tax.name}</div>
                                                {tax.description && <div style={{ fontSize: '11px', color: '#9aa0a6', marginTop: '1px' }}>{tax.description}</div>}
                                            </td>
                                            <td style={{ padding: '10px 16px' }}>
                                                {tax.code ? (
                                                    <span style={{ background: '#f1f3f4', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, color: '#5f6368' }}>{tax.code}</span>
                                                ) : <span style={{ color: '#dadce0' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#202124' }}>
                                                {tax.type === 'percentage' ? `${tax.rate}%` : `$${tax.rate}`}
                                            </td>
                                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                                                    background: tax.type === 'percentage' ? '#e8f0fe' : '#fef3c7',
                                                    color: tax.type === 'percentage' ? '#1a73e8' : '#92400e',
                                                }}>{tax.type}</span>
                                            </td>
                                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                <button onClick={() => toggleActive(tax)} style={{
                                                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                                    background: tax.active ? '#e6f4ea' : '#f1f3f4',
                                                    color: tax.active ? '#137333' : '#9aa0a6',
                                                }}>
                                                    {tax.active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => setModal({ ...tax })}
                                                        style={{ padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '11px', color: '#1a73e8', fontWeight: 600 }}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => deleteTax(tax._id)}
                                                        style={{ padding: '4px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fff5f5', cursor: 'pointer', color: '#c5221f' }}>
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Tax Modal */}
            {modal && <TaxModal data={modal} saving={saving} onSave={saveTax} onClose={() => setModal(null)} />}

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

function TaxModal({ data, saving, onSave, onClose }) {
    const [form, setForm] = useState({
        name: data.name || '',
        rate: data.rate ?? '',
        type: data.type || 'percentage',
        code: data.code || '',
        description: data.description || '',
        active: data.active !== false,
    })

    return (
        <Modal title={data._id ? 'Edit Tax' : 'Add Tax'} onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Tax Name" required>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. VAT, Sales Tax" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Rate" required>
                        <Input type="number" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} placeholder={form.type === 'percentage' ? 'e.g. 15' : 'e.g. 5.00'} step="0.01" min="0" />
                    </Field>
                    <Field label="Type">
                        <Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                        </Select>
                    </Field>
                </div>
                <Field label="Code">
                    <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. VAT, GST, WHT" />
                </Field>
                <Field label="Description">
                    <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
                </Field>
                <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#5f6368', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
                    <div className="flex gap-3">
                        {[{ label: 'Active', value: true }, { label: 'Inactive', value: false }].map(({ label: optLabel, value }) => (
                            <label key={String(value)} style={{
                                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                                border: form.active === value ? '1px solid #1a73e8' : '1px solid #e0e0e0',
                                background: form.active === value ? '#e8f0fe' : '#fff',
                                color: form.active === value ? '#1a73e8' : '#5f6368',
                            }}>
                                <input type="radio" style={{ display: 'none' }} checked={form.active === value} onChange={() => setForm(p => ({ ...p, active: value }))} />
                                {optLabel}
                            </label>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px', borderTop: '1px solid #f1f3f4', paddingTop: '14px' }}>
                    <Btn onClick={onClose}>Cancel</Btn>
                    <Btn variant="primary" disabled={!form.name.trim() || !form.rate || saving} onClick={() => onSave(form)}>
                        {saving ? 'Saving…' : data._id ? 'Save Changes' : 'Add Tax'}
                    </Btn>
                </div>
            </div>
        </Modal>
    )
}
