'use client'
import { useState } from "react";

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
    })
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault();
        const res = await fetch('/api/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        });
        const data = await res.json().catch(() => ({ message: 'Server error' }));
        setIsError(!res.ok)
        setMessage(data.message || 'Server error');
    };

    const field = (label, key, type = 'text') => (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            <input
                type={type}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
        </div>
    )

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
                    <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
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
}

export default Page;
