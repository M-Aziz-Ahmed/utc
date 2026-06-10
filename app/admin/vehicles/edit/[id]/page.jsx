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
    const [newImages, setNewImages] = useState({}) // For new image uploads
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchVehicleAndFields()
    }, [vehicleId])

    const fetchVehicleAndFields = async () => {
        try {
            setLoading(true)
            
            // Fetch vehicle data
            const vehicleRes = await fetch(`/api/vehicles`)
            if (!vehicleRes.ok) throw new Error('Failed to fetch vehicle')
            const vehicles = await vehicleRes.json()
            const vehicleData = vehicles.find(v => v._id === vehicleId)
            
            if (!vehicleData) throw new Error('Vehicle not found')
            
            setVehicle(vehicleData)
            setFormData(vehicleData)
            
            // Fetch dynamic fields - use POST method like in add page
            const fieldsRes = await fetch('/api/fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ belongsto: 'add-vehicles' })
            })
            if (fieldsRes.ok) {
                const fieldsData = await fieldsRes.json()
                console.log('Fetched fields:', fieldsData)
                if (Array.isArray(fieldsData)) {
                    setFields(fieldsData)
                    console.log('Fields set:', fieldsData.length)
                }
            } else {
                console.error('Failed to fetch fields:', fieldsRes.status)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (fieldLabel, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldLabel]: value
        }))
    }

    const handleFileChange = (fieldLabel, files) => {
        setNewImages(prev => ({
            ...prev,
            [fieldLabel]: Array.from(files)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const formDataToSend = new FormData()
            
            // Add text fields
            const textData = {}
            fields.forEach(field => {
                if (field.type !== 'file' && field.type !== 'image' && formData[field.label] !== undefined) {
                    textData[field.label] = formData[field.label]
                }
            })
            
            formDataToSend.append('vehicleData', JSON.stringify(textData))

            // Add new images if any
            Object.entries(newImages).forEach(([fieldLabel, files]) => {
                files.forEach((file, index) => {
                    formDataToSend.append(`dynamic_${fieldLabel}_${index}`, file)
                })
            })

            // Update vehicle
            const response = await fetch(`/api/vehicles`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vehicleId,
                    ...textData
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update vehicle')
            }

            alert('Vehicle updated successfully!')
            router.push('/admin/vehicles')
        } catch (error) {
            console.error('Error updating vehicle:', error)
            alert('Failed to update vehicle: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading vehicle...</p>
                </div>
            </div>
        )
    }

    if (error || !vehicle) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error || 'Vehicle not found'}</p>
                    <Link href="/admin/vehicles" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Vehicles
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin/vehicles" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Vehicles
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Vehicle
                    </h1>
                    <p className="text-gray-600 mt-2">Update vehicle information</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
                    {fields.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fields Configured</h3>
                            <p className="text-gray-600 mb-4">Please configure fields for "add-vehicles" in the Dynamic Fields page</p>
                            <a href="/admin/fields" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                                Go to Fields
                            </a>
                        </div>
                    ) : (
                        <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fields.map((field) => {
                            const currentValue = formData[field.label]
                            
                            return (
                                <div key={field._id} className={field.type === 'boolean' ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {field.label}
                                        {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                                    </label>

                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            value={currentValue || ''}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                            required={field.isRequired}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <input
                                            type="number"
                                            value={currentValue || ''}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                            required={field.isRequired}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    )}

                                    {field.type === 'date' && (
                                        <input
                                            type="date"
                                            value={currentValue || ''}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                            required={field.isRequired}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    )}

                                    {field.type === 'dropdown' && (
                                        <select
                                            value={currentValue || ''}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                            required={field.isRequired}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        >
                                            <option value="">Select {field.label.toLowerCase()}</option>
                                            {field.options && field.options.map((option, idx) => (
                                                <option key={idx} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    )}

                                    {field.type === 'boolean' && (
                                        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={field.label}
                                                    checked={currentValue === 'Yes' || currentValue === true}
                                                    onChange={() => handleInputChange(field.label, 'Yes')}
                                                    className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700 font-medium">Yes</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={field.label}
                                                    checked={currentValue === 'No' || currentValue === false}
                                                    onChange={() => handleInputChange(field.label, 'No')}
                                                    className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700 font-medium">No</span>
                                            </label>
                                        </div>
                                    )}

                                    {(field.type === 'file' || field.type === 'image') && (
                                        <div className="space-y-3">
                                            {/* Show existing images */}
                                            {currentValue && Array.isArray(currentValue) && currentValue.length > 0 && (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {currentValue.map((file, idx) => (
                                                        <div key={idx} className="relative group">
                                                            <img
                                                                src={file.path}
                                                                alt={file.name}
                                                                className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition flex items-center justify-center">
                                                                <span className="text-white text-xs opacity-0 group-hover:opacity-100">Current</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Upload new images */}
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(field.label, e.target.files)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            <p className="text-xs text-gray-500">Upload new images (optional). Existing images will be kept.</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Submit Buttons */}
                    <div className="mt-8 flex items-center justify-end gap-4">
                        <Link
                            href="/admin/vehicles"
                            className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
