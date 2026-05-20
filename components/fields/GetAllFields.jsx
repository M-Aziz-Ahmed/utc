'use client'
import { useEffect, useState } from "react";

const FIELD_TYPES = ["text", "number", "boolean", "password", "email", "date"];

const TYPE_COLORS = {
    text: 'bg-blue-50 text-blue-700',
    number: 'bg-purple-50 text-purple-700',
    boolean: 'bg-yellow-50 text-yellow-700',
    password: 'bg-red-50 text-red-700',
    email: 'bg-teal-50 text-teal-700',
    date: 'bg-orange-50 text-orange-700',
};

const GetAllFields = ({ refreshKey, onDelete }) => {
    const [fields, setFields] = useState(null);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [editing, setEditing] = useState(null);   // id of card in edit mode
    const [editDraft, setEditDraft] = useState({}); // draft values while editing
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;
        setError(null);
        const fetchFields = async () => {
            try {
                const res = await fetch('/api/fields');
                if (!res.ok) throw new Error('Failed to load fields');
                const data = await res.json();
                if (mounted) setFields(data);
            } catch (e) {
                if (mounted) setError(e.message);
            }
        };
        fetchFields();
        return () => { mounted = false };
    }, [refreshKey]);

    const startEdit = (f) => {
        setEditing(f._id);
        setEditDraft({ label: f.label, type: f.type, isRequired: f.isRequired ?? false, belongsto: f.belongsto ?? '' });
    };

    const cancelEdit = () => {
        setEditing(null);
        setEditDraft({});
    };

    const handleSave = async (id) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/fields/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editDraft,
                    belongsto: editDraft.belongsto.trim() || undefined,
                }),
            });
            if (!res.ok) throw new Error('Failed to save');
            const updated = await res.json();
            setFields((prev) => prev.map((f) => (f._id === id ? updated : f)));
            setEditing(null);
            setEditDraft({});
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            const res = await fetch(`/api/fields/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setFields((prev) => prev.filter((f) => f._id !== id));
            onDelete?.();
        } catch (e) {
            alert(e.message);
        } finally {
            setDeleting(null);
        }
    };

    if (error) {
        return (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
            </div>
        );
    }

    if (fields === null) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (fields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M4.5 19.5l15-15" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No fields yet</p>
                <p className="text-xs text-gray-400 mt-1">Create your first field using the form.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {fields.map((f) => {
                const isEditingThis = editing === f._id;

                if (isEditingThis) {
                    return (
                        <div key={f._id} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {/* Label */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={editDraft.label}
                                        onChange={(e) => setEditDraft({ ...editDraft, label: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Type</label>
                                    <select
                                        value={editDraft.type}
                                        onChange={(e) => setEditDraft({ ...editDraft, type: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        {FIELD_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Belongs to */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Belongs to</label>
                                    <input
                                        type="text"
                                        value={editDraft.belongsto}
                                        onChange={(e) => setEditDraft({ ...editDraft, belongsto: e.target.value })}
                                        placeholder="e.g. setupUser"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    />
                                </div>

                                {/* Required toggle */}
                                <div className="col-span-2">
                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Required?</span>
                                    <div className="flex gap-3">
                                        {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label: optLabel, value }) => (
                                            <label
                                                key={String(value)}
                                                className={`flex items-center gap-2 cursor-pointer px-4 py-1.5 rounded-lg border text-sm font-medium transition ${editDraft.isRequired === value
                                                        ? 'border-blue-500 bg-white text-blue-700'
                                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`edit_req_${f._id}`}
                                                    className="sr-only"
                                                    checked={editDraft.isRequired === value}
                                                    onChange={() => setEditDraft({ ...editDraft, isRequired: value })}
                                                />
                                                {optLabel}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={cancelEdit}
                                    disabled={saving}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSave(f._id)}
                                    disabled={saving || !editDraft.label}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {saving ? (
                                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    Save
                                </button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div
                        key={f._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition group"
                    >
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 truncate">{f.label}</span>
                                {f.isRequired && (
                                    <span className="text-xs text-red-500 font-semibold">required</span>
                                )}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5 truncate">
                                {f.belongsto ? `Form: ${f.belongsto}` : 'Global'}
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 ml-3 shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${TYPE_COLORS[f.type] ?? 'bg-gray-100 text-gray-700'}`}>
                                {f.type}
                            </span>

                            {/* Edit */}
                            <button
                                onClick={() => startEdit(f)}
                                title="Edit field"
                                className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                                </svg>
                            </button>

                            {/* Delete */}
                            <button
                                onClick={() => handleDelete(f._id)}
                                disabled={deleting === f._id}
                                title="Delete field"
                                className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {deleting === f._id ? (
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1H5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GetAllFields;
