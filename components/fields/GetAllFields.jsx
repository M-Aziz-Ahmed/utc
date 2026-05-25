'use client'
import { useEffect, useState } from "react";

const FIELD_TYPES = ["text", "number", "boolean", "password", "email", "date","image","file","dropdown"];

const TYPE_COLORS = {
    text: 'bg-blue-50 text-blue-700 border-blue-200',
    number: 'bg-purple-50 text-purple-700 border-purple-200',
    boolean: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    password: 'bg-red-50 text-red-700 border-red-200',
    email: 'bg-teal-50 text-teal-700 border-teal-200',
    date: 'bg-orange-50 text-orange-700 border-orange-200',
    image: 'bg-pink-50 text-pink-700 border-pink-200',
    file: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dropdown: 'bg-green-50 text-green-700 border-green-200',
};

const GetAllFields = ({ refreshKey, onDelete, forms }) => {
    const [fields, setFields] = useState(null);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [editing, setEditing] = useState(null);
    const [editDraft, setEditDraft] = useState({});
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterForm, setFilterForm] = useState("all");
    const [filterRequired, setFilterRequired] = useState("all");

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
        setEditDraft({ 
            label: f.label, 
            type: f.type, 
            isRequired: f.isRequired ?? false, 
            belongsto: f.belongsto ?? '',
            options: f.options || [],
            newOption: ''
        });
    };

    const cancelEdit = () => {
        setEditing(null);
        setEditDraft({});
    };

    const handleSave = async (id) => {
        setSaving(true);
        try {
            const dataToSave = {
                label: editDraft.label,
                type: editDraft.type,
                isRequired: editDraft.isRequired,
                belongsto: editDraft.belongsto.trim() || undefined,
            };
            
            // Add options if type is dropdown
            if (editDraft.type === 'dropdown') {
                const validOptions = (editDraft.options || []).filter(opt => opt.trim() !== '');
                if (validOptions.length === 0) {
                    alert('Please add at least one option for the dropdown');
                    setSaving(false);
                    return;
                }
                dataToSave.options = validOptions;
            }
            
            const res = await fetch(`/api/fields/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave),
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

    // Filter fields
    const filteredFields = fields ? fields.filter(f => {
        // Search filter
        if (searchTerm && !f.label.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        // Type filter
        if (filterType !== "all" && f.type !== filterType) {
            return false;
        }
        // Form filter
        if (filterForm !== "all") {
            if (filterForm === "global" && f.belongsto) return false;
            if (filterForm !== "global" && f.belongsto !== filterForm) return false;
        }
        // Required filter
        if (filterRequired !== "all") {
            if (filterRequired === "required" && !f.isRequired) return false;
            if (filterRequired === "optional" && f.isRequired) return false;
        }
        return true;
    }) : [];

    // Group fields by form
    const groupedFields = {};
    filteredFields.forEach(f => {
        const formName = f.belongsto || 'Global Fields';
        if (!groupedFields[formName]) {
            groupedFields[formName] = [];
        }
        groupedFields[formName].push(f);
    });

    const sortedFormNames = Object.keys(groupedFields).sort((a, b) => {
        if (a === 'Global Fields') return -1;
        if (b === 'Global Fields') return 1;
        return a.localeCompare(b);
    });

    if (fields && fields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">No fields yet</p>
                <p className="text-sm text-gray-500">Create your first field using the form on the left.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search fields by label..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Type Filter */}
                    <div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="all">All Types</option>
                            {FIELD_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Form Filter */}
                    <div>
                        <select
                            value={filterForm}
                            onChange={(e) => setFilterForm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="all">All Forms</option>
                            <option value="global">Global Fields</option>
                            {forms && forms.map(form => (
                                <option key={form} value={form}>{form}</option>
                            ))}
                        </select>
                    </div>

                    {/* Required Filter */}
                    <div>
                        <select
                            value={filterRequired}
                            onChange={(e) => setFilterRequired(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="all">All Fields</option>
                            <option value="required">Required Only</option>
                            <option value="optional">Optional Only</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters & Results Count */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{filteredFields.length}</span> of <span className="font-semibold text-gray-900">{fields?.length || 0}</span> fields
                    </span>
                    {(searchTerm || filterType !== "all" || filterForm !== "all" || filterRequired !== "all") && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterType("all");
                                setFilterForm("all");
                                setFilterRequired("all");
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Grouped Fields */}
            {filteredFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-base font-semibold text-gray-900 mb-1">No fields match your filters</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {sortedFormNames.map(formName => (
                        <div key={formName} className="space-y-3">
                            {/* Form Group Header */}
                            <div className="flex items-center gap-3 sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 py-2 px-4 rounded-lg border border-gray-200">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                <h3 className="text-sm font-bold text-gray-900">{formName}</h3>
                                <span className="ml-auto text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-full">
                                    {groupedFields[formName].length}
                                </span>
                            </div>

                            {/* Fields in this group */}
                            <div className="space-y-2 pl-2">
                                {groupedFields[formName].map((f) => {
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
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            setEditDraft({ 
                                                ...editDraft, 
                                                type: newType,
                                                options: newType === 'dropdown' ? (editDraft.options || []) : []
                                            });
                                        }}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        {FIELD_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dropdown Options - Only show if type is dropdown */}
                                {editDraft.type === 'dropdown' && (
                                    <div className="col-span-2 border-2 border-blue-200 rounded-lg p-3 bg-white">
                                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                                            Dropdown Options
                                        </label>
                                        
                                        {/* Existing Options */}
                                        <div className="space-y-2 mb-2">
                                            {(editDraft.options || []).map((option, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...(editDraft.options || [])];
                                                            newOptions[index] = e.target.value;
                                                            setEditDraft({ ...editDraft, options: newOptions });
                                                        }}
                                                        placeholder={`Option ${index + 1}`}
                                                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    {(editDraft.options || []).length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = (editDraft.options || []).filter((_, i) => i !== index);
                                                                setEditDraft({ ...editDraft, options: newOptions });
                                                            }}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add New Option */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                            <input
                                                type="text"
                                                value={editDraft.newOption || ''}
                                                onChange={(e) => setEditDraft({ ...editDraft, newOption: e.target.value })}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if ((editDraft.newOption || '').trim()) {
                                                            setEditDraft({ 
                                                                ...editDraft, 
                                                                options: [...(editDraft.options || []), editDraft.newOption.trim()],
                                                                newOption: ''
                                                            });
                                                        }
                                                    }
                                                }}
                                                placeholder="Add new option..."
                                                className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if ((editDraft.newOption || '').trim()) {
                                                        setEditDraft({ 
                                                            ...editDraft, 
                                                            options: [...(editDraft.options || []), editDraft.newOption.trim()],
                                                            newOption: ''
                                                        });
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Belongs to */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Belongs to</label>
                                    <select
                                        value={editDraft.belongsto}
                                        onChange={(e) => setEditDraft({ ...editDraft, belongsto: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        <option value="">Select a form...</option>
                                        {forms && forms.map((form) => (
                                            <option key={form} value={form}>{form}</option>
                                        ))}
                                    </select>
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
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5 hover:shadow-md hover:border-gray-300 transition-all group"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-900 truncate">{f.label}</span>
                                {f.isRequired && (
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-full">
                                        REQUIRED
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-md border ${TYPE_COLORS[f.type] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                    {f.type}
                                </span>
                                {f.type === 'dropdown' && f.options && f.options.length > 0 && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {f.options.length} {f.options.length === 1 ? 'option' : 'options'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-3 shrink-0">
                            {/* Edit */}
                            <button
                                onClick={() => startEdit(f)}
                                title="Edit field"
                                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>

                            {/* Delete */}
                            <button
                                onClick={() => handleDelete(f._id)}
                                disabled={deleting === f._id}
                                title="Delete field"
                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                {deleting === f._id ? (
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GetAllFields;
