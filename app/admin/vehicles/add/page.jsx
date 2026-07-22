'use client'
import { useState, useEffect, useMemo } from 'react'

const LETTERS = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]

const COUNTRIES = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"]

// ── Search input ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
    <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9aa0a6', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
            type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: '100%', paddingLeft: '36px', paddingRight: value ? '32px' : '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8f9fa', boxSizing: 'border-box', color: '#202124' }}
            onFocus={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.background = '#f8f9fa'; e.target.style.boxShadow = 'none' }}
        />
        {value && (
            <button onClick={() => onChange('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', padding: '2px', display: 'flex' }}>
                <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        )}
    </div>
)

// ── A–Z filter ─────────────────────────────────────────────────────────────────
const AlphaFilter = ({ value, onChange, available }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
        {LETTERS.map(l => {
            const isAvail = l === 'All' || available.has(l)
            const isActive = value === l
            return (
                <button key={l} onClick={() => onChange(isActive ? 'All' : l)} disabled={!isAvail}
                    style={{
                        width: l === 'All' ? '36px' : '26px', height: '26px', borderRadius: '6px', border: 'none',
                        fontSize: '11px', fontWeight: 700, cursor: isAvail ? 'pointer' : 'not-allowed', transition: 'all 0.1s',
                        background: isActive ? '#1a73e8' : isAvail ? '#f1f3f4' : 'transparent',
                        color: isActive ? '#fff' : isAvail ? '#444746' : '#dadce0',
                    }}>
                    {l}
                </button>
            )
        })}
    </div>
)

// ── Pill grid ─────────────────────────────────────────────────────────────────
const PillGrid = ({ items, selected, onSelect, getLabel, getSub, emptyMsg, emptyAction, onEdit }) => {
    if (items.length === 0) return (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: '#f8f9fa', borderRadius: '10px', border: '2px dashed #e0e0e0' }}>
            <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '0 0 10px' }}>{emptyMsg}</p>
            {emptyAction}
        </div>
    )
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignContent: 'flex-start' }}>
            {items.map((item, idx) => {
                const isSelected = selected === item || selected?._id === item?._id || selected?.name === item?.name
                return (
                    <div key={item._id || idx} style={{ position: 'relative' }}
                        onMouseEnter={e => { if (onEdit) { const btn = e.currentTarget.querySelector('.edit-btn'); if (btn) btn.style.opacity = '1' } }}
                        onMouseLeave={e => { if (onEdit) { const btn = e.currentTarget.querySelector('.edit-btn'); if (btn) btn.style.opacity = '0' } }}
                    >
                        <button onClick={() => onSelect(item)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                padding: getSub ? '10px 16px' : '8px 16px',
                                paddingRight: onEdit ? '30px' : (getSub ? '16px' : '16px'),
                                borderRadius: '10px', border: isSelected ? '2px solid #1a73e8' : '1px solid #e0e0e0',
                                background: isSelected ? '#e8f0fe' : '#fff', cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.12s', minWidth: '90px',
                                boxShadow: isSelected ? '0 2px 8px rgba(26,115,232,0.18)' : '0 1px 3px rgba(0,0,0,0.06)',
                            }}
                            onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#1a73e8'; e.currentTarget.style.background = '#f0f4ff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,115,232,0.12)' } }}
                            onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' } }}
                        >
                            <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#1a73e8' : '#202124', lineHeight: 1.3 }}>{getLabel(item)}</span>
                            {getSub && getSub(item) && (
                                <span style={{ fontSize: '11px', color: isSelected ? '#4285f4' : '#9aa0a6', marginTop: '2px' }}>{getSub(item)}</span>
                            )}
                        </button>
                        {onEdit && (
                            <button className="edit-btn" onClick={e => { e.stopPropagation(); onEdit(item, idx) }}
                                style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '5px', background: '#f1f3f4', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}>
                                <svg style={{ width: '11px', height: '11px', color: '#5f6368' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                                </svg>
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ── Back button ───────────────────────────────────────────────────────────────
const BackBtn = ({ onBack }) => (
    onBack ? (
        <button onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', fontSize: '12px', fontWeight: 500, color: '#5f6368', border: '1px solid #e0e0e0', borderRadius: '20px', background: '#fff', cursor: 'pointer', transition: 'all 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
            <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
        </button>
    ) : <div />
)

// ── Reusable add-field form (vehicles and accounts modals) ────────────────────
const AddFieldForm = ({ belongsto, onDone, onCancel, FIELD_TYPES, existingFields = [] }) => {
    const [field, setField] = useState({ label: '', type: 'text', isRequired: false, options: [], linkedFields: [] })
    const [optionInput, setOptionInput] = useState('')
    const [adding, setAdding] = useState(false)
    const [msg, setMsg] = useState(null)

    const handleAdd = async () => {
        if (!field.label.trim()) return
        setAdding(true); setMsg(null)
        try {
            const payload = { ...field, belongsto }
            if (field.type === 'dropdown') payload.options = field.options.filter(o => o.trim())
            if (field.type === 'select-year') {
                const currentYear = new Date().getFullYear()
                const years = []
                for (let y = currentYear; y >= 1950; y--) years.push(String(y))
                payload.options = years
            }
            if (field.type === 'select-country') {
                payload.options = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"].sort((a, b) => a.localeCompare(b))
            }
            if (field.type === 'sum') payload.linkedFields = field.linkedFields
            const res = await fetch('/api/newField', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed')
            onDone()
        } catch (err) { setMsg(err.message) }
        finally { setAdding(false) }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Label *</label>
                <input autoFocus type="text" value={field.label} onChange={e => setField(f => ({ ...f, label: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Push Price" />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Type</label>
                <select value={field.type} onChange={e => setField(f => ({ ...f, type: e.target.value, options: [], linkedFields: [] }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            {field.type === 'dropdown' && (
                <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Options</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                        {field.options.map((opt, i) => (
                            <div key={i} style={{ display: 'flex', gap: '6px' }}>
                                <input type="text" value={opt} onChange={e => setField(f => ({ ...f, options: f.options.map((o, j) => j === i ? e.target.value : o) }))}
                                    style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none' }} placeholder={`Option ${i + 1}`} />
                                <button type="button" onClick={() => setField(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))}
                                    style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: '#c5221f', fontSize: '14px' }}>✕</button>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="text" value={optionInput} onChange={e => setOptionInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (optionInput.trim()) { setField(f => ({ ...f, options: [...f.options, optionInput.trim()] })); setOptionInput('') } } }}
                            style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none' }} placeholder="Type option, press Enter" />
                        <button type="button" onClick={() => { if (optionInput.trim()) { setField(f => ({ ...f, options: [...f.options, optionInput.trim()] })); setOptionInput('') } }}
                            style={{ padding: '6px 12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
                    </div>
                </div>
            )}
            {field.type === 'select-year' && (
                <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#0e7490' }}>Options will be years from <strong>{new Date().getFullYear()}</strong> down to <strong>1950</strong>. Generated automatically.</p>
                </div>
            )}
            {field.type === 'select-country' && (
                <div style={{ background: '#f7fee7', border: '1px solid #bef264', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#4d7c0f' }}>Options will be <strong>195 countries</strong> sorted A-Z. Generated automatically.</p>
                </div>
            )}
            {field.type === 'sum' && existingFields.length > 0 && (
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Source Fields to Sum</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                        {existingFields.filter(f => f.type === 'number').map(f => (
                            <label key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', background: field.linkedFields.includes(f.label) ? '#ede9fe' : 'transparent' }}>
                                <input type="checkbox" checked={field.linkedFields.includes(f.label)} onChange={() => setField(p => ({ ...p, linkedFields: p.linkedFields.includes(f.label) ? p.linkedFields.filter(l => l !== f.label) : [...p.linkedFields, f.label] }))} style={{ accentColor: '#6d28d9' }} />
                                {f.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Required?</span>
                {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                    <label key={String(val)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: field.isRequired === val ? '1px solid #1a73e8' : '1px solid #e0e0e0', background: field.isRequired === val ? '#e8f0fe' : '#fff', color: field.isRequired === val ? '#1a73e8' : '#5f6368' }}>
                        <input type="radio" style={{ display: 'none' }} checked={field.isRequired === val} onChange={() => setField(f => ({ ...f, isRequired: val }))} />
                        {label}
                    </label>
                ))}
            </div>
            {msg && <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: '#fce8e6', color: '#c5221f', border: '1px solid #f5c6c2' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={onCancel} style={{ flex: 1, padding: '9px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                <button onClick={handleAdd} disabled={!field.label.trim() || adding} style={{ flex: 1, padding: '9px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.7 : 1 }}>{adding ? 'Adding...' : 'Add Field'}</button>
            </div>
        </div>
    )
}

// ── Two-panel selection layout (defined outside component to prevent remount) ─
const SelectionPanel = ({ title, subtitle, countLabel, search, onSearch, searchPlaceholder, letter, onLetter, available, items, selected, onSelect, getLabel, getSub, emptyMsg, emptyAction, onEdit, onBack, extraAction }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Panel header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: 0 }}>{title}</h2>
                {subtitle && <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '3px 0 0' }}>{subtitle}</p>}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                {extraAction}
                {onBack && <BackBtn onBack={onBack} />}
            </div>
        </div>
        {/* Search */}
        <div style={{ marginBottom: '14px' }}>
            <SearchBar value={search} onChange={v => { onSearch(v); onLetter('All') }} placeholder={searchPlaceholder} />
        </div>
        {/* A-Z */}
        <div style={{ marginBottom: '14px' }}>
            <AlphaFilter value={letter} onChange={onLetter} available={available} />
        </div>
        {/* Count + selected badge */}
        <div style={{ marginBottom: '10px', fontSize: '11px', color: '#9aa0a6' }}>
            {items.length} {countLabel}
            {selected && <span style={{ marginLeft: '10px', color: '#1a73e8', fontWeight: 600 }}>✓ {getLabel(selected)}</span>}
        </div>
        {/* Scrollable pill grid */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            <PillGrid items={items} selected={selected} onSelect={onSelect} getLabel={getLabel} getSub={getSub} emptyMsg={emptyMsg} emptyAction={emptyAction} onEdit={onEdit} />
        </div>
    </div>
)

// ── Main component ─────────────────────────────────────────────────────────────
const AddVehiclePage = () => {
    const [currentStep, setCurrentStep] = useState(1)

    const [auctionGroups, setAuctionGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [groupSearch, setGroupSearch] = useState('')
    const [groupLetter, setGroupLetter] = useState('All')

    const [selectedVenue, setSelectedVenue] = useState(null)
    const [venueSearch, setVenueSearch] = useState('')
    const [venueLetter, setVenueLetter] = useState('All')

    const [manufacturers, setManufacturers] = useState([])
    const [selectedManufacturer, setSelectedManufacturer] = useState(null)
    const [mfgSearch, setMfgSearch] = useState('')
    const [mfgLetter, setMfgLetter] = useState('All')

    const [selectedModel, setSelectedModel] = useState(null)
    const [modelSearch, setModelSearch] = useState('')
    const [modelLetter, setModelLetter] = useState('All')

    const [selectedVariant, setSelectedVariant] = useState('')

    const [formData, setFormData] = useState({})
    const [fields, setFields] = useState([])
    const [accountFields, setAccountFields] = useState([])
    const [accountData, setAccountData] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [createdVehicleId, setCreatedVehicleId] = useState(null)
    const [createdVehicleQr, setCreatedVehicleQr] = useState(null)

    const [showAddManufacturer, setShowAddManufacturer] = useState(false)
    const [showAddModel, setShowAddModel] = useState(false)
    const [showAddVariant, setShowAddVariant] = useState(false)
    const [showAddField, setShowAddField] = useState(false)
    const [showAddGroup, setShowAddGroup] = useState(false)
    const [showAddVenue, setShowAddVenue] = useState(false)
    const [newGroup, setNewGroup] = useState({ name: '', venues: [] })
    const [newVenue, setNewVenue] = useState({ name: '', membership: '', tel: '', fax: '', email: '', postal: '', address: '' })
    const [showVenueForm, setShowVenueForm] = useState(false)
    const [showAddAccountField, setShowAddAccountField] = useState(false)
    const [newField, setNewField] = useState({ label: '', type: 'text', isRequired: false, options: [], linkedFields: [] })
    const [newFieldOption, setNewFieldOption] = useState('')
    const [addingField, setAddingField] = useState(false)
    const [addFieldMsg, setAddFieldMsg] = useState(null)

    const FIELD_TYPES = ['text', 'number', 'boolean', 'email', 'date', 'file', 'image', 'dropdown', 'select-year', 'select-country', 'tax', 'sum']
    const [newManufacturer, setNewManufacturer] = useState({ name: '', country: '' })
    const [newModel, setNewModel] = useState({ name: '', description: '', defaults: {} })
    const [newVariant, setNewVariant] = useState('')
    const [saving, setSaving] = useState(false)
    const [taxes, setTaxes] = useState([])

    const [editingMaker, setEditingMaker] = useState(null)
    const [editingModel, setEditingModel] = useState(null)

    const [inlineAddOption, setInlineAddOption] = useState(null)
    const [inlineOptionValue, setInlineOptionValue] = useState('')
    const [inlineAdding, setInlineAdding] = useState(false)
    const [addMainImageUrl, setAddMainImageUrl] = useState('')

    useEffect(() => { fetchAuctionGroups(); fetchManufacturers(); fetchFields(); fetchAccountFields(); fetchTaxes() }, [])

    const fetchAuctionGroups = async () => {
        try { const res = await fetch('/api/auctionGroup'); if (res.ok) setAuctionGroups((await res.json()) || []) } catch (e) { console.error(e) }
    }
    const fetchManufacturers = async () => {
        try { const res = await fetch('/api/manufacturer'); if (res.ok) setManufacturers((await res.json()).filter(m => !m.isRikusoCompany)) } catch (e) { console.error(e) }
    }
    const fetchFields = async () => {
        try {
            const res = await fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'add-vehicles' }) })
            const data = await res.json()
            if (res.ok && Array.isArray(data)) setFields(data)
        } catch (e) { console.error(e) }
    }
    const fetchAccountFields = async () => {
        try {
            const res = await fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'accounts' }) })
            const data = await res.json()
            if (res.ok && Array.isArray(data)) setAccountFields(data)
        } catch (e) { console.error(e) }
    }
    const fetchTaxes = async () => {
        try {
            const res = await fetch('/api/tax')
            if (res.ok) setTaxes(await res.json())
        } catch (e) { console.error(e) }
    }

    const handleAddGroup = async () => {
        if (!newGroup.name.trim()) return
        setSaving(true)
        try {
            const res = await fetch('/api/auctionGroup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newGroup.name.trim(), options: newGroup.venues }) })
            if (res.ok) { const data = await res.json(); setAuctionGroups(prev => [...prev, data.group]); setSelectedGroup(data.group); setShowAddGroup(false); setNewGroup({ name: '', venues: [] }) }
        } finally { setSaving(false) }
    }

    const handleAddVenue = async () => {
        if (!newVenue.name.trim() || !selectedGroup) return
        setSaving(true)
        try {
            const res = await fetch('/api/auctionGroup', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedGroup._id, options: [...(selectedGroup.options || []), newVenue] }) })
            if (res.ok) { const data = await res.json(); const updated = data.group; setAuctionGroups(prev => prev.map(g => g._id === updated._id ? updated : g)); setSelectedGroup(updated); setShowAddVenue(false); setNewVenue({ name: '', membership: '', tel: '', fax: '', email: '', postal: '', address: '' }) }
        } finally { setSaving(false) }
    }

    const handleAddManufacturer = async () => {
        if (!newManufacturer.name.trim()) return
        setSaving(true)
        try {
            const res = await fetch('/api/manufacturer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newManufacturer) })
            if (res.ok) { const m = await res.json(); setManufacturers(prev => [...prev, m]); setSelectedManufacturer(m); setShowAddManufacturer(false); setNewManufacturer({ name: '', country: '' }) }
        } finally { setSaving(false) }
    }

    const handleAddModel = async () => {
        if (!newModel.name.trim() || !selectedManufacturer) return
        setSaving(true)
        try {
            const cleanDefaults = Object.fromEntries(Object.entries(newModel.defaults || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined))
            const modelData = { name: newModel.name, description: newModel.description, dimensions: newModel.dimensions || {}, defaults: cleanDefaults }
            const updated = { ...selectedManufacturer, models: [...(selectedManufacturer.models || []), modelData] }
            const res = await fetch(`/api/manufacturer/${selectedManufacturer._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
            if (res.ok) { const u = await res.json(); setManufacturers(prev => prev.map(m => m._id === u._id ? u : m)); setSelectedManufacturer(u); setSelectedModel(u.models[u.models.length - 1]); setShowAddModel(false); setNewModel({ name: '', description: '', defaults: {} }) }
        } finally { setSaving(false) }
    }

    const handleAddVariant = async () => {
        if (!newVariant.trim() || !selectedModel || !selectedManufacturer) return
        setSaving(true)
        try {
            const updatedModels = selectedManufacturer.models.map(m => m.name === selectedModel.name ? { ...m, variants: [...(m.variants || []), newVariant.trim()] } : m)
            const res = await fetch(`/api/manufacturer/${selectedManufacturer._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...selectedManufacturer, models: updatedModels }) })
            if (res.ok) { const u = await res.json(); setManufacturers(prev => prev.map(m => m._id === u._id ? u : m)); setSelectedManufacturer(u); setSelectedModel(u.models.find(m => m.name === selectedModel.name)); setSelectedVariant(newVariant.trim()); setShowAddVariant(false); setNewVariant('') }
        } finally { setSaving(false) }
    }

    const handleAddField = async () => {
        if (!newField.label.trim()) return
        setAddingField(true); setAddFieldMsg(null)
        try {
            const payload = { ...newField, belongsto: 'add-vehicles' }
            if (newField.type === 'dropdown') payload.options = newField.options.filter(o => o.trim())
            if (newField.type === 'select-year') {
                const currentYear = new Date().getFullYear()
                const years = []
                for (let y = currentYear; y >= 1950; y--) years.push(String(y))
                payload.options = years
            }
            if (newField.type === 'select-country') {
                payload.options = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"].sort((a, b) => a.localeCompare(b))
            }
            if (newField.type === 'sum') payload.linkedFields = newField.linkedFields
            const res = await fetch('/api/newField', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create field')
            await fetchFields(); setShowAddField(false); setNewField({ label: '', type: 'text', isRequired: false, options: [], linkedFields: [] }); setNewFieldOption(''); setAddFieldMsg(null)
        } catch (err) { setAddFieldMsg({ type: 'error', text: err.message }) }
        finally { setAddingField(false) }
    }

    const handleSaveMakerEdit = async () => {
        if (!editingMaker?.name?.trim()) return
        setSaving(true)
        try {
            const res = await fetch(`/api/manufacturer/${editingMaker._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingMaker.name.trim(), country: editingMaker.country }) })
            if (!res.ok) throw new Error('Failed to update')
            const updated = await res.json()
            setManufacturers(prev => prev.map(m => m._id === updated._id ? updated : m))
            if (selectedManufacturer?._id === updated._id) setSelectedManufacturer(updated)
            setEditingMaker(null)
        } catch (e) { alert(e.message) } finally { setSaving(false) }
    }

    const handleSaveModelEdit = async () => {
        if (!editingModel?.name?.trim() || !selectedManufacturer) return
        setSaving(true)
        try {
            const updatedModels = selectedManufacturer.models.map((m, i) => i === editingModel.modelIndex ? { ...m, name: editingModel.name.trim(), description: editingModel.description } : m)
            const res = await fetch(`/api/manufacturer/${selectedManufacturer._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ models: updatedModels }) })
            if (!res.ok) throw new Error('Failed to update')
            const updated = await res.json()
            setManufacturers(prev => prev.map(m => m._id === updated._id ? updated : m))
            setSelectedManufacturer(updated)
            if (selectedModel && selectedModel.name === selectedManufacturer.models[editingModel.modelIndex]?.name) setSelectedModel(updated.models[editingModel.modelIndex])
            setEditingModel(null)
        } catch (e) { alert(e.message) } finally { setSaving(false) }
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setSubmitting(true); setError(null)
        const fd = new FormData()
        fd.append('vehicleData', JSON.stringify({
            ...formData,
            ...accountData,
            auctionGroup: selectedGroup?.name, auctionGroupId: selectedGroup?._id,
            auctionVenue: selectedVenue?.name,
            manufacturer: selectedManufacturer?.name, manufacturerId: selectedManufacturer?._id,
            model: selectedModel?.name,
            modelDescription: (() => {
                const descField = fields.find(f => f.label?.toLowerCase().trim() === 'description')
                return (descField && formData[descField._id]) || selectedModel?.description || ''
            })(),
            mainImageIndex: addMainImageUrl || '',
        }))
        fields.forEach(f => {
            const v = formData[f._id]
            if ((f.type === 'file' || f.type === 'image') && Array.isArray(v))
                v.forEach((fo, i) => fd.append(`dynamic_${f.label}_${i}`, fo.file))
        })
        accountFields.forEach(f => {
            const v = accountData[f._id]
            if ((f.type === 'file' || f.type === 'image') && Array.isArray(v))
                v.forEach((fo, i) => fd.append(`dynamic_${f.label}_${i}`, fo.file))
        })
        try {
            const res = await fetch('/api/vehicles', { method: 'POST', body: fd })
            if (!res.ok) throw new Error('Failed to add vehicle')
            const data = await res.json()
            setCreatedVehicleId(data.vehicleId)
            setSuccess(true)
            fetch(`/api/qr/${data.vehicleId}`).then(r => r.ok ? r.json() : null).then(qr => { if (qr) setCreatedVehicleQr(qr) }).catch(() => {})
            setTimeout(() => { window.location.href = '/admin/vehicles' }, 15000)
        } catch (err) { setError(err.message) } finally { setSubmitting(false) }
    }

    const handleChange = (id, value) => setFormData(prev => ({ ...prev, [id]: value }))
    const handleAccountChange = (id, value) => setAccountData(prev => ({ ...prev, [id]: value }))

    const sortByName = (a, b) => (a.name || '').localeCompare(b.name || '')

    const filteredGroups = useMemo(() => {
        const available = new Set(auctionGroups.map(g => g.name?.[0]?.toUpperCase()).filter(Boolean))
        const list = auctionGroups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase())).filter(g => groupLetter === 'All' || g.name?.[0]?.toUpperCase() === groupLetter).sort(sortByName)
        return { list, available }
    }, [auctionGroups, groupSearch, groupLetter])

    const filteredVenues = useMemo(() => {
        const all = selectedGroup?.options || []
        const available = new Set(all.map(v => v.name?.[0]?.toUpperCase()).filter(Boolean))
        const list = all.filter(v => v.name?.toLowerCase().includes(venueSearch.toLowerCase())).filter(v => venueLetter === 'All' || v.name?.[0]?.toUpperCase() === venueLetter).sort(sortByName)
        return { list, available }
    }, [selectedGroup, venueSearch, venueLetter])

    const filteredMfg = useMemo(() => {
        const available = new Set(manufacturers.map(m => m.name?.[0]?.toUpperCase()).filter(Boolean))
        const list = manufacturers.filter(m => m.name.toLowerCase().includes(mfgSearch.toLowerCase()) || m.country?.toLowerCase().includes(mfgSearch.toLowerCase())).filter(m => mfgLetter === 'All' || m.name?.[0]?.toUpperCase() === mfgLetter).sort(sortByName)
        return { list, available }
    }, [manufacturers, mfgSearch, mfgLetter])

    const filteredModels = useMemo(() => {
        const all = selectedManufacturer?.models || []
        const available = new Set(all.map(m => m.name?.[0]?.toUpperCase()).filter(Boolean))
        const list = all.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase())).filter(m => modelLetter === 'All' || m.name?.[0]?.toUpperCase() === modelLetter).sort(sortByName)
        return { list, available }
    }, [selectedManufacturer, modelSearch, modelLetter])

    const handleInlineAddOption = async (field) => {
        const val = inlineOptionValue.trim()
        if (!val) return
        if (field.options?.includes(val)) { setInlineOptionValue(''); setInlineAddOption(null); return }
        setInlineAdding(true)
        try {
            const newOptions = [...(field.options || []), val]
            const res = await fetch(`/api/fields/${field._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ options: newOptions }) })
            if (!res.ok) throw new Error('Failed')
            setFields(prev => prev.map(f => f._id === field._id ? { ...f, options: newOptions } : f))
            setInlineOptionValue(''); setInlineAddOption(null)
        } catch (e) { alert(e.message) } finally { setInlineAdding(false) }
    }

    const renderInput = (field) => {
        let value = formData[field._id] ?? ''
        const isPurchaseDate = field.label?.toLowerCase().includes('purchase') && field.label?.toLowerCase().includes('date')
        if (isPurchaseDate && value === '' && field.type === 'date') {
            value = new Date().toISOString().split('T')[0]
            if (formData[field._id] === undefined) {
                setFormData(prev => ({ ...prev, [field._id]: value }))
            }
        }
        if (field.type === 'dropdown' || field.type === 'select-year' || field.type === 'select-country') return (
            <div>
                <div className="flex gap-1.5">
                    <select required={field.isRequired} value={value} onChange={e => handleChange(field._id, e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">Select...</option>
                        {[...(field.options || [])].sort((a, b) => { const na = Number(a), nb = Number(b); if (!isNaN(na) && !isNaN(nb)) return na - nb; return a.localeCompare(b) }).map((o, i) => <option key={i} value={o}>{o}</option>)}
                    </select>
                    {field.type === 'dropdown' && <button type="button" onClick={() => { setInlineAddOption(inlineAddOption === field._id ? null : field._id); setInlineOptionValue('') }} title="Add new option"
                        className={`px-3 rounded-lg border text-sm font-semibold transition ${inlineAddOption === field._id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-600'}`}>+</button>}
                </div>
                {inlineAddOption === field._id && (
                    <div className="flex gap-1.5 mt-1.5">
                        <input autoFocus type="text" value={inlineOptionValue} onChange={e => setInlineOptionValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleInlineAddOption(field) } if (e.key === 'Escape') { setInlineAddOption(null); setInlineOptionValue('') } }}
                            placeholder="New option..." className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
                        <button type="button" onClick={() => handleInlineAddOption(field)} disabled={!inlineOptionValue.trim() || inlineAdding} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition">{inlineAdding ? '...' : 'Add'}</button>
                        <button type="button" onClick={() => { setInlineAddOption(null); setInlineOptionValue('') }} className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition">✕</button>
                    </div>
                )}
            </div>
        )
        if (field.type === 'boolean') return (
            <div className="flex gap-2">
                {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value: opt }) => (
                    <label key={String(opt)} className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border-2 text-sm ${formData[field._id] === opt ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-600'}`}>
                        <input type="radio" className="sr-only" checked={formData[field._id] === opt} onChange={() => handleChange(field._id, opt)} />
                        {label}
                    </label>
                ))}
            </div>
        )
        if (field.type === 'tax') {
            const linkedTax = taxes.find(t => t._id === field.linkedTax)
            const sourceField = fields.find(f => f.label === field.linkedField) || accountFields.find(f => f.label === field.linkedField)
            const allData = { ...formData, ...accountData }
            const sourceVal = sourceField ? parseFloat(allData[sourceField._id]) || 0 : 0
            let taxAmount = 0
            if (linkedTax && sourceVal > 0) {
                taxAmount = linkedTax.type === 'percentage'
                    ? (sourceVal * linkedTax.rate / 100)
                    : linkedTax.rate
            }
            return (
                <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #fbbf24', background: '#fffbeb' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {linkedTax ? linkedTax.name : 'Tax'}{linkedTax?.code ? ` (${linkedTax.code})` : ''}
                        </span>
                        {linkedTax && <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '8px', background: linkedTax.type === 'percentage' ? '#fef3c7' : '#e0e7ff', color: linkedTax.type === 'percentage' ? '#92400e' : '#3730a3', fontWeight: 600 }}>{linkedTax.type === 'percentage' ? `${linkedTax.rate}%` : `Fixed $${linkedTax.rate}`}</span>}
                    </div>
                    {sourceField && <div style={{ fontSize: '10px', color: '#9aa0a6', marginBottom: '4px' }}>Based on: <span style={{ fontWeight: 600, color: '#5f6368' }}>{sourceField.label}</span> = {sourceVal.toLocaleString()}</div>}
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#92400e' }}>
                        {taxAmount > 0 ? taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                    </div>
                </div>
            )
        }
        if (field.type === 'sum') {
            const allData = { ...formData, ...accountData }
            const linkedFieldLabels = field.linkedFields || []
            let sum = 0
            const parts = []
            linkedFieldLabels.forEach(label => {
                const src = fields.find(f => f.label === label) || accountFields.find(f => f.label === label)
                if (src) {
                    const val = parseFloat(allData[src._id]) || 0
                    sum += val
                    if (val !== 0) parts.push({ label: src.label, val })
                }
            })
            return (
                <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #c4b5fd', background: '#f5f3ff' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sum of {linkedFieldLabels.length} field{linkedFieldLabels.length !== 1 ? 's' : ''}</span>
                    </div>
                    {parts.length > 0 && <div style={{ fontSize: '10px', color: '#9aa0a6', marginBottom: '4px' }}>{parts.map(p => p.label).join(' + ')}</div>}
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#6d28d9' }}>
                        {sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            )
        }
        if (field.type === 'file' || field.type === 'image') {
            const files = Array.isArray(formData[field._id]) ? formData[field._id] : []
            return (
                <div className="space-y-2">
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {files.map((f, idx) => {
                                const key = `${field.label}:${idx}`
                                const isMain = addMainImageUrl === key
                                return (
                                    <div key={f.id} className="relative shrink-0 rounded-lg overflow-hidden border-2 transition" style={{ width: '84px', height: '66px', borderColor: isMain ? '#f59e0b' : '#e5e7eb' }}>
                                        {f.preview ? <img src={f.preview} alt={f.name} className="w-full h-full object-contain bg-gray-50" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">{f.name?.split('.').pop()}</div>}
                                        {f.preview && <button type="button" onClick={() => setAddMainImageUrl(isMain ? '' : key)} title={isMain ? 'Remove as main' : 'Set as main image'} className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs leading-none" style={{ background: isMain ? '#f59e0b' : 'rgba(0,0,0,0.45)' }}>★</button>}
                                        <button type="button" onClick={() => {
                                            const updated = files.filter((_, i) => i !== idx)
                                            handleChange(field._id, updated)
                                            if (isMain) { setAddMainImageUrl('') } else if (addMainImageUrl) { const [ml, mi] = addMainImageUrl.split(':'); if (ml === field.label && parseInt(mi) > idx) setAddMainImageUrl(`${ml}:${parseInt(mi) - 1}`) }
                                        }} title="Remove" className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs leading-none" style={{ background: '#ef4444' }}>×</button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {files.length > 0 && <p className="text-[10px] text-gray-400">★ = set as cover · × = remove</p>}
                    <input type="file" multiple accept={field.type === 'image' ? 'image/*' : '*'}
                        onChange={e => { const newFiles = Array.from(e.target.files).map(file => ({ file, id: Math.random().toString(36).substring(2), preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null, name: file.name })); handleChange(field._id, [...files, ...newFiles]); e.target.value = '' }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />
                </div>
            )
        }
        return <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} required={field.isRequired} value={value} onChange={e => handleChange(field._id, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder={`Enter ${field.label.toLowerCase()}`} />
    }

    // ── renderAccountInput — same as renderInput but uses accountData/handleAccountChange ──
    const renderAccountInput = (field) => {
        const value = accountData[field._id] ?? ''
        if (field.type === 'dropdown' || field.type === 'select-year' || field.type === 'select-country') return (
                <select required={field.isRequired} value={value} onChange={e => handleAccountChange(field._id, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Select...</option>
                    {[...(field.options || [])].sort((a, b) => { const na = Number(a), nb = Number(b); if (!isNaN(na) && !isNaN(nb)) return na - nb; return a.localeCompare(b) }).map((o, i) => <option key={i} value={o}>{o}</option>)}
                </select>
        )
        if (field.type === 'boolean') return (
            <div className="flex gap-2">
                {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value: opt }) => (
                    <label key={String(opt)} className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border-2 text-sm ${accountData[field._id] === opt ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-600'}`}>
                        <input type="radio" className="sr-only" checked={accountData[field._id] === opt} onChange={() => handleAccountChange(field._id, opt)} />
                        {label}
                    </label>
                ))}
            </div>
        )
        if (field.type === 'tax') {
            const linkedTax = taxes.find(t => t._id === field.linkedTax)
            const sourceField = accountFields.find(f => f.label === field.linkedField) || fields.find(f => f.label === field.linkedField)
            const allData = { ...accountData, ...formData }
            const sourceVal = sourceField ? parseFloat(allData[sourceField._id]) || 0 : 0
            let taxAmount = 0
            if (linkedTax && sourceVal > 0) {
                taxAmount = linkedTax.type === 'percentage'
                    ? (sourceVal * linkedTax.rate / 100)
                    : linkedTax.rate
            }
            return (
                <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #fbbf24', background: '#fffbeb' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {linkedTax ? linkedTax.name : 'Tax'}{linkedTax?.code ? ` (${linkedTax.code})` : ''}
                        </span>
                        {linkedTax && <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '8px', background: linkedTax.type === 'percentage' ? '#fef3c7' : '#e0e7ff', color: linkedTax.type === 'percentage' ? '#92400e' : '#3730a3', fontWeight: 600 }}>{linkedTax.type === 'percentage' ? `${linkedTax.rate}%` : `Fixed $${linkedTax.rate}`}</span>}
                    </div>
                    {sourceField && <div style={{ fontSize: '10px', color: '#9aa0a6', marginBottom: '4px' }}>Based on: <span style={{ fontWeight: 600, color: '#5f6368' }}>{sourceField.label}</span> = {sourceVal.toLocaleString()}</div>}
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#92400e' }}>
                        {taxAmount > 0 ? taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                    </div>
                </div>
            )
        }
        if (field.type === 'sum') {
            const allData = { ...accountData, ...formData }
            const linkedFieldLabels = field.linkedFields || []
            let sum = 0
            const parts = []
            linkedFieldLabels.forEach(label => {
                const src = accountFields.find(f => f.label === label) || fields.find(f => f.label === label)
                if (src) {
                    const val = parseFloat(allData[src._id]) || 0
                    sum += val
                    if (val !== 0) parts.push({ label: src.label, val })
                }
            })
            return (
                <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #c4b5fd', background: '#f5f3ff' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sum of {linkedFieldLabels.length} field{linkedFieldLabels.length !== 1 ? 's' : ''}</span>
                    </div>
                    {parts.length > 0 && <div style={{ fontSize: '10px', color: '#9aa0a6', marginBottom: '4px' }}>{parts.map(p => p.label).join(' + ')}</div>}
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#6d28d9' }}>
                        {sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            )
        }
        return <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} required={field.isRequired} value={value} onChange={e => handleAccountChange(field._id, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder={`Enter ${field.label.toLowerCase()}`} />
    }

    const steps = [
        { num: 1, label: 'Group' },
        { num: 2, label: 'Venue' },
        { num: 3, label: 'Maker' },
        { num: 4, label: 'Model' },
        { num: 5, label: 'Details' },
    ]

    const canGoToStep = (num) => {
        if (num === 1) return true
        if (num === 2) return !!selectedGroup
        if (num === 3) return !!selectedVenue
        if (num === 4) return !!selectedManufacturer
        if (num === 5) return !!selectedModel
        return false
    }

    const crumbs = [selectedGroup?.name, selectedVenue?.name, selectedManufacturer?.name, selectedModel?.name].filter(Boolean)

    return (
        <>
        <div style={{ padding: '16px', minHeight: '100vh', background: '#f6f8fc' }}>

            {/* ── Page header ── */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#202124', margin: 0 }}>Add New Vehicle</h1>
                    {crumbs.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {crumbs.map((c, i) => (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#5f6368' }}>
                                    {i > 0 && <span style={{ color: '#dadce0' }}>›</span>}
                                    <span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '2px 9px', borderRadius: '12px', fontWeight: 600 }}>{c}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                {/* Step pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {steps.map((step, idx) => (
                        <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button onClick={() => canGoToStep(step.num) && setCurrentStep(step.num)} disabled={!canGoToStep(step.num)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px',
                                    borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: 'none',
                                    cursor: canGoToStep(step.num) ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
                                    background: currentStep === step.num ? '#1a73e8' : currentStep > step.num ? '#e6f4ea' : '#f1f3f4',
                                    color: currentStep === step.num ? '#fff' : currentStep > step.num ? '#137333' : canGoToStep(step.num) ? '#444746' : '#bdc1c6',
                                    boxShadow: currentStep === step.num ? '0 2px 8px rgba(26,115,232,0.3)' : 'none',
                                }}>
                                {currentStep > step.num
                                    ? <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    : <span style={{ fontSize: '10px', opacity: 0.7 }}>{step.num}</span>}
                                {step.label}
                            </button>
                            {idx < steps.length - 1 && <div style={{ width: '14px', height: '2px', background: currentStep > step.num ? '#34a853' : '#e0e0e0', borderRadius: '2px' }} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Main content card ── */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

                {/* Steps 1–4: two-column layout — filters on left, results on right */}
                {currentStep <= 4 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '520px' }}>

                        {/* Left sidebar — context + nav */}
                        <div style={{ background: '#f8f9fa', borderRight: '1px solid #e8eaed', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9aa0a6', margin: '0 0 8px' }}>Progress</p>
                            {steps.slice(0, 4).map(step => {
                                const isDone = currentStep > step.num
                                const isCurrent = currentStep === step.num
                                const vals = [null, selectedGroup?.name, selectedVenue?.name, selectedManufacturer?.name, selectedModel?.name]
                                return (
                                    <button key={step.num} onClick={() => canGoToStep(step.num) && setCurrentStep(step.num)} disabled={!canGoToStep(step.num)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                                            borderRadius: '8px', border: 'none', textAlign: 'left', width: '100%', cursor: canGoToStep(step.num) ? 'pointer' : 'default',
                                            background: isCurrent ? '#fff' : 'transparent',
                                            boxShadow: isCurrent ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { if (canGoToStep(step.num) && !isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.6)' }}
                                        onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent' }}
                                    >
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700,
                                            background: isDone ? '#e6f4ea' : isCurrent ? '#1a73e8' : '#e8eaed',
                                            color: isDone ? '#137333' : isCurrent ? '#fff' : '#9aa0a6',
                                        }}>
                                            {isDone ? '✓' : step.num}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: isCurrent ? '#202124' : isDone ? '#5f6368' : '#9aa0a6' }}>{step.label}</div>
                                            {vals[step.num] && <div style={{ fontSize: '11px', color: '#1a73e8', marginTop: '1px', fontWeight: 500 }}>{vals[step.num]}</div>}
                                        </div>
                                    </button>
                                )
                            })}
                            <button onClick={() => canGoToStep(5) && setCurrentStep(5)} disabled={!canGoToStep(5)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                                    borderRadius: '8px', border: 'none', textAlign: 'left', width: '100%', cursor: canGoToStep(5) ? 'pointer' : 'default',
                                    background: currentStep === 5 ? '#fff' : 'transparent', transition: 'all 0.15s',
                                }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, background: '#e8eaed', color: canGoToStep(5) ? '#5f6368' : '#bdc1c6' }}>5</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: canGoToStep(5) ? '#5f6368' : '#bdc1c6' }}>Details</div>
                            </button>
                        </div>

                        {/* Right panel — selection content */}
                        <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column' }}>

                            {currentStep === 1 && (
                                <SelectionPanel
                                    title="Select Auction Group"
                                    search={groupSearch} onSearch={setGroupSearch} searchPlaceholder="Search groups..."
                                    letter={groupLetter} onLetter={setGroupLetter} available={filteredGroups.available}
                                    items={filteredGroups.list} selected={selectedGroup}
                                    onSelect={(g) => { setSelectedGroup(g); setSelectedVenue(null); setCurrentStep(2) }}
                                    getLabel={g => g.name} getSub={g => `${g.options?.length || 0} venue${g.options?.length !== 1 ? 's' : ''}`}
                                    countLabel="groups"
                                    emptyMsg="No auction groups found"
                                    emptyAction={<a href="/admin/auctionDetails" style={{ fontSize: '12px', color: '#1a73e8' }}>Create one first →</a>}
                                    extraAction={
                                        <button onClick={() => setShowAddGroup(true)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1a73e8', border: '1px solid #d2e3fc', borderRadius: '20px', padding: '5px 12px', background: '#f0f4ff', cursor: 'pointer' }}>
                                            <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            New
                                        </button>
                                    }
                                />
                            )}

                            {currentStep === 2 && (
                                <SelectionPanel
                                    title="Select Venue"
                                    subtitle={`Group: ${selectedGroup?.name}`}
                                    search={venueSearch} onSearch={setVenueSearch} searchPlaceholder="Search venues..."
                                    letter={venueLetter} onLetter={setVenueLetter} available={filteredVenues.available}
                                    items={filteredVenues.list} selected={selectedVenue}
                                    onSelect={(v) => { setSelectedVenue(v); setCurrentStep(3) }}
                                    getLabel={v => v.name} getSub={null}
                                    countLabel="venues"
                                    emptyMsg="No venues in this group"
                                    emptyAction={<a href="/admin/auctionDetails" style={{ fontSize: '12px', color: '#1a73e8' }}>Add venues first →</a>}
                                    onBack={() => setCurrentStep(1)}
                                    extraAction={
                                        <button onClick={() => setShowAddVenue(true)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1a73e8', border: '1px solid #d2e3fc', borderRadius: '20px', padding: '5px 12px', background: '#f0f4ff', cursor: 'pointer' }}>
                                            <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            New
                                        </button>
                                    }
                                />
                            )}

                            {currentStep === 3 && (
                                <SelectionPanel
                                    title="Select Manufacturer"
                                    search={mfgSearch} onSearch={setMfgSearch} searchPlaceholder="Search manufacturers..."
                                    letter={mfgLetter} onLetter={setMfgLetter} available={filteredMfg.available}
                                    items={filteredMfg.list} selected={selectedManufacturer}
                                    onSelect={(m) => { setSelectedManufacturer(m); setSelectedModel(null); setCurrentStep(4) }}
                                    getLabel={m => m.name} getSub={m => `${m.models?.length || 0} models`}
                                    countLabel="manufacturers"
                                    emptyMsg="No manufacturers found"
                                    onEdit={(m) => setEditingMaker({ _id: m._id, name: m.name, country: m.country || '' })}
                                    onBack={() => setCurrentStep(2)}
                                    extraAction={
                                        <button onClick={() => setShowAddManufacturer(true)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1a73e8', border: '1px solid #d2e3fc', borderRadius: '20px', padding: '5px 12px', background: '#f0f4ff', cursor: 'pointer' }}>
                                            <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            New
                                        </button>
                                    }
                                />
                            )}

                            {currentStep === 4 && (
                                <SelectionPanel
                                    title="Select Model"
                                    subtitle={`Maker: ${selectedManufacturer?.name}`}
                                    search={modelSearch} onSearch={setModelSearch} searchPlaceholder="Search models..."
                                    letter={modelLetter} onLetter={setModelLetter} available={filteredModels.available}
                                    items={filteredModels.list} selected={selectedModel}
                                    onSelect={(m) => {
                                        setSelectedModel(m); setSelectedVariant('')
                                        if (m.defaults && Object.keys(m.defaults).length > 0) setFormData(prev => ({ ...m.defaults, ...prev }))
                                        setCurrentStep(5)
                                    }}
                                    getLabel={m => m.name} getSub={m => `${m.variants?.length || 0} variant${m.variants?.length !== 1 ? 's' : ''}`}
                                    countLabel="models"
                                    emptyMsg="No models yet"
                                    onEdit={(m) => { const idx = selectedManufacturer.models.findIndex(mo => mo.name === m.name); setEditingModel({ manufacturerId: selectedManufacturer._id, modelIndex: idx, name: m.name, description: m.description || '' }) }}
                                    onBack={() => setCurrentStep(3)}
                                    extraAction={
                                        <button onClick={() => setShowAddModel(true)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1a73e8', border: '1px solid #d2e3fc', borderRadius: '20px', padding: '5px 12px', background: '#f0f4ff', cursor: 'pointer' }}>
                                            <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            New
                                        </button>
                                    }
                                />
                            )}

                        </div>
                    </div>
                )}

                {/* Step 5: Details — full width, 3-col grid */}
                {currentStep === 5 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '520px' }}>

                        {/* Left sidebar */}
                        <div style={{ background: '#f8f9fa', borderRight: '1px solid #e8eaed', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9aa0a6', margin: '0 0 8px' }}>Summary</p>
                            {[
                                { label: 'Group', value: selectedGroup?.name, step: 1 },
                                { label: 'Venue', value: selectedVenue?.name, step: 2 },
                                { label: 'Maker', value: selectedManufacturer?.name, step: 3 },
                                { label: 'Model', value: selectedModel?.name, step: 4 },
                            ].map(({ label, value, step }) => (
                                <button key={label} onClick={() => setCurrentStep(step)}
                                    style={{ display: 'flex', flexDirection: 'column', padding: '10px 12px', borderRadius: '8px', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', background: 'transparent', transition: 'all 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9aa0a6' }}>{label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a73e8', marginTop: '2px' }}>{value || '—'}</span>
                                </button>
                            ))}
                            <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(26,115,232,0.06)', borderRadius: '8px', border: '1px solid #d2e3fc' }}>
                                <p style={{ fontSize: '11px', color: '#5f6368', margin: 0 }}>Click any item above to go back and change your selection.</p>
                            </div>
                        </div>

                        {/* Right — form */}
                        <div style={{ padding: '28px 32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#202124', margin: 0 }}>Vehicle Details</h2>
                                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '3px 0 0' }}>{selectedManufacturer?.name} · {selectedModel?.name}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="button" onClick={() => setShowAddField(true)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1a73e8', border: '1px solid #d2e3fc', borderRadius: '20px', padding: '5px 12px', background: '#f0f4ff', cursor: 'pointer' }}>
                                        <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Add Field
                                    </button>
                                    <BackBtn onBack={() => setCurrentStep(4)} />
                                </div>
                            </div>
                            <form onSubmit={handleSubmit}>
                                {/* Dynamic fields grid */}
                                {fields.filter(f => f.type !== 'file' && f.type !== 'image' && f.label?.toLowerCase().trim() !== 'description').length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                                        {fields.filter(f => f.type !== 'file' && f.type !== 'image' && f.label?.toLowerCase().trim() !== 'description').map(field => (
                                            <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                                                    {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                                </label>
                                                {renderInput(field)}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* File / image fields */}
                                {fields.some(f => f.type === 'file' || f.type === 'image') && (
                                    <div style={{ borderTop: '1px solid #f1f3f4', paddingTop: '16px', marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Files & Images</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                                            {fields.filter(f => f.type === 'file' || f.type === 'image').map(field => (
                                                <div key={field._id}>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                                                        {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                                    </label>
                                                    {renderInput(field)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {error && <div style={{ marginBottom: '14px', padding: '12px 14px', background: '#fce8e6', border: '1px solid #f5c6c2', borderRadius: '8px', fontSize: '13px', color: '#c5221f' }}>{error}</div>}
                                {success && (
                                    <div style={{ marginBottom: '14px', padding: '16px', background: '#e6f4ea', border: '1px solid #b7dfbe', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', color: '#137333', fontWeight: 600, marginBottom: '4px' }}>Vehicle added successfully!</div>
                                            <p style={{ fontSize: '12px', color: '#137333', margin: '0 0 8px', opacity: 0.8 }}>QR Code generated. Scan this to check the vehicle into a yard.</p>
                                            <button onClick={() => window.location.href = '/admin/vehicles'} style={{ padding: '6px 14px', background: '#137333', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Go to Vehicles</button>
                                        </div>
                                        {createdVehicleQr && (
                                            <div style={{ textAlign: 'center' }}>
                                                <img src={createdVehicleQr.qr} alt="QR Code" style={{ width: '120px', height: '120px', borderRadius: '8px', border: '2px solid #fff', background: '#fff', padding: '4px' }} />
                                                <div style={{ fontSize: '10px', color: '#137333', marginTop: '4px', fontWeight: 600 }}>Scan to check-in</div>
                                                <a href={createdVehicleQr.qr} download={`QR-${createdVehicleQr.manufacturer}-${createdVehicleQr.model}.png`} style={{ display: 'inline-block', marginTop: '4px', fontSize: '10px', color: '#1a73e8', textDecoration: 'underline', cursor: 'pointer' }}>Download QR</a>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Accounts section ── */}
                                <div style={{ borderTop: '2px solid #e8f0fe', paddingTop: '20px', marginTop: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: '#e8f0fe' }}>
                                                    <svg style={{ width: '13px', height: '13px', color: '#1a73e8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </span>
                                                Account Details
                                            </h3>
                                            <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '3px 0 0' }}>Financial and accounting fields for this vehicle</p>
                                        </div>
                                        <button type="button" onClick={() => setShowAddAccountField(true)}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1a73e8', border: '1px solid #d2e3fc', borderRadius: '20px', padding: '5px 12px', background: '#f0f4ff', cursor: 'pointer' }}>
                                            <svg style={{ width: '11px', height: '11px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Add Field
                                        </button>
                                    </div>
                                    {accountFields.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8f9fa', borderRadius: '10px', border: '2px dashed #e0e0e0' }}>
                                            <p style={{ fontSize: '13px', color: '#9aa0a6', margin: '0 0 8px' }}>No account fields yet</p>
                                            <button type="button" onClick={() => setShowAddAccountField(true)} style={{ fontSize: '12px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add your first account field</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                                            {accountFields.filter(f => f.type !== 'file' && f.type !== 'image').map(field => (
                                                <div key={field._id} style={field.type === 'boolean' ? { gridColumn: 'span 2' } : {}}>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                                                        {field.label}{field.isRequired && <span style={{ color: '#c5221f', marginLeft: '2px' }}>*</span>}
                                                    </label>
                                                    {renderAccountInput(field)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f1f3f4', marginTop: '20px' }}>
                                    <button type="submit" disabled={submitting}
                                        style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600, color: '#fff', background: submitting ? '#9aa0a6' : '#1a73e8', border: 'none', borderRadius: '24px', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: submitting ? 'none' : '0 2px 8px rgba(26,115,232,0.3)', transition: 'all 0.15s' }}>
                                        {submitting ? 'Adding...' : 'Add Vehicle →'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* ── Modals ── */}
        <style>{`.modal-card { background: #fff; border-radius: 14px; padding: 24px; max-width: 400px; width: 100%; box-shadow: 0 16px 48px rgba(0,0,0,0.22); }`}</style>

        {/* Add Manufacturer */}
        {showAddManufacturer && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowAddManufacturer(false)}>
                <div className="modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: '0 0 16px' }}>Add Manufacturer</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Name *</label>
                            <input type="text" value={newManufacturer.name} onChange={e => setNewManufacturer({ ...newManufacturer, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Toyota" /></div>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Country</label>
                            <select value={newManufacturer.country || ''} onChange={e => setNewManufacturer({ ...newManufacturer, country: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                                <option value="">Select country...</option>
                                {COUNTRIES.sort((a, b) => a.localeCompare(b)).map(c => <option key={c} value={c}>{c}</option>)}
                            </select></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Company Name</label>
                                <input type="text" value={newManufacturer.companyName || ''} onChange={e => setNewManufacturer({ ...newManufacturer, companyName: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Contact Person</label>
                                <input type="text" value={newManufacturer.contactPerson || ''} onChange={e => setNewManufacturer({ ...newManufacturer, contactPerson: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Tel</label>
                                <input type="text" value={newManufacturer.tel || ''} onChange={e => setNewManufacturer({ ...newManufacturer, tel: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Bank Name</label>
                                <input type="text" value={newManufacturer.bankName || ''} onChange={e => setNewManufacturer({ ...newManufacturer, bankName: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Account Title</label>
                                <input type="text" value={newManufacturer.accountTitle || ''} onChange={e => setNewManufacturer({ ...newManufacturer, accountTitle: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Account #</label>
                                <input type="text" value={newManufacturer.accountNumber || ''} onChange={e => setNewManufacturer({ ...newManufacturer, accountNumber: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Mob #</label>
                                <input type="text" value={newManufacturer.mob || ''} onChange={e => setNewManufacturer({ ...newManufacturer, mob: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Tel #</label>
                                <input type="text" value={newManufacturer.telSharp || ''} onChange={e => setNewManufacturer({ ...newManufacturer, telSharp: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Fax</label>
                                <input type="text" value={newManufacturer.fax || ''} onChange={e => setNewManufacturer({ ...newManufacturer, fax: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Email</label>
                                <input type="email" value={newManufacturer.email || ''} onChange={e => setNewManufacturer({ ...newManufacturer, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                        </div>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Address</label>
                            <input type="text" value={newManufacturer.address || ''} onChange={e => setNewManufacturer({ ...newManufacturer, address: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button onClick={() => setShowAddManufacturer(false)} style={{ flex: 1, padding: '9px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                        <button onClick={handleAddManufacturer} disabled={!newManufacturer.name.trim() || saving} style={{ flex: 1, padding: '9px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Adding...' : 'Add'}</button>
                    </div>
                </div>
            </div>
        )}

        {/* Add Model */}
        {showAddModel && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowAddModel(false)}>
                <div className="modal-card" style={{ maxWidth: '600px', width: '100%' }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>Add Model</h3>
                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '0 0 16px' }}>{selectedManufacturer?.name}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Model Name *</label>
                                <input type="text" value={newModel.name} onChange={e => setNewModel({ ...newModel, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Camry" /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Description</label>
                                <input type="text" value={newModel.description} onChange={e => setNewModel({ ...newModel, description: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Sedan" /></div>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                                Default Field Values
                                <span style={{ marginLeft: '6px', fontSize: '10px', color: '#9aa0a6', fontWeight: 400, textTransform: 'none' }}>— pre-filled when adding a vehicle with this model</span>
                            </div>
                            {fields.filter(f => !['file', 'image', 'boolean'].includes(f.type) && f.belongsto === 'add-vehicles').length === 0 ? (
                                <p style={{ fontSize: '12px', color: '#9aa0a6', fontStyle: 'italic' }}>No fields configured for "add-vehicles".</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                    {fields.filter(f => !['file', 'image', 'boolean'].includes(f.type) && f.belongsto === 'add-vehicles').map(field => (
                                        <div key={field._id}>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                                {field.label}
                                                {newModel.defaults?.[field._id] !== undefined && newModel.defaults[field._id] !== '' && (
                                                    <button onClick={() => setNewModel(p => { const d = { ...p.defaults }; delete d[field._id]; return { ...p, defaults: d } })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c5221f', fontSize: '9px', padding: '0 2px' }} title="Clear default">✕</button>
                                                )}
                                            </label>
                                            {(field.type === 'dropdown' || field.type === 'select-year' || field.type === 'select-country') ? (
                                                <select value={newModel.defaults?.[field._id] ?? ''} onChange={e => setNewModel(p => ({ ...p, defaults: { ...p.defaults, [field._id]: e.target.value } }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                                                    <option value="">— no default —</option>
                                                    {[...(field.options || [])].sort((a, b) => { const na = Number(a), nb = Number(b); if (!isNaN(na) && !isNaN(nb)) return na - nb; return a.localeCompare(b) }).map((o, i) => <option key={i} value={o}>{o}</option>)}
                                                </select>
                                            ) : field.type === 'number' ? (
                                                <input type="number" value={newModel.defaults?.[field._id] ?? ''} onChange={e => setNewModel(p => ({ ...p, defaults: { ...p.defaults, [field._id]: e.target.value } }))} placeholder="Leave blank = no default" style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                                            ) : (
                                                <input type="text" value={newModel.defaults?.[field._id] ?? ''} onChange={e => setNewModel(p => ({ ...p, defaults: { ...p.defaults, [field._id]: e.target.value } }))} placeholder="Leave blank = no default" style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Dimensions & Weight</p>
                            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                                    <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', marginBottom: '3px' }}>Length</label>
                                        <input type="number" value={newModel.dimensions?.length || ''} onChange={e => setNewModel({ ...newModel, dimensions: { ...newModel.dimensions, length: e.target.value } })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} placeholder="0" /></div>
                                    <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', marginBottom: '3px' }}>Width</label>
                                        <input type="number" value={newModel.dimensions?.width || ''} onChange={e => setNewModel({ ...newModel, dimensions: { ...newModel.dimensions, width: e.target.value } })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} placeholder="0" /></div>
                                    <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', marginBottom: '3px' }}>Height</label>
                                        <input type="number" value={newModel.dimensions?.height || ''} onChange={e => setNewModel({ ...newModel, dimensions: { ...newModel.dimensions, height: e.target.value } })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} placeholder="0" /></div>
                                    <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', marginBottom: '3px' }}>Unit Size</label>
                                        <select value={newModel.dimensions?.unit_size || 'cm'} onChange={e => setNewModel({ ...newModel, dimensions: { ...newModel.dimensions, unit_size: e.target.value } })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                                            {['cm','m','mm','in','ft'].map(u => <option key={u} value={u}>{u}</option>)}
                                        </select></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                                    <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', marginBottom: '3px' }}>Weight</label>
                                        <input type="number" value={newModel.dimensions?.weight || ''} onChange={e => setNewModel({ ...newModel, dimensions: { ...newModel.dimensions, weight: e.target.value } })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} placeholder="0" /></div>
                                    <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#9aa0a6', textTransform: 'uppercase', marginBottom: '3px' }}>Unit Weight</label>
                                        <select value={newModel.dimensions?.unit_weight || 'kg'} onChange={e => setNewModel({ ...newModel, dimensions: { ...newModel.dimensions, unit_weight: e.target.value } })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                                            {['kg','g','lb','oz','t'].map(u => <option key={u} value={u}>{u}</option>)}
                                        </select></div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px', borderTop: '1px solid #f1f3f4', marginTop: '4px' }}>
                            <button onClick={() => setShowAddModel(false)} style={{ padding: '9px 20px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                            <button onClick={handleAddModel} disabled={!newModel.name.trim() || saving} style={{ padding: '9px 20px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Adding...' : 'Add Model'}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Maker */}
        {editingMaker && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setEditingMaker(null)}>
                <div className="modal-card" onClick={e => e.stopPropagation()}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: '0 0 16px' }}>Edit Manufacturer</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Name *</label>
                            <input autoFocus type="text" value={editingMaker.name} onChange={e => setEditingMaker(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Country</label>
                            <input type="text" value={editingMaker.country} onChange={e => setEditingMaker(p => ({ ...p, country: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => setEditingMaker(null)} style={{ flex: 1, padding: '9px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                            <button onClick={handleSaveMakerEdit} disabled={!editingMaker.name.trim() || saving} style={{ flex: 1, padding: '9px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Model */}
        {editingModel && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setEditingModel(null)}>
                <div className="modal-card" onClick={e => e.stopPropagation()}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>Edit Model</h3>
                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '0 0 16px' }}>{selectedManufacturer?.name}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Model Name *</label>
                            <input autoFocus type="text" value={editingModel.name} onChange={e => setEditingModel(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Description</label>
                            <input type="text" value={editingModel.description} onChange={e => setEditingModel(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Sedan" /></div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => setEditingModel(null)} style={{ flex: 1, padding: '9px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                            <button onClick={handleSaveModelEdit} disabled={!editingModel.name.trim() || saving} style={{ flex: 1, padding: '9px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Add Field */}
        {showAddField && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowAddField(false)}>
                <div className="modal-card" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: 0 }}>Add New Field</h3>
                        <button onClick={() => setShowAddField(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', padding: '2px', display: 'flex' }}>
                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '0 0 16px' }}>Field will be added to the <strong style={{ color: '#5f6368' }}>add-vehicles</strong> form.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Label *</label>
                            <input type="text" value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., Engine No." /></div>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Type</label>
                            <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value, options: [], linkedFields: [] }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                                {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select></div>
                        {newField.type === 'dropdown' && (
                            <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Options</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                                    {newField.options.map((opt, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '6px' }}>
                                            <input type="text" value={opt} onChange={e => setNewField(f => ({ ...f, options: f.options.map((o, j) => j === i ? e.target.value : o) }))} style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none' }} placeholder={`Option ${i + 1}`} />
                                            <button type="button" onClick={() => setNewField(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: 'pointer', color: '#c5221f', fontSize: '14px' }}>✕</button>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <input type="text" value={newFieldOption} onChange={e => setNewFieldOption(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newFieldOption.trim()) { setNewField(f => ({ ...f, options: [...f.options, newFieldOption.trim()] })); setNewFieldOption('') } } }}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none' }} placeholder="Type option, press Enter" />
                                    <button type="button" onClick={() => { if (newFieldOption.trim()) { setNewField(f => ({ ...f, options: [...f.options, newFieldOption.trim()] })); setNewFieldOption('') } }} style={{ padding: '6px 12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
                                </div>
                            </div>
                        )}
                        {newField.type === 'select-year' && (
                            <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '10px', padding: '12px' }}>
                                <p style={{ fontSize: '12px', color: '#0e7490' }}>Options will be years from <strong>{new Date().getFullYear()}</strong> down to <strong>1950</strong>. Generated automatically.</p>
                            </div>
                        )}
                        {newField.type === 'select-country' && (
                            <div style={{ background: '#f7fee7', border: '1px solid #bef264', borderRadius: '10px', padding: '12px' }}>
                                <p style={{ fontSize: '12px', color: '#4d7c0f' }}>Options will be <strong>195 countries</strong> sorted A-Z. Generated automatically.</p>
                            </div>
                        )}
                        {newField.type === 'sum' && (
                            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Source Fields to Sum</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                                    {fields.filter(f => f.type === 'number').map(f => (
                                        <label key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', background: newField.linkedFields.includes(f.label) ? '#ede9fe' : 'transparent' }}>
                                            <input type="checkbox" checked={newField.linkedFields.includes(f.label)} onChange={() => setNewField(p => ({ ...p, linkedFields: p.linkedFields.includes(f.label) ? p.linkedFields.filter(l => l !== f.label) : [...p.linkedFields, f.label] }))} style={{ accentColor: '#6d28d9' }} />
                                            {f.label}
                                        </label>
                                    ))}
                                    {fields.filter(f => f.type === 'number').length === 0 && <p style={{ fontSize: '12px', color: '#9aa0a6', margin: 0 }}>No number fields available yet</p>}
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Required?</span>
                            {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                                <label key={String(val)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: newField.isRequired === val ? '1px solid #1a73e8' : '1px solid #e0e0e0', background: newField.isRequired === val ? '#e8f0fe' : '#fff', color: newField.isRequired === val ? '#1a73e8' : '#5f6368' }}>
                                    <input type="radio" style={{ display: 'none' }} checked={newField.isRequired === val} onChange={() => setNewField(f => ({ ...f, isRequired: val }))} />
                                    {label}
                                </label>
                            ))}
                        </div>
                        {addFieldMsg && (
                            <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '12px', background: addFieldMsg.type === 'success' ? '#e6f4ea' : '#fce8e6', color: addFieldMsg.type === 'success' ? '#137333' : '#c5221f', border: `1px solid ${addFieldMsg.type === 'success' ? '#b7dfbe' : '#f5c6c2'}` }}>{addFieldMsg.text}</div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => setShowAddField(false)} style={{ flex: 1, padding: '9px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                            <button onClick={handleAddField} disabled={!newField.label.trim() || addingField} style={{ flex: 1, padding: '9px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: addingField ? 'not-allowed' : 'pointer', opacity: addingField ? 0.7 : 1 }}>{addingField ? 'Adding...' : 'Add Field'}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── Add Account Field Modal ── */}
        {showAddAccountField && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShowAddAccountField(false)}>
                <div className="modal-card" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: 0 }}>Add Account Field</h3>
                        </div>
                        <button onClick={() => setShowAddAccountField(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', padding: '2px', display: 'flex' }}>
                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '0 0 16px' }}>Field will be added to the <strong style={{ color: '#5f6368' }}>accounts</strong> form.</p>
                    <AddFieldForm
                        belongsto="accounts"
                        onDone={() => { fetchAccountFields(); setShowAddAccountField(false) }}
                        onCancel={() => setShowAddAccountField(false)}
                        FIELD_TYPES={FIELD_TYPES}
                        existingFields={accountFields}
                    />
                </div>
            </div>
        )}

        {/* Add Auction Group */}
        {showAddGroup && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => { setShowAddGroup(false); setNewGroup({ name: '', venues: [] }); setShowVenueForm(false) }}>
                <div className="modal-card" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: '0 0 16px' }}>Add Auction Group</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Group Name *</label>
                            <input type="text" value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., JP" /></div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Venues / Sites</label>
                                <button onClick={() => setShowVenueForm(p => !p)} style={{ fontSize: '12px', color: '#1a73e8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Venue</button>
                            </div>
                            {newGroup.venues.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                                    {newGroup.venues.map((v, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e8f0fe', borderRadius: '8px', padding: '6px 12px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#202124' }}>{v.name}</span>
                                            <button onClick={() => setNewGroup(p => ({ ...p, venues: p.venues.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c5221f', fontSize: '12px' }}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showVenueForm && (
                                <div style={{ background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>Venue Name *</label>
                                        <input type="text" value={newVenue.name} onChange={e => setNewVenue({ ...newVenue, name: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., USS Tokyo" /></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>Membership #</label>
                                            <input type="text" value={newVenue.membership} onChange={e => setNewVenue({ ...newVenue, membership: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} /></div>
                                        <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>TEL</label>
                                            <input type="text" value={newVenue.tel} onChange={e => setNewVenue({ ...newVenue, tel: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} /></div>
                                        <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>FAX</label>
                                            <input type="text" value={newVenue.fax} onChange={e => setNewVenue({ ...newVenue, fax: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} /></div>
                                        <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>Email</label>
                                            <input type="text" value={newVenue.email} onChange={e => setNewVenue({ ...newVenue, email: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} /></div>
                                        <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>Postal Code</label>
                                            <input type="text" value={newVenue.postal} onChange={e => setNewVenue({ ...newVenue, postal: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} /></div>
                                        <div><label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', marginBottom: '3px' }}>Address</label>
                                            <input type="text" value={newVenue.address} onChange={e => setNewVenue({ ...newVenue, address: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} /></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => { setShowVenueForm(false); setNewVenue({ name: '', membership: '', tel: '', fax: '', email: '', postal: '', address: '' }) }} style={{ flex: 1, padding: '7px', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                                        <button onClick={() => { if (!newVenue.name.trim()) return; setNewGroup(p => ({ ...p, venues: [...p.venues, newVenue] })); setNewVenue({ name: '', membership: '', tel: '', fax: '', email: '', postal: '', address: '' }); setShowVenueForm(false) }} disabled={!newVenue.name.trim()} style={{ flex: 1, padding: '7px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: newVenue.name.trim() ? 1 : 0.5 }}>Add Venue</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => { setShowAddGroup(false); setNewGroup({ name: '', venues: [] }); setShowVenueForm(false) }} style={{ flex: 1, padding: '9px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                            <button onClick={handleAddGroup} disabled={!newGroup.name.trim() || saving} style={{ flex: 1, padding: '9px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Group'}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Add Venue to existing group */}
        {showAddVenue && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => { setShowAddVenue(false); setNewVenue({ name: '', membership: '', tel: '', fax: '', email: '', postal: '', address: '' }) }}>
                <div className="modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#202124', margin: '0 0 4px' }}>Add Venue</h3>
                    <p style={{ fontSize: '12px', color: '#9aa0a6', margin: '0 0 16px' }}>Group: {selectedGroup?.name}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Venue Name *</label>
                            <input type="text" value={newVenue.name} onChange={e => setNewVenue({ ...newVenue, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g., USS Tokyo" /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Membership #</label>
                                <input type="text" value={newVenue.membership} onChange={e => setNewVenue({ ...newVenue, membership: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>TEL</label>
                                <input type="text" value={newVenue.tel} onChange={e => setNewVenue({ ...newVenue, tel: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>FAX</label>
                                <input type="text" value={newVenue.fax} onChange={e => setNewVenue({ ...newVenue, fax: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Email</label>
                                <input type="text" value={newVenue.email} onChange={e => setNewVenue({ ...newVenue, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Postal Code</label>
                                <input type="text" value={newVenue.postal} onChange={e => setNewVenue({ ...newVenue, postal: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Address</label>
                                <input type="text" value={newVenue.address} onChange={e => setNewVenue({ ...newVenue, address: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => { setShowAddVenue(false); setNewVenue({ name: '', membership: '', tel: '', fax: '', email: '', postal: '', address: '' }) }} style={{ flex: 1, padding: '9px', border: '1px solid #e0e0e0', borderRadius: '24px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#5f6368' }}>Cancel</button>
                            <button onClick={handleAddVenue} disabled={!newVenue.name.trim() || saving} style={{ flex: 1, padding: '9px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Adding...' : 'Add Venue'}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        </>
    )
}

export default AddVehiclePage
