'use client'
import { useState, useEffect, useMemo } from 'react'

// ── Reusable search input ──────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
    <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
        {value && (
            <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        )}
    </div>
)

// ── Compact pill/chip selector ─────────────────────────────────────────────────
const PillGrid = ({ items, selected, onSelect, getLabel, getSub, emptyMsg, emptyAction }) => {
    if (items.length === 0) return (
        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500 mb-1">{emptyMsg}</p>
            {emptyAction}
        </div>
    )
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item, idx) => {
                const isSelected = selected === item || selected?._id === item?._id || selected?.name === item?.name
                return (
                    <button
                        key={item._id || idx}
                        onClick={() => onSelect(item)}
                        className={`group flex flex-col items-start px-4 py-2.5 rounded-xl border-2 text-left transition-all ${
                            isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
                        }`}
                    >
                        <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                            {getLabel(item)}
                        </span>
                        {getSub && (
                            <span className={`text-xs mt-0.5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                                {getSub(item)}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

// ── Nav buttons ────────────────────────────────────────────────────────────────
const StepNav = ({ onBack, onNext, nextLabel, nextDisabled }) => (
    <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
        {onBack
            ? <button onClick={onBack} className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
            : <div />
        }
        <button
            onClick={onNext}
            disabled={nextDisabled}
            className="flex items-center gap-1.5 px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
            {nextLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
    </div>
)

// ── Main component ─────────────────────────────────────────────────────────────
const AddVehiclePage = () => {
    const [currentStep, setCurrentStep] = useState(1)

    const [auctionGroups, setAuctionGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [groupSearch, setGroupSearch] = useState('')

    const [selectedVenue, setSelectedVenue] = useState(null)
    const [venueSearch, setVenueSearch] = useState('')

    const [manufacturers, setManufacturers] = useState([])
    const [selectedManufacturer, setSelectedManufacturer] = useState(null)
    const [mfgSearch, setMfgSearch] = useState('')

    const [selectedModel, setSelectedModel] = useState(null)
    const [modelSearch, setModelSearch] = useState('')

    const [selectedVariant, setSelectedVariant] = useState('')
    const [variantSearch, setVariantSearch] = useState('')

    const [formData, setFormData] = useState({})
    const [fields, setFields] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const [showAddManufacturer, setShowAddManufacturer] = useState(false)
    const [showAddModel, setShowAddModel] = useState(false)
    const [showAddVariant, setShowAddVariant] = useState(false)
    const [showAddField, setShowAddField] = useState(false)
    const [newField, setNewField] = useState({ label: '', type: 'text', isRequired: false, options: [] })
    const [newFieldOption, setNewFieldOption] = useState('')
    const [addingField, setAddingField] = useState(false)
    const [addFieldMsg, setAddFieldMsg] = useState(null)

    const FIELD_TYPES = ['text', 'number', 'boolean', 'email', 'date', 'file', 'image', 'dropdown']
    const [newManufacturer, setNewManufacturer] = useState({ name: '', country: '' })
    const [newModel, setNewModel] = useState({ name: '', description: '' })
    const [newVariant, setNewVariant] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchAuctionGroups(); fetchManufacturers(); fetchFields() }, [])

    const fetchAuctionGroups = async () => {
        try {
            const res = await fetch('/api/auctionGroup')
            if (res.ok) setAuctionGroups((await res.json()) || [])
        } catch (e) { console.error(e) }
    }

    const fetchManufacturers = async () => {
        try {
            const res = await fetch('/api/manufacturer')
            if (res.ok) setManufacturers((await res.json()).filter(m => !m.isRikusoCompany))
        } catch (e) { console.error(e) }
    }

    const fetchFields = async () => {
        try {
            const res = await fetch('/api/fields', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ belongsto: 'add-vehicles' }) })
            const data = await res.json()
            if (res.ok && Array.isArray(data)) setFields(data)
        } catch (e) { console.error(e) }
    }

    const handleAddManufacturer = async () => {
        if (!newManufacturer.name.trim()) return
        setSaving(true)
        try {
            const res = await fetch('/api/manufacturer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newManufacturer) })
            if (res.ok) {
                const m = await res.json()
                setManufacturers(prev => [...prev, m])
                setSelectedManufacturer(m)
                setShowAddManufacturer(false)
                setNewManufacturer({ name: '', country: '' })
            }
        } finally { setSaving(false) }
    }

    const handleAddModel = async () => {
        if (!newModel.name.trim() || !selectedManufacturer) return
        setSaving(true)
        try {
            const updated = { ...selectedManufacturer, models: [...(selectedManufacturer.models || []), { ...newModel, variants: [] }] }
            const res = await fetch(`/api/manufacturer/${selectedManufacturer._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
            if (res.ok) {
                const u = await res.json()
                setManufacturers(prev => prev.map(m => m._id === u._id ? u : m))
                setSelectedManufacturer(u)
                setSelectedModel(u.models[u.models.length - 1])
                setShowAddModel(false)
                setNewModel({ name: '', description: '' })
            }
        } finally { setSaving(false) }
    }

    const handleAddVariant = async () => {
        if (!newVariant.trim() || !selectedModel || !selectedManufacturer) return
        setSaving(true)
        try {
            const updatedModels = selectedManufacturer.models.map(m =>
                m.name === selectedModel.name ? { ...m, variants: [...(m.variants || []), newVariant.trim()] } : m
            )
            const res = await fetch(`/api/manufacturer/${selectedManufacturer._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...selectedManufacturer, models: updatedModels }) })
            if (res.ok) {
                const u = await res.json()
                setManufacturers(prev => prev.map(m => m._id === u._id ? u : m))
                setSelectedManufacturer(u)
                setSelectedModel(u.models.find(m => m.name === selectedModel.name))
                setSelectedVariant(newVariant.trim())
                setShowAddVariant(false)
                setNewVariant('')
            }
        } finally { setSaving(false) }
    }

    const handleAddField = async () => {
        if (!newField.label.trim()) return
        setAddingField(true)
        setAddFieldMsg(null)
        try {
            const payload = { ...newField, belongsto: 'add-vehicles' }
            if (newField.type === 'dropdown') {
                payload.options = newField.options.filter(o => o.trim())
            }
            const res = await fetch('/api/newField', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to create field')
            // Immediately refresh fields and close modal
            await fetchFields()
            setShowAddField(false)
            setNewField({ label: '', type: 'text', isRequired: false, options: [] })
            setNewFieldOption('')
            setAddFieldMsg(null)
        } catch (err) {
            setAddFieldMsg({ type: 'error', text: err.message })
        } finally {
            setAddingField(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true); setError(null)
        const fd = new FormData()
        fd.append('vehicleData', JSON.stringify({
            ...formData,
            auctionGroup: selectedGroup?.name, auctionGroupId: selectedGroup?._id,
            auctionVenue: selectedVenue?.name,
            manufacturer: selectedManufacturer?.name, manufacturerId: selectedManufacturer?._id,
            model: selectedModel?.name, variant: selectedVariant,
        }))
        fields.forEach(f => {
            const v = formData[f._id]
            if ((f.type === 'file' || f.type === 'image') && Array.isArray(v))
                v.forEach((fo, i) => fd.append(`dynamic_${f.label}_${i}`, fo.file))
        })
        try {
            const res = await fetch('/api/vehicles', { method: 'POST', body: fd })
            if (!res.ok) throw new Error('Failed to add vehicle')
            setSuccess(true)
            setTimeout(() => { window.location.href = '/admin/vehicles' }, 2000)
        } catch (err) { setError(err.message) }
        finally { setSubmitting(false) }
    }

    const handleChange = (id, value) => setFormData(prev => ({ ...prev, [id]: value }))

    // ── Filtered lists ──
    const filteredGroups = useMemo(() =>
        auctionGroups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase())),
        [auctionGroups, groupSearch])

    const filteredVenues = useMemo(() =>
        (selectedGroup?.options || []).filter(v => v.name?.toLowerCase().includes(venueSearch.toLowerCase())),
        [selectedGroup, venueSearch])

    const filteredMfg = useMemo(() =>
        manufacturers.filter(m => m.name.toLowerCase().includes(mfgSearch.toLowerCase()) || m.country?.toLowerCase().includes(mfgSearch.toLowerCase())),
        [manufacturers, mfgSearch])

    const filteredModels = useMemo(() =>
        (selectedManufacturer?.models || []).filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase())),
        [selectedManufacturer, modelSearch])

    const filteredVariants = useMemo(() =>
        (selectedModel?.variants || []).filter(v => v.toLowerCase().includes(variantSearch.toLowerCase())),
        [selectedModel, variantSearch])

    // inline quick-add option for dropdown fields on the form
    const [inlineAddOption, setInlineAddOption] = useState(null) // fieldId
    const [inlineOptionValue, setInlineOptionValue] = useState('')
    const [inlineAdding, setInlineAdding] = useState(false)

    const handleInlineAddOption = async (field) => {
        const val = inlineOptionValue.trim()
        if (!val) return
        if (field.options?.includes(val)) { setInlineOptionValue(''); setInlineAddOption(null); return }
        setInlineAdding(true)
        try {
            const newOptions = [...(field.options || []), val]
            const res = await fetch(`/api/fields/${field._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ options: newOptions }),
            })
            if (!res.ok) throw new Error('Failed')
            // Update fields in place so the dropdown immediately shows the new option
            setFields(prev => prev.map(f => f._id === field._id ? { ...f, options: newOptions } : f))
            setInlineOptionValue('')
            setInlineAddOption(null)
        } catch (e) {
            alert(e.message)
        } finally {
            setInlineAdding(false)
        }
    }

    const renderInput = (field) => {
        const value = formData[field._id] ?? ''
        if (field.type === 'dropdown') return (
            <div>
                <div className="flex gap-1.5">
                    <select
                        required={field.isRequired}
                        value={value}
                        onChange={e => handleChange(field._id, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Select...</option>
                        {field.options?.map((o, i) => <option key={i} value={o}>{o}</option>)}
                    </select>
                    <button
                        type="button"
                        onClick={() => { setInlineAddOption(inlineAddOption === field._id ? null : field._id); setInlineOptionValue('') }}
                        title="Add new option"
                        className={`px-2.5 rounded-lg border text-sm font-semibold transition ${inlineAddOption === field._id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600'}`}
                    >
                        +
                    </button>
                </div>
                {inlineAddOption === field._id && (
                    <div className="flex gap-1.5 mt-1.5">
                        <input
                            autoFocus
                            type="text"
                            value={inlineOptionValue}
                            onChange={e => setInlineOptionValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') { e.preventDefault(); handleInlineAddOption(field) }
                                if (e.key === 'Escape') { setInlineAddOption(null); setInlineOptionValue('') }
                            }}
                            placeholder="New option..."
                            className="flex-1 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleInlineAddOption(field)}
                            disabled={!inlineOptionValue.trim() || inlineAdding}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
                        >
                            {inlineAdding ? '...' : 'Add'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setInlineAddOption(null); setInlineOptionValue('') }}
                            className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                        >
                            ✕
                        </button>
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
        if (field.type === 'file' || field.type === 'image') return (
            <input type="file" multiple accept={field.type === 'image' ? 'image/*' : '*'} onChange={e => {
                const files = Array.from(e.target.files).map(file => ({ file, id: Math.random().toString(36).substring(2), preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null, name: file.name }))
                handleChange(field._id, files)
            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        )
        return (
            <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} required={field.isRequired} value={value} onChange={e => handleChange(field._id, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder={`Enter ${field.label.toLowerCase()}`} />
        )
    }

    const steps = [
        { num: 1, label: 'Group' },
        { num: 2, label: 'Venue' },
        { num: 3, label: 'Maker' },
        { num: 4, label: 'Model' },
        { num: 5, label: 'Variant' },
        { num: 6, label: 'Details' },
    ]

    // breadcrumb summary
    const crumbs = [selectedGroup?.name, selectedVenue?.name, selectedManufacturer?.name, selectedModel?.name, selectedVariant].filter(Boolean)

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
                    {crumbs.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 flex-wrap">
                            {crumbs.map((c, i) => (
                                <span key={i} className="flex items-center gap-1">
                                    {i > 0 && <span className="text-gray-300">›</span>}
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{c}</span>
                                </span>
                            ))}
                        </p>
                    )}
                </div>

                {/* Step indicator — compact pill strip */}
                <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
                    {steps.map((step, idx) => (
                        <div key={step.num} className="flex items-center gap-1 shrink-0">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                currentStep === step.num
                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                    : currentStep > step.num
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                                {currentStep > step.num
                                    ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    : <span>{step.num}</span>
                                }
                                {step.label}
                            </div>
                            {idx < steps.length - 1 && <div className={`w-4 h-px ${currentStep > step.num ? 'bg-green-300' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Content card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                    {/* ── Step 1: Group ── */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-base font-bold text-gray-800 mb-3">Select Auction Group</h2>
                            <SearchBar value={groupSearch} onChange={setGroupSearch} placeholder="Search groups..." />
                            <PillGrid
                                items={filteredGroups}
                                selected={selectedGroup}
                                onSelect={(g) => { setSelectedGroup(g); setSelectedVenue(null) }}
                                getLabel={g => g.name}
                                getSub={g => `${g.options?.length || 0} venue${g.options?.length !== 1 ? 's' : ''}`}
                                emptyMsg="No auction groups found"
                                emptyAction={<a href="/admin/auctionDetails" className="text-xs text-blue-600 underline">Create one first</a>}
                            />
                            <StepNav onNext={() => setCurrentStep(2)} nextLabel="Select Venue" nextDisabled={!selectedGroup} />
                        </div>
                    )}

                    {/* ── Step 2: Venue ── */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-base font-bold text-gray-800 mb-1">Select Venue</h2>
                            <p className="text-xs text-gray-400 mb-3">Group: <span className="font-semibold text-gray-600">{selectedGroup?.name}</span></p>
                            <SearchBar value={venueSearch} onChange={setVenueSearch} placeholder="Search venues..." />
                            <PillGrid
                                items={filteredVenues}
                                selected={selectedVenue}
                                onSelect={setSelectedVenue}
                                getLabel={v => v.name}
                                getSub={v => v.membership ? `#${v.membership}` : null}
                                emptyMsg="No venues in this group"
                                emptyAction={<a href="/admin/auctionDetails" className="text-xs text-blue-600 underline">Add venues first</a>}
                            />
                            <StepNav onBack={() => setCurrentStep(1)} onNext={() => setCurrentStep(3)} nextLabel="Select Manufacturer" nextDisabled={!selectedVenue} />
                        </div>
                    )}

                    {/* ── Step 3: Manufacturer ── */}
                    {currentStep === 3 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-base font-bold text-gray-800">Select Manufacturer</h2>
                                <button onClick={() => setShowAddManufacturer(true)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    New
                                </button>
                            </div>
                            <SearchBar value={mfgSearch} onChange={setMfgSearch} placeholder="Search manufacturers..." />
                            <PillGrid
                                items={filteredMfg}
                                selected={selectedManufacturer}
                                onSelect={(m) => { setSelectedManufacturer(m); setSelectedModel(null) }}
                                getLabel={m => m.name}
                                getSub={m => [m.country, `${m.models?.length || 0} models`].filter(Boolean).join(' · ')}
                                emptyMsg="No manufacturers found"
                            />
                            <StepNav onBack={() => setCurrentStep(2)} onNext={() => setCurrentStep(4)} nextLabel="Select Model" nextDisabled={!selectedManufacturer} />
                        </div>
                    )}

                    {/* ── Step 4: Model ── */}
                    {currentStep === 4 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">Select Car Model</h2>
                                    <p className="text-xs text-gray-400">From <span className="font-semibold text-gray-600">{selectedManufacturer?.name}</span></p>
                                </div>
                                <button onClick={() => setShowAddModel(true)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    New
                                </button>
                            </div>
                            <SearchBar value={modelSearch} onChange={setModelSearch} placeholder="Search models..." />
                            <PillGrid
                                items={filteredModels}
                                selected={selectedModel}
                                onSelect={(m) => { setSelectedModel(m); setSelectedVariant('') }}
                                getLabel={m => m.name}
                                getSub={m => `${m.variants?.length || 0} variant${m.variants?.length !== 1 ? 's' : ''}`}
                                emptyMsg="No models yet"
                            />
                            <StepNav onBack={() => setCurrentStep(3)} onNext={() => setCurrentStep(5)} nextLabel="Select Variant" nextDisabled={!selectedModel} />
                        </div>
                    )}

                    {/* ── Step 5: Variant ── */}
                    {currentStep === 5 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">Select Variant / Trim</h2>
                                    <p className="text-xs text-gray-400"><span className="font-semibold text-gray-600">{selectedManufacturer?.name}</span> · <span className="font-semibold text-gray-600">{selectedModel?.name}</span></p>
                                </div>
                                <button onClick={() => setShowAddVariant(true)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    New
                                </button>
                            </div>
                            <SearchBar value={variantSearch} onChange={setVariantSearch} placeholder="Search variants..." />
                            <PillGrid
                                items={filteredVariants.map(v => ({ name: v }))}
                                selected={{ name: selectedVariant }}
                                onSelect={(v) => setSelectedVariant(v.name)}
                                getLabel={v => v.name}
                                getSub={null}
                                emptyMsg="No variants yet — add one"
                            />
                            <StepNav onBack={() => setCurrentStep(4)} onNext={() => setCurrentStep(6)} nextLabel="Vehicle Details" nextDisabled={!selectedVariant} />
                        </div>
                    )}

                    {/* ── Step 6: Vehicle Details ── */}
                    {currentStep === 6 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold text-gray-800">Vehicle Details</h2>
                                <button
                                    type="button"
                                    onClick={() => setShowAddField(true)}
                                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Add New Field
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    {fields.filter(f => f.type !== 'file' && f.type !== 'image').map(field => (
                                        <div key={field._id} className={field.type === 'boolean' ? 'lg:col-span-2' : ''}>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5">
                                                {field.label}{field.isRequired && <span className="text-red-500 ml-0.5">*</span>}
                                            </label>
                                            {renderInput(field)}
                                        </div>
                                    ))}
                                </div>
                                {fields.some(f => f.type === 'file' || f.type === 'image') && (
                                    <div className="border-t pt-4 mb-4">
                                        <h3 className="text-sm font-bold text-gray-700 mb-3">Files & Images</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {fields.filter(f => f.type === 'file' || f.type === 'image').map(field => (
                                                <div key={field._id}>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                                                        {field.label}{field.isRequired && <span className="text-red-500 ml-0.5">*</span>}
                                                    </label>
                                                    {renderInput(field)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                                {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Vehicle added successfully! Redirecting...</div>}
                                <div className="flex justify-between pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setCurrentStep(5)} className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        Back
                                    </button>
                                    <button type="submit" disabled={submitting} className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition">
                                        {submitting ? 'Adding...' : 'Add Vehicle'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Add Manufacturer Modal ── */}
            {showAddManufacturer && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAddManufacturer(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-base font-bold mb-4">Add Manufacturer</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Name *</label>
                                <input type="text" value={newManufacturer.name} onChange={e => setNewManufacturer({ ...newManufacturer, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Toyota" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Country</label>
                                <input type="text" value={newManufacturer.country} onChange={e => setNewManufacturer({ ...newManufacturer, country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Japan" />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setShowAddManufacturer(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                                <button onClick={handleAddManufacturer} disabled={!newManufacturer.name.trim() || saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Model Modal ── */}
            {showAddModel && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModel(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-base font-bold mb-4">Add Model</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Name *</label>
                                <input type="text" value={newModel.name} onChange={e => setNewModel({ ...newModel, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Camry" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                                <input type="text" value={newModel.description} onChange={e => setNewModel({ ...newModel, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Sedan" />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setShowAddModel(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                                <button onClick={handleAddModel} disabled={!newModel.name.trim() || saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Variant Modal ── */}
            {showAddVariant && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAddVariant(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-base font-bold mb-1">Add Variant</h3>
                        <p className="text-xs text-gray-500 mb-4">{selectedManufacturer?.name} · {selectedModel?.name}</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Variant Name *</label>
                                <input type="text" value={newVariant} onChange={e => setNewVariant(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., GLI, GLX" />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setShowAddVariant(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                                <button onClick={handleAddVariant} disabled={!newVariant.trim() || saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50">{saving ? 'Adding...' : 'Add'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Field Modal ── */}
            {showAddField && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAddField(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold">Add New Field</h3>
                            <button onClick={() => setShowAddField(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">Field will be added to the <span className="font-semibold text-gray-600">add-vehicles</span> form.</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Label *</label>
                                <input type="text" value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Engine No." />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Type</label>
                                <select value={newField.type} onChange={e => setNewField(f => ({ ...f, type: e.target.value, options: [] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            {newField.type === 'dropdown' && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 block">Options</label>
                                    {newField.options.map((opt, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input type="text" value={opt} onChange={e => setNewField(f => ({ ...f, options: f.options.map((o, j) => j === i ? e.target.value : o) }))} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder={`Option ${i + 1}`} />
                                            <button type="button" onClick={() => setNewField(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600 px-1">✕</button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <input type="text" value={newFieldOption} onChange={e => setNewFieldOption(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newFieldOption.trim()) { setNewField(f => ({ ...f, options: [...f.options, newFieldOption.trim()] })); setNewFieldOption('') } } }} className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Type option, press Enter" />
                                        <button type="button" onClick={() => { if (newFieldOption.trim()) { setNewField(f => ({ ...f, options: [...f.options, newFieldOption.trim()] })); setNewFieldOption('') } }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs">Add</button>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-gray-600">Required?</span>
                                {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                                    <label key={String(val)} className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition ${newField.isRequired === val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
                                        <input type="radio" className="sr-only" checked={newField.isRequired === val} onChange={() => setNewField(f => ({ ...f, isRequired: val }))} />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            {addFieldMsg && (
                                <div className={`p-2.5 rounded-lg text-xs ${addFieldMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {addFieldMsg.text}
                                </div>
                            )}
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setShowAddField(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                                <button onClick={handleAddField} disabled={!newField.label.trim() || addingField} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50">
                                    {addingField ? 'Adding...' : 'Add Field'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddVehiclePage
