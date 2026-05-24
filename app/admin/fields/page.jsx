'use client';
import { useState, useEffect } from "react";
import GetAllFields from "@/components/fields/GetAllFields";

const FIELD_TYPES = ["text", "number", "boolean", "password", "email", "date", "file", "image"];

const Page = () => {
    const [label, setLabel] = useState("");
    const [type, setType] = useState("text");
    const [isRequired, setIsRequired] = useState(false);
    const [belongsto, setBelongsto] = useState("");
    const [message, setMessage] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [forms, setForms] = useState([]);
    const [showNewFormModal, setShowNewFormModal] = useState(false);
    const [newFormName, setNewFormName] = useState("");
    const [creatingForm, setCreatingForm] = useState(false);

    // Fetch unique forms from fields
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const res = await fetch('/api/fields');
                if (!res.ok) throw new Error('Failed to load fields');
                const data = await res.json();
                
                // Extract unique form names
                const uniqueForms = [...new Set(data.map(f => f.belongsto).filter(Boolean))];
                setForms(uniqueForms.sort());
            } catch (e) {
                console.error('Error fetching forms:', e);
            }
        };
        fetchForms();
    }, [refreshKey]);

    const handleCreateForm = async (e) => {
        e.preventDefault();
        if (!newFormName.trim()) return;
        
        setCreatingForm(true);
        try {
            // Add the new form to the list
            const formName = newFormName.trim();
            if (!forms.includes(formName)) {
                setForms(prev => [...prev, formName].sort());
            }
            setBelongsto(formName);
            setShowNewFormModal(false);
            setNewFormName("");
        } catch (e) {
            alert('Error creating form');
        } finally {
            setCreatingForm(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            const res = await fetch('/api/newField', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label, type, isRequired, belongsto: belongsto.trim() || undefined })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Error creating field');
            setMessage({ type: 'success', text: data.message || 'Field created successfully' });
            setLabel('');
            setType('text');
            setIsRequired(false);
            setBelongsto('');
            setRefreshKey((k) => k + 1);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Dynamic Fields
                    </h1>
                    <p className="text-gray-600 mt-2">Create and manage custom fields for your forms.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Create Field Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900">New Field</h2>
                                <p className="text-sm text-gray-500 mt-1">Fill in the details to add a new dynamic field.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Label */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Label <span className="text-red-400">*</span>
                                </label>
                                <input
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    type="text"
                                    required
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="e.g. First Name"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Type
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                >
                                    {FIELD_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Is Required */}
                            <div>
                                <span className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                                    Required?
                                </span>
                                <div className="flex gap-4">
                                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label: optLabel, value }) => (
                                        <label
                                            key={String(value)}
                                            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition ${isRequired === value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="isRequired"
                                                className="sr-only"
                                                checked={isRequired === value}
                                                onChange={() => setIsRequired(value)}
                                            />
                                            {optLabel}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Belongs To Form - Dropdown */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                                        Belongs to form
                                        <span className="ml-1 text-gray-400 normal-case font-normal">(optional)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewFormModal(true)}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New
                                    </button>
                                </div>
                                <select
                                    value={belongsto}
                                    onChange={(e) => setBelongsto(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                >
                                    <option value="">Select a form...</option>
                                    {forms.map((form) => (
                                        <option key={form} value={form}>{form}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Creating…
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Field
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Feedback message */}
                        {message && (
                            <div className={`mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${message.type === 'error'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>
                                {message.type === 'error' ? (
                                    <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {message.text}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Fields List with Search and Filters */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Existing Fields</h2>
                                <p className="text-sm text-gray-500 mt-1">All dynamic fields currently in the system.</p>
                            </div>
                            <GetAllFields refreshKey={refreshKey} forms={forms} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Form Modal */}
            {showNewFormModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewFormModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Add New Form</h3>
                            <button
                                onClick={() => setShowNewFormModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateForm}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Form Name</label>
                                <input
                                    type="text"
                                    value={newFormName}
                                    onChange={(e) => setNewFormName(e.target.value)}
                                    placeholder="e.g. registration, checkout, add-vehicles"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowNewFormModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingForm}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                                >
                                    {creatingForm ? 'Creating...' : 'Create Form'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
