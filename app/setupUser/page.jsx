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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const res = await fetch('/api/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        });

        const data = await res.json().catch(() => ({ message: 'Server error' }));
        setMessage(data.message || 'Server error');
    };

    return (
        <div className="flex py-6 justify-center items-center">
            <form onSubmit={handleSubmit} className="form bg-white shadow-md shadow-amber-50 p-4 rounded-lg w-100">
                {message && <p className="mb-3 text-sm text-center">{message}</p>}
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">EMAIL</label>
                    <input type="email" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, email: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">PASSWORD</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, password: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">PASSWORD CONFIRMATION</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">LANGUAGE</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, lang: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">NAME</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, name: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">SURNAME</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, surname: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">CELL PHONE</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, cellphone: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">NAME OF THE COMPANY</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, company: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">COMPANY VAT</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, companyvat: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">WEB</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, web: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">STREET AND NO.</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, streetno: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">CITY</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, city: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">POST CODE</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, postcode: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">COUNTRY</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, country: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">Would you like to receive newsletter?</label>
                    <input type="checkbox" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, newsletter: e.target.checked })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">Sending of new purchased Vehicle</label>
                    <input type="checkbox" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, newpurchase: e.target.checked })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">Role</label>
                    <select className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, role: e.target.value })}>
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

                <button className="bg-blue-400 rounded text-white px-4 py-1" type="submit">create user</button>

            </form>

        </div>
    );
}

export default Page;