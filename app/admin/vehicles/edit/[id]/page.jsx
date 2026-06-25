'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const EditVehiclePage = () => {
    const router = useRouter()
    const params = useParams()
    const vehicleId = params.id

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [vehicle, setVehicle] = useState(null)
    const [fields, setFields] = useState([])
    const [formData, setFormData] = useState({})
    const [newImages, setNewImages] = useState({})
    // Track deleted images per field: { [fieldId]: Set<imageIndex> }
    const [deletedImages, setDeletedImages] = useState({})
    const [mainImageUrl, setMainImageUrl] = useState('')
    const [meta, setMeta] = useState({ manufacturer: '', model: '', modelDescription: '', auctionGroup: '', auctionVenue: '' })
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchVehicleAndFields()
    }, [vehicleId])

    const fetchVehicleAndFields = async () => {
        try {
            setLoading(true)

            const [vehicleRes, fieldsRes] = await Promise.all([
                fetch(`/api/vehicles`),
                fetch('/api/fields', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ belongsto: 'add-vehicles' })
                })
            ])

            if (!vehicleRes.ok) throw new Error('Failed to fetch vehicles')
            const vehicles = await vehicleRes.json()
            const vehicleData = vehicles.find(v => v._id === vehicleId)
            if (!vehicleData) throw new Error('Vehicle not found')

            setVehicle(vehicleData)

            let fetchedFields = []
            if (fieldsRes.ok) {
                const fieldsData = await fieldsRes.json()
                if (Array.isArray(fieldsData)) fetchedFields = fieldsData
            }
            setFields(fetchedFields)

            // Build formData: try field._id first, then field.label as fallback
            // This handles both old (label-keyed) and new (id-keyed) vehicle records
            const initialForm = {}
            fetchedFields.forEach(field => {
                const byId    = vehicleData[field._id]
                const byLabel = vehicleData[field.label]
                const val = byId !== undefined && byId !== null && byId !== '' ? byId
                          : byLabel !== undefined && byLabel !== null ? byLabel
                          : ''
                // Always store under field._id so submit is consistent
                initialForm[field._id] = val
            })
            setFormData(initialForm)
            // Init main image from saved value
            setMainImageUrl(vehicleData.mainImageUrl || '')
            // Init vehicle identity fields
            setMeta({
                manufacturer:     vehicleData.manufacturer     || '',
                model:            vehicleData.model            || '',
                modelDescription: vehicleData.modelDescription || '',
                auctionGroup:     vehicleData.auctionGroup     || '',
                auctionVenue:     vehicleData.auctionVenue     || '',
            })

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }))
    }

    const handleFileChange = (fieldId, files) => {
        setNewImages(prev => ({ ...prev, [fieldId]: Array.from(files) }))
    }

    const toggleDeleteImage = (fieldId, idx) => {
        setDeletedImages(prev => {
            const set = new Set(prev[fieldId] || [])
            if (set.has(idx)) set.delete(idx)
            else set.add(idx)
            return { ...prev, [fieldId]: set }
        })
    }

    const isImageDeleted = (fieldId, idx) => !!(deletedImages[fieldId]?.has(idx))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const fd = new FormData()

            // Collect text / select / boolean values
            const textData = {}
            fields.forEach(field => {
                if (field.type !== 'file' && field.type !== 'image') {
                    const val = formData[field._id]
                    if (val !== undefined && val !== null && val !== '') {
                        textData[field._id]   = val
                        textData[field.label] = val
                    }
                }
            })

            // Include main image selection
            textData.mainImageUrl = mainImageUrl || ''
            // Include vehicle identity fields
            Object.assign(textData, meta)

            // For image fields: build surviving images array (existing minus deleted)
            fields.forEach(field => {
                if (field.type === 'file' || field.type === 'image') {
                    const existing = getExistingImages(field)
                    if (existing.length > 0) {
                        const deleted = deletedImages[field._id] || new Set()
                        const surviving = existing.filter((_, i) => !deleted.has(i))
                        // Store under label (dot-stripped) so PATCH saves it correctly
                        const safeLabel = field.label.replace(/\./g, '')
                        textData[safeLabel] = surviving
                    }
                }
            })

            const hasNewImages = Object.keys(newImages).length > 0

            if (hasNewImages) {
                fd.append('vehicleData', JSON.stringify({ vehicleId, ...textData }))
                Object.entries(newImages).forEach(([fieldId, files]) => {
                    const field = fields.find(f => f._id === fieldId)
                    const label = field?.label || fieldId
                    files.forEach((file, idx) => {
                        fd.append(`dynamic_${label}_${idx}`, file)
                    })
                })
                const res = await fetch('/api/vehicles', { method: 'PUT', body: fd })
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err.message || err.error || `Server error ${res.status}`)
                }
            } else {
                const res = await fetch('/api/vehicles', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vehicleId, ...textData }),
                })
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err.message || err.error || `Server error ${res.status}`)
                }
            }

            router.push('/admin/vehicles')
        } catch (err) {
            console.error('Error updating vehicle:', err)
            alert('Failed to update vehicle: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    // ── rendering helpers ──────────────────────────────────────────────────────

    const getExistingImages = (field) => {
        // Try all possible key variants the vehicle data might use
        const keys = [
            field._id,
            field.label,
            field.label?.replace(/\./g, ''),   // dot-stripped label (how POST/PATCH saves it)
            field.label?.replace(/\s+/g, '_'),  // underscore variant
        ].filter(Boolean)

        for (const key of keys) {
            const val = vehicle?.[key]
            if (Array.isArray(val) && val.length > 0 && val[0]?.path) {
                return val.filter(f => f?.path)
            }
        }

        // Also scan all vehicle keys for arrays of image objects matching this field's label
        for (const [k, v] of Object.entries(vehicle || {})) {
            if (Array.isArray(v) && v.length > 0 && v[0]?.path && v[0]?.type?.startsWith('image/')) {
                const normKey   = k.toLowerCase().replace(/[\s._-]/g, '')
                const normLabel = field.label?.toLowerCase().replace(/[\s._-]/g, '')
                if (normLabel && normKey === normLabel) return v.filter(f => f?.path)
            }
        }
        return []
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Loading vehicle…</p>
                </div>
            </div>
        )
    }

    if (error || !vehicle) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
                    <p className="text-red-500 mb-4">{error || 'Vehicle not found'}</p>
                    <Link href="/admin/vehicles" className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold">
                        Back to Vehicles
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <Link href="/admin/vehicles" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3 transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Vehicles
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 rounded-full" style={{background:'var(--accent)'}}></div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-3">Update vehicle information</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                    {fields.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-3">No fields configured for "add-vehicles"</p>
                            <a href="/admin/fields" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Go to Fields</a>
                        </div>
                    ) : (
                        <>
                            {/* ── Vehicle Identity ── */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Vehicle Identity</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Auction Group</label>
                                        <input type="text" value={meta.auctionGroup}
                                            onChange={e => setMeta(p => ({...p, auctionGroup: e.target.value}))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none transition"
                                            placeholder="e.g. USS" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Auction Venue</label>
                                        <input type="text" value={meta.auctionVenue}
                                            onChange={e => setMeta(p => ({...p, auctionVenue: e.target.value}))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none transition"
                                            placeholder="e.g. Tokyo" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Manufacturer</label>
                                        <input type="text" value={meta.manufacturer}
                                            onChange={e => setMeta(p => ({...p, manufacturer: e.target.value}))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none transition"
                                            placeholder="e.g. Toyota" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Model</label>
                                        <input type="text" value={meta.model}
                                            onChange={e => setMeta(p => ({...p, model: e.target.value}))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none transition"
                                            placeholder="e.g. Aqua" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description / Variant</label>
                                        <input type="text" value={meta.modelDescription}
                                            onChange={e => setMeta(p => ({...p, modelDescription: e.target.value}))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none transition"
                                            placeholder="e.g. Hybrid, 4WD 2.0" />
                                    </div>
                                </div>
                            </div>

                            {/* ── Dynamic fields ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {fields.map((field) => {
                                    const currentValue = formData[field._id]
                                    const existingImages = getExistingImages(field)

                                    return (
                                        <div key={field._id} className={field.type === 'boolean' ? 'md:col-span-2' : ''}>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                                                {field.label}
                                                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                            </label>

                                            {field.type === 'text' && (
                                                <input
                                                    type="text"
                                                    value={currentValue || ''}
                                                    onChange={e => handleInputChange(field._id, e.target.value)}
                                                    required={field.isRequired}
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition"
                                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                                />
                                            )}

                                            {field.type === 'number' && (
                                                <input
                                                    type="number"
                                                    value={currentValue || ''}
                                                    onChange={e => handleInputChange(field._id, e.target.value)}
                                                    required={field.isRequired}
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition"
                                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                                />
                                            )}

                                            {field.type === 'date' && (
                                                <input
                                                    type="date"
                                                    value={currentValue ? currentValue.split('T')[0] : ''}
                                                    onChange={e => handleInputChange(field._id, e.target.value)}
                                                    required={field.isRequired}
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition"
                                                />
                                            )}

                                            {field.type === 'dropdown' && (
                                                <select
                                                    value={currentValue || ''}
                                                    onChange={e => handleInputChange(field._id, e.target.value)}
                                                    required={field.isRequired}
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition"
                                                >
                                                    <option value="">Select {field.label.toLowerCase()}</option>
                                                    {field.options?.map((opt, idx) => (
                                                        <option key={idx} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {field.type === 'boolean' && (
                                                <div className="flex gap-3">
                                                    {[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }].map(opt => (
                                                        <label key={opt.value} className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition ${
                                                            currentValue === opt.value || currentValue === (opt.value === 'Yes')
                                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                        }`}>
                                                            <input
                                                                type="radio"
                                                                className="sr-only"
                                                                checked={currentValue === opt.value || currentValue === (opt.value === 'Yes')}
                                                                onChange={() => handleInputChange(field._id, opt.value)}
                                                            />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {(field.type === 'file' || field.type === 'image') && (
                                                <div className="space-y-2">
                                                    {/* Existing images */}
                                                    {existingImages.length > 0 && (
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 font-semibold mb-1">
                                                                {existingImages.length - (deletedImages[field._id]?.size || 0)} of {existingImages.length} image{existingImages.length !== 1 ? 's' : ''} kept
                                                                {(deletedImages[field._id]?.size || 0) > 0 && (
                                                                    <span className="ml-1 text-red-500">· {deletedImages[field._id].size} marked for deletion</span>
                                                                )}
                                                            </p>
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {existingImages.map((f, idx) => {
                                                                    const deleted = isImageDeleted(field._id, idx)
                                                                    const isMain  = mainImageUrl === f.path
                                                                    return (
                                                                        <div key={idx} className="relative shrink-0 rounded-lg overflow-hidden border-2 transition"
                                                                            style={{
                                                                                width:'72px', height:'56px',
                                                                                borderColor: isMain ? '#f59e0b' : deleted ? '#ef4444' : '#e5e7eb',
                                                                                opacity: deleted ? 0.4 : 1,
                                                                            }}>
                                                                            <img src={f.path} alt={f.name || `img-${idx}`} className="w-full h-full object-cover" />

                                                                            {/* Main image star */}
                                                                            {!deleted && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setMainImageUrl(isMain ? '' : f.path)}
                                                                                    title={isMain ? 'Remove as main image' : 'Set as main image'}
                                                                                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full flex items-center justify-center transition text-xs leading-none"
                                                                                    style={{
                                                                                        background: isMain ? '#f59e0b' : 'rgba(0,0,0,0.45)',
                                                                                        color: '#fff',
                                                                                        fontSize: '11px',
                                                                                    }}
                                                                                >★</button>
                                                                            )}

                                                                            {/* Delete toggle */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => toggleDeleteImage(field._id, idx)}
                                                                                title={deleted ? 'Undo delete' : 'Delete image'}
                                                                                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center transition text-xs leading-none"
                                                                                style={{
                                                                                    background: deleted ? '#16a34a' : '#ef4444',
                                                                                    color: '#fff',
                                                                                }}
                                                                            >{deleted ? '↺' : '×'}</button>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={e => handleFileChange(field._id, e.target.files)}
                                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition"
                                                    />
                                                    <p className="text-[10px] text-gray-400">Upload new images (optional). ★ = set as main image · × = remove image.</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
                                <Link href="/admin/vehicles" className="px-6 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-600 font-semibold rounded-xl text-sm transition">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 text-white font-semibold rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                                    style={{background:'var(--accent)'}}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Updating…
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Update Vehicle
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}

export default EditVehiclePage
