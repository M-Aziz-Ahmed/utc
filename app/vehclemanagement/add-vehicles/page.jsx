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
                <div className="flex gap-4">
                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label, value: opt }) => (
                        <label
                            key={String(opt)}
                            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition ${formData[field._id] === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <input
                                type="radio"
                                className="sr-only"
                                checked={formData[field._id] === opt}
                                onChange={() => handleChange(field._id, opt)}
                            />
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
                <div className="space-y-3">
                    {field.type === 'image' && fieldFiles.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {fieldFiles.map((fileObj) => (
                                <div key={fileObj.id} className="relative group">
                                    <img
                                        src={fileObj.preview}
                                        alt={fileObj.name}
                                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (fileObj.preview) URL.revokeObjectURL(fileObj.preview)
                                            handleChange(field._id, fieldFiles.filter(file => file.id !== fileObj.id))
                                        }}
                                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
                            className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm text-gray-600">
                                {field.type === 'image' ? 'Add Images' : 'Add Files'}
                            </span>
                        </label>
                    </div>

                    {field.type === 'file' && fieldFiles.length > 0 && (
                        <div className="space-y-2">
                            {fieldFiles.map((fileObj) => (
                                <div key={fileObj.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition group">
                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{fileObj.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (fileObj.preview) URL.revokeObjectURL(fileObj.preview)
                                            handleChange(field._id, fieldFiles.filter(file => file.id !== fileObj.id))
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            <input
                type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                required={field.isRequired}
                value={value}
                onChange={(e) => handleChange(field._id, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={`Enter ${field.label.toLowerCase()}`}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Add New Vehicle
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">Fill in the vehicle details and upload relevant documents and images.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <p className="text-sm">Loading form fields...</p>
                        </div>
                    ) : fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm font-medium">No fields configured yet</p>
                            <p className="text-xs mt-1">Please add dynamic fields for "add-vehicles" form</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6">
                                {fields.map((field) => (
                                    <div key={field._id} className={field.type === 'file' || field.type === 'image' ? 'border-t pt-6 first:border-t-0 first:pt-0' : ''}>
                                        <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                            {field.label}
                                            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderInput(field)}
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="mt-6 flex items-start gap-3 rounded-xl px-5 py-4 text-sm bg-red-50 text-red-700 border border-red-200">
                                    <svg className="h-5 w-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold">Error</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="mt-6 flex items-start gap-3 rounded-xl px-5 py-4 text-sm bg-green-50 text-green-700 border border-green-200">
                                    <svg className="h-5 w-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold">Success!</p>
                                        <p>Vehicle has been added successfully.</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-8 w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99]"
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
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page
