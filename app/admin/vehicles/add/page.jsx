'use client'
import { useState, useEffect } from 'react'

const Page = () => {
    const [formData, setFormData] = useState({})
    const [fields, setFields] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch('/api/fields', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ belongsto: 'add-vehicles' })
                })
                const data = await res.json()
                
                if (res.ok && Array.isArray(data)) {
                    setFields(data)
                    const initialData = {}
                    data.forEach((f) => {
                        if (f.type === 'boolean') {
                            initialData[f._id] = false
                        } else if (f.type === 'file' || f.type === 'image') {
                            initialData[f._id] = []
                        } else {
                            initialData[f._id] = ''
                        }
                    })
                    setFormData(initialData)
                }
            } catch (err) {
                console.error('Failed to fetch fields:', err)
            } finally {
                setLoading(false)
            }
        }
        
        fetchFields()
    }, [])

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const handleChange = (id, value) => {
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        setSuccess(false)

        const formDataToSend = new FormData()
        const payload = {}
        const dynamicFileFields = {}
        
        fields.forEach((f) => {
            const value = formData[f._id]
            if (f.type === 'file' || f.type === 'image') {
                if (Array.isArray(value) && value.length > 0) {
                    dynamicFileFields[f.label] = value
                }
            } else {
                payload[f.label] = value
            }
        })

        formDataToSend.append('vehicleData', JSON.stringify(payload))

        Object.entries(dynamicFileFields).forEach(([fieldLabel, fileArray]) => {
            fileArray.forEach((fileObj, index) => {
                formDataToSend.append(`dynamic_${fieldLabel}_${index}`, fileObj.file)
            })
        })

        try {
            const res = await fetch('/api/vehicles', {
                method: 'POST',
                body: formDataToSend,
            })
            
            const data = await res.json()
            
            if (!res.ok) throw new Error(data.message || 'Failed to add vehicle')
            
            setSuccess(true)
            
            const reset = {}
            fields.forEach((f) => {
                if (f.type === 'boolean') {
                    reset[f._id] = false
                } else if (f.type === 'file' || f.type === 'image') {
                    reset[f._id] = []
                } else {
                    reset[f._id] = ''
                }
            })
            setFormData(reset)
            
            setTimeout(() => setSuccess(false), 5000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const renderInput = (field) => {
        const value = formData[field._id] ?? ''

        if (field.type === 'boolean') {
            return (
                <div className="flex gap-3">
                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value: opt }) => (
                        <label
                            key={String(opt)}
                            className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                formData[field._id] === opt 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                        >
                            <input
                                type="radio"
                                className="sr-only"
                                checked={formData[field._id] === opt}
                                onChange={() => handleChange(field._id, opt)}
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                formData[field._id] === opt 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300'
                            }`}>
                                {formData[field._id] === opt && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            {label}
                        </label>
                    ))}
                </div>
            )
        }

        if (field.type === 'file' || field.type === 'image') {
            const acceptTypes = field.type === 'image' ? 'image/*' : '*'
            const fieldFiles = formData[field._id] || []
            
            return (
                <div className="space-y-4">
                    {field.type === 'image' && fieldFiles.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {fieldFiles.map((fileObj) => (
                                <div key={fileObj.id} className="relative group aspect-square">
                                    <img
                                        src={fileObj.preview}
                                        alt={fileObj.name}
                                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-400 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (fileObj.preview) URL.revokeObjectURL(fileObj.preview)
                                            handleChange(field._id, fieldFiles.filter(file => file.id !== fileObj.id))
                                        }}
                                        className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="file"
                            id={`field_file_${field._id}`}
                            multiple
                            accept={acceptTypes}
                            required={field.isRequired && fieldFiles.length === 0}
                            className="hidden"
                            onChange={(e) => {
                                const selectedFiles = Array.from(e.target.files)
                                const filesWithPreview = selectedFiles.map(file => ({
                                    file,
                                    id: Math.random().toString(36).substring(2, 9),
                                    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                                    name: file.name,
                                    size: file.size,
                                    type: file.type
                                }))
                                handleChange(field._id, [...fieldFiles, ...filesWithPreview])
                            }}
                        />
                        <label
                            htmlFor={`field_file_${field._id}`}
                            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                    {field.type === 'image' ? 'Upload Images' : 'Upload Files'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Click to browse or drag and drop
                                </p>
                            </div>
                        </label>
                    </div>

                    {field.type === 'file' && fieldFiles.length > 0 && (
                        <div className="space-y-2">
                            {fieldFiles.map((fileObj) => (
                                <div key={fileObj.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition group">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{fileObj.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(fileObj.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (fileObj.preview) URL.revokeObjectURL(fileObj.preview)
                                            handleChange(field._id, fieldFiles.filter(file => file.id !== fileObj.id))
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div className="relative">
                <input
                    type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                    required={field.isRequired}
                    value={value}
                    onChange={(e) => handleChange(field._id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-6 px-4">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Compact Header */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Vehicle</h1>
                        <p className="text-sm text-gray-600">Fill in the vehicle details and upload relevant documents</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-4 font-medium">Loading form fields...</p>
                        </div>
                    ) : fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Fields Configured</h3>
                            <p className="text-gray-600 mb-6 max-w-md">Please configure dynamic fields for the "add-vehicles" form before adding vehicles</p>
                            <a href="/admin/fields" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Configure Fields
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6">
                            {/* 3-Column Grid for Regular Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {fields.filter(f => f.type !== 'file' && f.type !== 'image').map((field) => (
                                    <div key={field._id} className={field.type === 'boolean' ? 'lg:col-span-2' : ''}>
                                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                            {field.label}
                                            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderInput(field)}
                                    </div>
                                ))}
                            </div>

                            {/* File/Image Upload Section - Full Width */}
                            {fields.filter(f => f.type === 'file' || f.type === 'image').length > 0 && (
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Files & Images
                                    </h3>
                                    <div className="space-y-6">
                                        {fields.filter(f => f.type === 'file' || f.type === 'image').map((field) => (
                                            <div key={field._id}>
                                                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                                    {field.label}
                                                    {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                                </label>
                                                {renderInput(field)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            {error && (
                                <div className="mt-6 flex items-start gap-3 rounded-xl px-4 py-3 bg-red-50 text-red-700 border border-red-200">
                                    <svg className="h-5 w-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-bold text-sm">Error</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="mt-6 flex items-start gap-3 rounded-xl px-4 py-3 bg-green-50 text-green-700 border border-green-200">
                                    <svg className="h-5 w-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-bold text-sm">Success!</p>
                                        <p className="text-sm">Vehicle has been added successfully</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Adding Vehicle...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Vehicle
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    )
}

export default Page
