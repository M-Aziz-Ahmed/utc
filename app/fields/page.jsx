'use client';
import { useState } from "react";
import GetAllFields from "@/components/fields/GetAllFields";

const FIELD_TYPES = ["text", "number", "boolean", "password", "email", "date"];

const Page = () => {
    const [label, setLabel] = useState("");
    const [type, setType] = useState("text");
    const [isRequired, setIsRequired] = useState(false);
    const [belongsto, setBelongsto] = useState("");
    const [message, setMessage] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dynamic Fields</h1>
                    <p className="text-sm text-gray-500 mt-1">Create and manage custom fields for your forms.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Create Field Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <h2 className="text-base font-semibold text-gray-900">New Field</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Fill in the details to add a new dynamic field.</p>
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

                            {/* Belongs To */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Belongs to form
                                    <span className="ml-1 text-gray-400 normal-case font-normal">(optional)</span>
                                </label>
                                <input
                                    value={belongsto}
                                    onChange={(e) => setBelongsto(e.target.value)}
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="e.g. registration, checkout"
                                />
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

                    {/* Fields List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <h2 className="text-base font-semibold text-gray-900">Existing Fields</h2>
                            <p className="text-xs text-gray-400 mt-0.5">All dynamic fields currently in the system.</p>
                        </div>
                        <GetAllFields refreshKey={refreshKey} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
