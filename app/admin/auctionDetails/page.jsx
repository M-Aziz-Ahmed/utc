'use client';
import { useState, useEffect } from 'react';
function Page() {
    const [data, setData] = useState();
    const [values, setValues] = useState({
        name: '',
        description: '',
        startingBid: '',
        endDate: '',
    });
    console.log(values);
    const fields = async () => {
        const response = await fetch('/api/fields', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ belongsto: 'Auction-Details' }),
        });
        const data = await response.json();
        setData(data);
    }
    // fields();
    useEffect(() => {
        fields();
    }, []);

    const handleSubmit = async (e) => {
        const response = await fetch('/api/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        const data = await response.json();
        console.log(data);
    }
    return (
        <div>
            {data && data.map((field) => (
                <div key={field._id}>
                    <h3>{field.label}</h3>
                    <input type={field.type} placeholder={field.placeholder} value={values[field.label]} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} />
                </div>
            ))}

            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}
export default Page;