'use client'
import { useState } from "react";

const page = () => {
    const [values, setValues] = useState({
        email: '',
        password: ''
    })
    const [message, setMessage] = useState('')

    const handleSubmit = async () => {
        const res = await fetch('api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        });
        const data = await res.json()
        setMessage(data.message)
    };

    return (
        <div className="flex h-[100vh] justify-center items-center">
            <form action={handleSubmit} className="form bg-white shadow-md shadow-amber-50 p-4 rounded-lg w-100">
                {message && <p className="mb-3 text-sm text-center">{message}</p>}
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">Email</label>
                    <input type="email" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, email: e.target.value })} />
                </div>
                <div className="mb-3 flex flex-col">
                    <label className="text-gray-500">Password</label>
                    <input type="text" className="border-2 rounded border-gray-700 py-1" onChange={(e) => setValues({ ...values, password: e.target.value })} />
                </div>
                <button className="bg-blue-400 rounded text-white px-4 py-1" type="submit">Login</button>

            </form>

        </div>
    );
}

export default page;