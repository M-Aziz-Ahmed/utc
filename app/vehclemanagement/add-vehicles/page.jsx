'use client'
import { useEffect, useState } from 'react'

const BELONGS_TO = 'add-vehicles'

const Page = () => {
    const [fields, setFields] = useState([])
    const [formData, setFormData] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch('/api/fields', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ belongsto: BELONGS_TO }),
                })
                if (!res.ok) throw new Error('Failed to load form fields')
                const data = await res.json()
                setFields(data)
                // initialise form state with empty values
                const initial = {}
                data.forEach((f) => {
                    initial[f._id] = f.type === 'boolean' ? false : ''
                })
                setFormData(initial)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchFields()
    }, [])

    const handleChange = (id, value) => {
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        setSuccess(false)

        // build a readable payload: { label: value }
        const payload = {}
        fields.forEach((f) => {
            payload[f.label] = formData[f._id]
        })

        try {
            // replace this with your actual vehicle submission endpoint
            console.log('Submitting vehicle:', payload)
            // const res = await fetch('/api/vehicles', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(payload),
            // })
            // if (!res.ok) throw new Error('Failed to add vehicle')
            setSuccess(true)
            // reset form
            const reset = {}
            fields.forEach((f) => {
                reset[f._id] = f.type === 'boolean' ? false : ''
            })
            setFormData(reset)
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
                            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition ${formData[field._id] === opt
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
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

        return (
            <input
                type={field.type}
                required={field.isRequired}
                value={value}
                onChange={(e) => handleChange(field._id, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={`Enter ${field.label.toLowerCase()}`}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Add Vehicle</h1>
                    <p className="text-sm text-gray-500 mt-1">Fill in the details below to register a new vehicle.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                            Loading form…
                        </div>
                    ) : fields.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                            No fields configured for this form yet.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5 grid grid-cols-3 gap-4">
                            {fields.map((field) => (
                                <div key={field._id} className='grid grid-cols-1'>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                                        {field.label}
                                        {field.isRequired && <span className="text-red-400 ml-1">*</span>}
                                    </label>
                                    {renderInput(field)}
                                </div>
                            ))}

                            {error && (
                                <div className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
                                    <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm bg-green-50 text-green-700 border border-green-200">
                                    <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Vehicle added successfully.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
