'use client'
import React, { useState, useMemo } from 'react'
import VoiceSearchButton from '@/components/VoiceSearchButton'

export const EMPTY_FILTERS = {
    make: '', model: '', yearFrom: '', yearTo: '',
    minPrice: '', maxPrice: '', fuelType: '', transmission: '',
    bodyType: '', driveType: '', allocation: '', country: '',
}

export const getVVal = (v, label, fields) => {
    if (!label) return ''
    const f = fields.find(fl => fl.label === label)
    return f ? (v[f._id] || v[f.label] || '') : (v[label] || '')
}

export const applyVehicleFilters = (vehicles, fields, search, filters) => {
    return vehicles.filter(v => {
        if (search) {
            const terms = search.toLowerCase().split(/\s+/).filter(Boolean)
            const haystack = Object.entries(v)
                .filter(([k]) => !['_id','__v','createdAt','updatedAt','mainImageUrl','files'].includes(k))
                .map(([, val]) => {
                    if (val == null) return ''
                    if (Array.isArray(val)) return val.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')
                    if (typeof val === 'object') return JSON.stringify(val)
                    return String(val)
                }).join(' ').toLowerCase()
            if (!terms.every(t => haystack.includes(t))) return false
        }
        if (filters.make) {
            const make = (v.manufacturer || v['Make'] || '').toLowerCase()
            if (!make.includes(filters.make.toLowerCase())) return false
        }
        if (filters.model) {
            const model = (v.model || v['Model'] || '').toLowerCase()
            if (!model.includes(filters.model.toLowerCase())) return false
        }
        if (filters.yearFrom || filters.yearTo) {
            const year = parseInt(getVVal(v, 'Year', fields)) || 0
            if (filters.yearFrom && year < parseInt(filters.yearFrom)) return false
            if (filters.yearTo && year > parseInt(filters.yearTo)) return false
        }
        if (filters.minPrice || filters.maxPrice) {
            const price = parseFloat(getVVal(v, 'Price', fields)) || 0
            if (filters.minPrice && price < parseFloat(filters.minPrice)) return false
            if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false
        }
        if (filters.fuelType) {
            const ft = (getVVal(v, 'Fuel Type', fields)).toLowerCase()
            if (!ft.includes(filters.fuelType.toLowerCase())) return false
        }
        if (filters.transmission) {
            const tr = (getVVal(v, 'Gear Box Type', fields)).toLowerCase()
            if (!tr.includes(filters.transmission.toLowerCase())) return false
        }
        if (filters.bodyType) {
            const bt = (getVVal(v, 'Body Type', fields)).toLowerCase()
            if (!bt.includes(filters.bodyType.toLowerCase())) return false
        }
        if (filters.driveType) {
            const dt = (getVVal(v, 'Drive Type', fields)).toLowerCase()
            if (!dt.includes(filters.driveType.toLowerCase())) return false
        }
        if (filters.allocation) {
            const alloc = (v.allocation || '').toLowerCase()
            if (alloc !== filters.allocation.toLowerCase()) return false
        }
        if (filters.country) {
            if ((v.exportCountry || '') !== filters.country) return false
        }
        return true
    })
}

export const VehicleFilterBar = ({
    vehicles, fields, search, onSearchChange, filters, onFiltersChange,
    searchPlaceholder = 'Search vehicles, chassis, LOT...',
    showCountry = false, showAllocation = true,
}) => {
    const [showFilters, setShowFilters] = useState(false)

    const filterOptions = useMemo(() => {
        const makes          = [...new Set(vehicles.map(v => v.manufacturer || v['Make']).filter(Boolean))].sort()
        const models         = [...new Set(vehicles.map(v => v.model || v['Model']).filter(Boolean))].sort()
        const fuelTypes      = [...new Set(vehicles.map(v => getVVal(v, 'Fuel Type', fields)).filter(Boolean))].sort()
        const transmissions  = [...new Set(vehicles.map(v => getVVal(v, 'Gear Box Type', fields)).filter(Boolean))].sort()
        const bodyTypes      = [...new Set(vehicles.map(v => getVVal(v, 'Body Type', fields)).filter(Boolean))].sort()
        const driveTypes     = [...new Set(vehicles.map(v => getVVal(v, 'Drive Type', fields)).filter(Boolean))].sort()
        const countries      = [...new Set(vehicles.map(v => v.exportCountry).filter(Boolean))].sort((a, b) => a.localeCompare(b))
        return { makes, models, fuelTypes, transmissions, bodyTypes, driveTypes, countries }
    }, [vehicles, fields])

    const activeFilterCount = Object.values(filters).filter(Boolean).length

    const clearFilters = () => {
        const empty = {}
        Object.keys(filters).forEach(k => empty[k] = '')
        onFiltersChange(empty)
    }

    const updateFilter = (key, value) => onFiltersChange({ ...filters, [key]: value })

    const inputStyle = { height: 34, fontSize: 12, borderRadius: 6, border: '1px solid #D1D5DB', padding: '0 10px', background: '#fff', width: '100%' }
    const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'auto' }
    const labelStyle = { fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4, display: 'block' }

    return (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' }}>
            {/* Filter header row */}
            <div className="flex items-center justify-between px-4 py-2.5 flex-wrap gap-2" style={{ borderBottom: showFilters ? '1px solid #F3F4F6' : 'none' }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 font-semibold transition-colors"
                        style={{ fontSize: 13, color: '#111827', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {activeFilterCount > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#DC2626', color: '#fff', padding: '1px 6px', borderRadius: 999 }}>
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    {activeFilterCount > 0 && (
                        <button onClick={clearFilters}
                            style={{ fontSize: 12, color: '#DC2626', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                            Clear all
                        </button>
                    )}
                </div>
                <div className="relative" style={{ display: 'flex', alignItems: 'center', gap: 6, width: 320, maxWidth: '100%' }}>
                    <div className="relative" style={{ flex: 1 }}>
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#9CA3AF' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder={searchPlaceholder} value={search} onChange={e => onSearchChange(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: 34 }} />
                    </div>
                    <VoiceSearchButton onResult={(text) => onSearchChange(prev => prev ? `${prev} ${text}` : text)} size={30} />
                </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div className="px-4 py-3" style={{ background: '#FAFBFC', borderTop: '1px solid #F3F4F6' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {/* Make */}
                        <div>
                            <label style={labelStyle}>Make</label>
                            <select value={filters.make} onChange={e => updateFilter('make', e.target.value)} style={selectStyle}>
                                <option value="">All Makes</option>
                                {filterOptions.makes.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        {/* Model */}
                        <div>
                            <label style={labelStyle}>Model</label>
                            <select value={filters.model} onChange={e => updateFilter('model', e.target.value)} style={selectStyle}>
                                <option value="">All Models</option>
                                {filterOptions.models.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        {/* Allocation */}
                        {showAllocation && (
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select value={filters.allocation} onChange={e => updateFilter('allocation', e.target.value)} style={selectStyle}>
                                    <option value="">All Status</option>
                                    <option value="export">Export</option>
                                    <option value="khitai">Khitai</option>
                                    <option value="resale-to-auction">Resale to Auction</option>
                                </select>
                            </div>
                        )}
                        {/* Year From */}
                        <div>
                            <label style={labelStyle}>Year From</label>
                            <input type="number" placeholder="e.g. 2015" value={filters.yearFrom} onChange={e => updateFilter('yearFrom', e.target.value)} style={inputStyle} />
                        </div>
                        {/* Year To */}
                        <div>
                            <label style={labelStyle}>Year To</label>
                            <input type="number" placeholder="e.g. 2024" value={filters.yearTo} onChange={e => updateFilter('yearTo', e.target.value)} style={inputStyle} />
                        </div>
                        {/* Fuel Type */}
                        <div>
                            <label style={labelStyle}>Fuel Type</label>
                            <select value={filters.fuelType} onChange={e => updateFilter('fuelType', e.target.value)} style={selectStyle}>
                                <option value="">All Fuels</option>
                                {filterOptions.fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        {/* Transmission */}
                        <div>
                            <label style={labelStyle}>Transmission</label>
                            <select value={filters.transmission} onChange={e => updateFilter('transmission', e.target.value)} style={selectStyle}>
                                <option value="">All Types</option>
                                {filterOptions.transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        {/* Body Type */}
                        <div>
                            <label style={labelStyle}>Body Type</label>
                            <select value={filters.bodyType} onChange={e => updateFilter('bodyType', e.target.value)} style={selectStyle}>
                                <option value="">All Bodies</option>
                                {filterOptions.bodyTypes.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        {/* Drive Type */}
                        <div>
                            <label style={labelStyle}>Drive Type</label>
                            <select value={filters.driveType} onChange={e => updateFilter('driveType', e.target.value)} style={selectStyle}>
                                <option value="">All Drives</option>
                                {filterOptions.driveTypes.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        {/* Min Price */}
                        <div>
                            <label style={labelStyle}>Min Price</label>
                            <input type="number" placeholder="$0" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} style={inputStyle} />
                        </div>
                        {/* Max Price */}
                        <div>
                            <label style={labelStyle}>Max Price</label>
                            <input type="number" placeholder="$99999" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} style={inputStyle} />
                        </div>
                        {/* Country */}
                        {showCountry && (
                            <div>
                                <label style={labelStyle}>Country</label>
                                <select value={filters.country} onChange={e => updateFilter('country', e.target.value)} style={selectStyle}>
                                    <option value="">All Countries</option>
                                    {filterOptions.countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
