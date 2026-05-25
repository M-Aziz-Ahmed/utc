'use client'
import { useState, useEffect } from "react";

const Page = () => {
    const [values, setValues] = useState({
        email: '',
        password: '',
        name: '',
        surname: '',
        lang: '',
        cellphone: '',
        company: '',
        companyvat: '',
        web: '',
        streetno: '',
        city: '',
        postcode: '',
        country: '',
        newsletter: false,
        newpurchase: false,
        role: '',
        verified: true,
    });
    const [dynamicFields, setDynamicFields] = useState([]);
    const [dynamicValues, setDynamicValues] = useState({});
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loadingFields, setLoadingFields] = useState(true);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    // Fetch dynamic fields that belong to this form
    useEffect(() => {
        const fetchDynamic = async () => {
            try {
                const res = await fetch('/api/fields');
                if (!res.ok) throw new Error();
                const all = await res.json();
                // Show fields scoped to 'setupUser' or global (no belongsto)
                const relevant = all.filter(
                    (f) => !f.belongsto || f.belongsto.toLowerCase() === 'setupuser'
                );
                setDynamicFields(relevant);
                // Seed default values
                const defaults = {};
                relevant.forEach((f) => {
                    defaults[f.label] = f.type === 'boolean' ? false : '';
                });
                setDynamicValues(defaults);
            } catch {
                // Non-critical — form still works without dynamic fields
            } finally {
                setLoadingFields(false);
            }
        };
        fetchDynamic();
    }, []);

    const setDyn = (label, value) =>
        setDynamicValues((prev) => ({ ...prev, [label]: value }));

    // File handling functions
    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles) => {
        const filesWithPreview = newFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            name: file.name,
            size: file.size,
            type: file.type
        }));
        setFiles(prev => [...prev, ...filesWithPreview]);
    };

    const removeFile = (id) => {
        setFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id);
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== id);
        });
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    // Paste handler for screenshots
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const imageItems = Array.from(items).filter(item => 
                item.type.startsWith('image/')
            );

            if (imageItems.length > 0) {
                e.preventDefault();
                const pastedFiles = imageItems
                    .map(item => item.getAsFile())
                    .filter(Boolean);
                addFiles(pastedFiles);
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            files.forEach(f => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
        };
    }, []);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        
        // Create FormData for file upload
        const formData = new FormData();
        
        // Map 'password' to 'pass' to match the User model schema
        const { password, ...rest } = values;
        
        // Separate file fields from regular dynamic values
        const regularDynamicValues = {};
        const dynamicFileFields = {};
        
        Object.entries(dynamicValues).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0 && value[0].file) {
                // This is a file field
                dynamicFileFields[key] = value;
            } else {
                regularDynamicValues[key] = value;
            }
        });
        
        const userData = { ...rest, pass: password, ...regularDynamicValues };
        
        // Append user data as JSON string
        formData.append('userData', JSON.stringify(userData));
        
        // Append main files
        files.forEach((fileObj, index) => {
            formData.append(`file_${index}`, fileObj.file);
        });
        
        // Append dynamic field files
        Object.entries(dynamicFileFields).forEach(([fieldLabel, fileArray]) => {
            fileArray.forEach((fileObj, index) => {
                formData.append(`dynamic_${fieldLabel}_${index}`, fileObj.file);
            });
        });
        
        const res = await fetch('/api/createUser', {
            method: 'POST',
            body: formData,
        });
        const data = await res.json().catch(() => ({ message: 'Server error' }));
        setIsError(!res.ok);
        setMessage(data.message || 'Server error');
    };

    // Helper for static fields
    const field = (label, key, type = 'text') => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            <input
                type={type}
                value={values[key]}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
        </div>
    );

    // Render a single dynamic field
    const renderDynamicField = (f) => {
        const baseClass =
            'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition';

        if (f.type === 'dropdown') {
            return (
                <div key={f._id} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {f.label}
                        {f.isRequired && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <div className="relative">
                        <select
                            required={f.isRequired}
                            value={dynamicValues[f.label] || ''}
                            onChange={(e) => setDyn(f.label, e.target.value)}
                            className={`${baseClass} w-full appearance-none bg-white pr-10`}
                        >
                            <option value="">Select {f.label.toLowerCase()}...</option>
                            {f.options && f.options.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            );
        }

        if (f.type === 'boolean') {
            return (
                <div key={f._id} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {f.label}
                        {f.isRequired && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <div className="flex gap-4 pt-1">
                        {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(({ label: optLabel, value }) => (
                            <label
                                key={String(value)}
                                className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition ${dynamicValues[f.label] === value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`dyn_${f._id}`}
                                    className="sr-only"
                                    required={f.isRequired}
                                    checked={dynamicValues[f.label] === value}
                                    onChange={() => setDyn(f.label, value)}
                                />
                                {optLabel}
                            </label>
                        ))}
                    </div>
                </div>
            );
        }

        if (f.type === 'file' || f.type === 'image') {
            const acceptTypes = f.type === 'image' ? 'image/*' : '*';
            const fieldFiles = dynamicValues[f.label] || [];
            
            return (
                <div key={f._id} className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {f.label}
                        {f.isRequired && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    
                    {/* File input */}
                    <div className="relative">
                        <input
                            type="file"
                            id={`dyn_file_${f._id}`}
                            multiple
                            accept={acceptTypes}
                            required={f.isRequired && fieldFiles.length === 0}
                            className="hidden"
                            onChange={(e) => {
                                const selectedFiles = Array.from(e.target.files);
                                const filesWithPreview = selectedFiles.map(file => ({
                                    file,
                                    id: Math.random().toString(36).substr(2, 9),
                                    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                                    name: file.name,
                                    size: file.size,
                                    type: file.type
                                }));
                                setDyn(f.label, [...fieldFiles, ...filesWithPreview]);
                            }}
                        />
                        <label
                            htmlFor={`dyn_file_${f._id}`}
                            className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm text-gray-600">
                                {f.type === 'image' ? 'Add Images' : 'Add Files'}
                            </span>
                        </label>
                    </div>

                    {/* File preview */}
                    {fieldFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {fieldFiles.map((fileObj) => (
                                <div
                                    key={fileObj.id}
                                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg group"
                                >
                                    {fileObj.preview ? (
                                        <img
                                            src={fileObj.preview}
                                            alt={fileObj.name}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-700 truncate">{fileObj.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (fileObj.preview) URL.revokeObjectURL(fileObj.preview);
                                            setDyn(f.label, fieldFiles.filter(file => file.id !== fileObj.id));
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
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
            );
        }

        return (
            <div key={f._id} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {f.label}
                    {f.isRequired && <span className="text-red-400 ml-1">*</span>}
                </label>
                <input
                    type={f.type === 'password' ? 'password' : f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : 'text'}
                    value={dynamicValues[f.label] ?? ''}
                    required={f.isRequired}
                    className={baseClass}
                    onChange={(e) => setDyn(f.label, e.target.value)}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
                    <p className="text-sm text-gray-500 mt-1">Fill in the details below to register a new user account.</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 flex items-start gap-2 px-4 py-3 rounded-lg text-sm font-medium ${isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                        {isError ? (
                            <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Account */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Account</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {field('Email', 'email', 'email')}
                            {field('Language', 'lang')}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                                <input
                                    type="password"
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password Confirmation</label>
                                <input
                                    type="password"
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Personal */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Personal Info</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {field('Name', 'name')}
                            {field('Surname', 'surname')}
                            {field('Cell Phone', 'cellphone')}
                        </div>
                    </section>

                    {/* Company */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Company</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {field('Company Name', 'company')}
                            {field('Company VAT', 'companyvat')}
                            {field('Website', 'web')}
                        </div>
                    </section>

                    {/* Address */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Address</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {field('Street and No.', 'streetno')}
                            {field('City', 'city')}
                            {field('Post Code', 'postcode')}
                            {field('Country', 'country')}
                        </div>
                    </section>

                    {/* Role & Preferences */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Role & Preferences</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                                <select
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white"
                                    onChange={(e) => setValues({ ...values, role: e.target.value })}
                                >
                                    <option value="">Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="User">User</option>
                                    <option value="Dealer">Dealer</option>
                                    <option value="Transporter">Transporter</option>
                                    <option value="Auction">Auction</option>
                                    <option value="KhaiTai">KhaiTai</option>
                                    <option value="Export">Export</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-3 justify-center pt-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-blue-500"
                                        onChange={(e) => setValues({ ...values, newsletter: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-600">Receive newsletter</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-blue-500"
                                        onChange={(e) => setValues({ ...values, newpurchase: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-600">Notify on new vehicle purchase</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Dynamic Fields Section */}
                    {!loadingFields && dynamicFields.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">
                                Additional Info
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {dynamicFields.map(renderDynamicField)}
                            </div>
                        </section>
                    )}

                    {/* File Upload Section */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">
                            Files & Documents
                        </h2>
                        
                        {/* Drag and Drop Zone */}
                        <div
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                                isDragging 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <input
                                type="file"
                                id="fileInput"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            
                            <div className="flex flex-col items-center gap-3">
                                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                
                                <div>
                                    <label htmlFor="fileInput" className="cursor-pointer text-blue-500 hover:text-blue-600 font-semibold">
                                        Click to upload
                                    </label>
                                    <span className="text-gray-500"> or drag and drop</span>
                                </div>
                                
                                <p className="text-xs text-gray-500">
                                    Images, PDFs, Documents • You can also paste screenshots (Ctrl+V)
                                </p>
                            </div>
                        </div>

                        {/* File Preview List */}
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Uploaded Files ({files.length})
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {files.map((fileObj) => (
                                        <div
                                            key={fileObj.id}
                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition group"
                                        >
                                            {/* Preview or Icon */}
                                            <div className="flex-shrink-0">
                                                {fileObj.preview ? (
                                                    <img
                                                        src={fileObj.preview}
                                                        alt={fileObj.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* File Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-700 truncate">
                                                    {fileObj.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(fileObj.size)}
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(fileObj.id)}
                                                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Loading skeleton for dynamic fields */}
                    {loadingFields && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Additional Info</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-9 bg-gray-100 rounded-md animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition text-sm"
                    >
                        Create User
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Page;
