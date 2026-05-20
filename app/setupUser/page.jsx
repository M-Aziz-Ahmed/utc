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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        const res = await fetch('/api/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, ...dynamicValues }),
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
