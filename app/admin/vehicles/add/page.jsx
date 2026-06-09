'use client'
import { useState, useEffect } from 'react'

const AddVehiclePage = () => {
    const [currentStep, setCurrentStep] = useState(1)
    const [manufacturers, setManufacturers] = useState([])
    const [selectedManufacturer, setSelectedManufacturer] = useState(null)
    const [selectedModel, setSelectedModel] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState('')
    const [formData, setFormData] = useState({})
    const [fields, setFields] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    
    // Modal states
    const [showAddManufacturer, setShowAddManufacturer] = useState(false)
    const [showAddModel, setShowAddModel] = useState(false)
    const [showAddVariant, setShowAddVariant] = useState(false)
    const [newManufacturer, setNewManufacturer] = useState({ name: '', country: '' })
    const [newModel, setNewModel] = useState({ name: '', description: '' })
    const [newVariant, setNewVariant] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchManufacturers()
        fetchFields()
    }, [])

    const fetchManufacturers = async () => {
        try {
            const res = await fetch('/api/manufacturer')
            if (res.ok) {
                const data = await res.json()
                // Filter only regular manufacturers (not Rikuso companies)
                setManufacturers(data.filter(m => !m.isRikusoCompany))
            }
        } catch (err) {
            console.error('Error fetching manufacturers:', err)
        }
    }

    const fetchFields = async () => {
        try {
            const res = await fetch('/api/fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ belongsto: 'add-vehicles' })
            })
            const data = await res.json()
            if (res.ok && Array.isArray(data)) {
                setFields(data)
            }
        } catch (err) {
            console.error('Failed to fetch fields:', err)
        }
    }

    const handleAddManufacturer = async () => {
        if (!newManufacturer.name.trim()) return
        setSaving(true)
        try {
            const res = await fetch('/api/manufacturer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newManufacturer)
            })
            if (res.ok) {
                const manufacturer = await res.json()
                setManufacturers([...manufacturers, manufacturer])
                setSelectedManufacturer(manufacturer)
                setShowAddManufacturer(false)
                setNewManufacturer({ name: '', country: '' })
            }
        } catch (err) {
            alert('Failed to add manufacturer')
        } finally {
            setSaving(false)
        }
    }

    const handleAddModel = async () => {
        if (!newModel.name.trim() || !selectedManufacturer) return
        setSaving(true)
        try {
            const updatedManufacturer = {
                ...selectedManufacturer,
                models: [...(selectedManufacturer.models || []), { ...newModel, variants: [] }]
            }
            const res = await fetch(`/api/manufacturer/${selectedManufacturer._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedManufacturer)
            })
            if (res.ok) {
                const updated = await res.json()
                setManufacturers(manufacturers.map(m => m._id === updated._id ? updated : m))
                setSelectedManufacturer(updated)
                setSelectedModel(updated.models[updated.models.length - 1])
                setShowAddModel(false)
                setNewModel({ name: '', description: '' })
            }
        } catch (err) {
            alert('Failed to add model')
        } finally {
            setSaving(false)
        }
    }

    const handleAddVariant = async () => {
        if (!newVariant.trim() || !selectedModel || !selectedManufacturer) return
        setSaving(true)
        try {
            // Update the selected model with new variant
            const updatedModels = selectedManufacturer.models.map(m => {
                if (m.name === selectedModel.name) {
                    return {
                        ...m,
                        variants: [...(m.variants || []), newVariant.trim()]
                    }
                }
                return m
            })

            const updatedManufacturer = {
                ...selectedManufacturer,
                models: updatedModels
            }

            const res = await fetch(`/api/manufacturer/${selectedManufacturer._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedManufacturer)
            })
            
            if (res.ok) {
                const updated = await res.json()
                setManufacturers(manufacturers.map(m => m._id === updated._id ? updated : m))
                setSelectedManufacturer(updated)
                const updatedModel = updated.models.find(m => m.name === selectedModel.name)
                setSelectedModel(updatedModel)
                setSelectedVariant(newVariant.trim())
                setShowAddVariant(false)
                setNewVariant('')
            }
        } catch (err) {
            alert('Failed to add variant')
        } finally {
            setSaving(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        const formDataToSend = new FormData()
        const payload = {
            ...formData,
            manufacturer: selectedManufacturer?.name,
            manufacturerId: selectedManufacturer?._id,
            model: selectedModel?.name,
            variant: selectedVariant,
        }

        formDataToSend.append('vehicleData', JSON.stringify(payload))

        // Handle file uploads
        fields.forEach((f) => {
            const value = formData[f._id]
            if ((f.type === 'file' || f.type === 'image') && Array.isArray(value)) {
                value.forEach((fileObj, index) => {
                    formDataToSend.append(`dynamic_${f.label}_${index}`, fileObj.file)
                })
            }
        })

        try {
            const res = await fetch('/api/vehicles', {
                method: 'POST',
                body: formDataToSend,
            })
            if (!res.ok) throw new Error('Failed to add vehicle')
            setSuccess(true)
            // Reset form
            setTimeout(() => {
                window.location.href = '/admin/vehicles'
            }, 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleChange = (id, value) => {
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const renderInput = (field) => {
        const value = formData[field._id] ?? ''

        if (field.type === 'dropdown') {
            return (
                <select
                    required={field.isRequired}
                    value={value}
                    onChange={(e) => handleChange(field._id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select...</option>
                    {field.options?.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </select>
            )
        }

        if (field.type === 'boolean') {
            return (
                <div className="flex gap-3">
                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value: opt }) => (
                        <label key={String(opt)} className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border-2 ${formData[field._id] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                            <input type="radio" className="sr-only" checked={formData[field._id] === opt} onChange={() => handleChange(field._id, opt)} />
                            {label}
                        </label>
                    ))}
                </div>
            )
        }

        if (field.type === 'file' || field.type === 'image') {
            return (
                <input
                    type="file"
                    multiple
                    accept={field.type === 'image' ? 'image/*' : '*'}
                    onChange={(e) => {
                        const files = Array.from(e.target.files).map(file => ({
                            file,
                            id: Math.random().toString(36).substring(2),
                            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                            name: file.name
                        }))
                        handleChange(field._id, files)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
            )
        }

        return (
            <input
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                required={field.isRequired}
                value={value}
                onChange={(e) => handleChange(field._id, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${field.label.toLowerCase()}`}
            />
        )
    }

    const steps = [
        { num: 1, title: 'Manufacturer', icon: '🏭' },
        { num: 2, title: 'Car Model', icon: '🚗' },
        { num: 3, title: 'Variant/Trim', icon: '⚙️' },
        { num: 4, title: 'Vehicle Details', icon: '📋' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Add New Vehicle</h1>
                    <p className="text-gray-600 mt-2">Complete the steps below to add a new vehicle</p>
                </div>

                {/* Step Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-3xl mx-auto">
                        {steps.map((step, idx) => (
                            <div key={step.num} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition ${
                                        currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {step.icon}
                                    </div>
                                    <p className={`mt-2 text-sm font-semibold ${currentStep >= step.num ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {step.title}
                                    </p>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`h-1 flex-1 mx-4 rounded ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Step 1: Select Manufacturer */}
                    {currentStep === 1 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Select Manufacturer</h2>
                                <button
                                    onClick={() => setShowAddManufacturer(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Manufacturer
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {manufacturers.map((manufacturer) => (
                                    <button
                                        key={manufacturer._id}
                                        onClick={() => {
                                            setSelectedManufacturer(manufacturer)
                                            setSelectedModel(null)
                                        }}
                                        className={`p-6 border-2 rounded-xl text-left transition ${
                                            selectedManufacturer?._id === manufacturer._id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <h3 className="font-bold text-lg text-gray-900">{manufacturer.name}</h3>
                                        {manufacturer.country && <p className="text-sm text-gray-600 mt-1">{manufacturer.country}</p>}
                                        <p className="text-xs text-gray-500 mt-2">{manufacturer.models?.length || 0} models</p>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => selectedManufacturer && setCurrentStep(2)}
                                    disabled={!selectedManufacturer}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Next: Select Model
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Model */}
                    {currentStep === 2 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Select Car Model</h2>
                                    <p className="text-sm text-gray-600 mt-1">From {selectedManufacturer?.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModel(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Model
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedManufacturer?.models?.map((model, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedModel(model)
                                            setSelectedVariant('')
                                        }}
                                        className={`p-6 border-2 rounded-xl text-left transition ${
                                            selectedModel?.name === model.name
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <h3 className="font-bold text-lg text-gray-900">{model.name}</h3>
                                        {model.description && <p className="text-sm text-gray-600 mt-1">{model.description}</p>}
                                        <p className="text-xs text-gray-500 mt-2">{model.variants?.length || 0} variants</p>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => selectedModel && setCurrentStep(3)}
                                    disabled={!selectedModel}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Next: Select Variant
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Select Variant */}
                    {currentStep === 3 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Select Variant/Trim</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {selectedManufacturer?.name} {selectedModel?.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddVariant(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Variant
                                </button>
                            </div>

                            {selectedModel?.variants && selectedModel.variants.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {selectedModel.variants.map((variant, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`p-4 border-2 rounded-xl text-center font-semibold transition ${
                                                selectedVariant === variant
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                        >
                                            {variant}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <p className="text-gray-600 mb-4">No variants added yet</p>
                                    <button
                                        onClick={() => setShowAddVariant(true)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add First Variant
                                    </button>
                                </div>
                            )}

                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => selectedVariant && setCurrentStep(4)}
                                    disabled={!selectedVariant}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Next: Vehicle Details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Vehicle Details Form */}
                    {currentStep === 4 && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Vehicle Details</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedManufacturer?.name} - {selectedModel?.name} - {selectedVariant}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                    {fields.filter(f => f.type !== 'file' && f.type !== 'image').map((field) => (
                                        <div key={field._id} className={field.type === 'boolean' ? 'lg:col-span-2' : ''}>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                {field.label}
                                                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {renderInput(field)}
                                        </div>
                                    ))}
                                </div>

                                {/* Files Section */}
                                {fields.filter(f => f.type === 'file' || f.type === 'image').length > 0 && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Files & Images</h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            {fields.filter(f => f.type === 'file' || f.type === 'image').map((field) => (
                                                <div key={field._id}>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                                        {field.label}
                                                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                                    </label>
                                                    {renderInput(field)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                        Vehicle added successfully! Redirecting...
                                    </div>
                                )}

                                <div className="mt-8 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(3)}
                                        className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 transition"
                                    >
                                        {submitting ? 'Adding Vehicle...' : 'Add Vehicle'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Manufacturer Modal */}
            {showAddManufacturer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddManufacturer(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Add New Manufacturer</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Manufacturer Name *</label>
                                <input
                                    type="text"
                                    value={newManufacturer.name}
                                    onChange={(e) => setNewManufacturer({ ...newManufacturer, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., Toyota"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Country</label>
                                <input
                                    type="text"
                                    value={newManufacturer.country}
                                    onChange={(e) => setNewManufacturer({ ...newManufacturer, country: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., Japan"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddManufacturer(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddManufacturer}
                                    disabled={!newManufacturer.name.trim() || saving}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {saving ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Model Modal */}
            {showAddModel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModel(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Add New Model</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Model Name *</label>
                                <input
                                    type="text"
                                    value={newModel.name}
                                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., Camry"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Description</label>
                                <input
                                    type="text"
                                    value={newModel.description}
                                    onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., Sedan"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddModel(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddModel}
                                    disabled={!newModel.name.trim() || saving}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {saving ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Variant Modal */}
            {showAddVariant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddVariant(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Add New Variant</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Adding variant to: {selectedManufacturer?.name} {selectedModel?.name}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Variant Name *</label>
                                <input
                                    type="text"
                                    value={newVariant}
                                    onChange={(e) => setNewVariant(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., GLI, GLX, Altis"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddVariant(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddVariant}
                                    disabled={!newVariant.trim() || saving}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {saving ? 'Adding...' : 'Add'}
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
