'use client';
import { useState, useEffect } from 'react';
import {FaEdit, FaTrash} from 'react-icons/fa'
function Page() {
    const [data, setData] = useState();
    const [modelOpen, setModelOpen] = useState(false)
    const [modelNewSite, setModelNewSite] = useState(false)
    const [values, setValues] = useState({
        name: '',
        description: '',
        startingBid: '',
        endDate: '',
    });
    const [auctionVenue, setAuctionVenue]= useState({
        group:'',
        name:'',
        membership:'',
        tel:'',
        fax:'',
        email:'',
        postal:'',
        address:'',
    })
    const [auctionVenues, setAuctionVenues] = useState([])
    console.log(values);
    const fields = async () => {
        const response = await fetch('/api/auctionGroup', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setData(data);
    }
    // fields();
    useEffect(() => {
        fields();
    }, []);

    const handleSubmit = async (e) => {
        const response = await fetch('/api/auctionGroup', {
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
            <div className="header flex justify-between px-5 py-2">
                <div className="">Manage Auction Groups</div>
                <div className="">
                    <button className='btn bg-blue-400 px-3 py-2 text-center rounded text-white shadow-ld cursor-pointer hover:bg-blue-500' onClick={() => setModelOpen(prev => !prev)}>Add New Group</button>
                </div>
            </div>
            {modelOpen && (
                <div className="h-screen w-screen backdrop-blur-sm absolute top-0 left-0 z-50 flex justify-center items-center">
                    <div className="form bg-white shadow-lg rounded p-3 w-120">
                        <div className="form-header flex justify-between items-center shadow p-2">
                            <div className="">Add New Group</div>
                            <div className="bg-blue-400 text-[white!important] w-6 h-6 text-center cursor-pointer rounded hover:bg-blue-500" onClick={() => setModelOpen(prev => !prev)}>x</div>
                        </div>
                        <div className="form-body">
                            <div className="m-3 flex flex-col">
                                <label htmlFor="">Group Name:</label>
                                <input type="text" className='shadow-lg border-slate-400 border-1 p-1 rounded focus:border-blue-400 outline-none' value={auctionVenue.group} onChange={(e)=>setAuctionVenue({...auctionVenue, group:e.target.value})}/>
                            </div>
                            <div className="m-3 flex flex-col">
                                <div className="header flex justify-between">
                                    <div className="">Sites</div>
                                    <div className="text-blue-400 cursor-pointer" onClick={() => setModelNewSite(prev => !prev)}>add new</div>
                                </div>
                                {modelNewSite ? (
                                    <div className='flex flex-wrap gap-3 items-center'>
                                        <div className="mb-3 flex flex-col">
                                            <label htmlFor="" className='text-sm'>Auction Venue</label>
                                            <input type="text" className='shadow-lg border-slate-400 border-1 rounded focus:border-blue-400 outline-none' value={auctionVenue.name} onChange={(e)=>setAuctionVenue({...auctionVenue, name:e.target.value})}/>
                                        </div>
                                        <div className="mb-3 flex flex-col">
                                            <label htmlFor="" className='text-sm'>Membership#</label>
                                            <input type="text" className='shadow-lg border-slate-400 border-1 rounded focus:border-blue-400 outline-none' value={auctionVenue.membership} onChange={(e)=>setAuctionVenue({...auctionVenue, membership:e.target.value})}/>
                                        </div>
                                        <div className="mb-3 flex flex-col">
                                            <label htmlFor="" className='text-sm'>TEL:</label>
                                            <input type="text" className='shadow-lg border-slate-400 border-1 rounded focus:border-blue-400 outline-none' value={auctionVenue.tel} onChange={(e)=>setAuctionVenue({...auctionVenue, tel:e.target.value})}/>
                                        </div>
                                        <div className="mb-3 flex flex-col">
                                            <label htmlFor="" className='text-sm'>FAX:</label>
                                            <input type="text" className='shadow-lg border-slate-400 border-1 rounded focus:border-blue-400 outline-none' value={auctionVenue.fax} onChange={(e)=>setAuctionVenue({...auctionVenue, fax:e.target.value})}/>
                                        </div>
                                        <div className="mb-3 flex flex-col">
                                            <label htmlFor="" className='text-sm'>Email</label>
                                            <input type="text" className='shadow-lg border-slate-400 border-1 rounded focus:border-blue-400 outline-none' value={auctionVenue.email} onChange={(e)=>setAuctionVenue({...auctionVenue, email:e.target.value})}/>
                                        </div>
                                        <div className="mb-3 flex flex-col">
                                            <label htmlFor="" className='text-sm'>Potal Code</label>
                                            <input type="text" className='shadow-lg border-slate-400 border-1 rounded focus:border-blue-400 outline-none' value={auctionVenue.postal} onChange={(e)=>setAuctionVenue({...auctionVenue, postal:e.target.value})}/>
                                        </div>
                                        <div className="mb-3 flex flex-col">
                                            <label htmlFor="" className='text-sm'>Address</label>
                                            <input type="text" className='shadow-lg border-slate-400 border-1 rounded focus:border-blue-400 outline-none' value={auctionVenue.address} onChange={(e)=>setAuctionVenue({...auctionVenue, address:e.target.value})}/>
                                        </div>
                                        <button className='bg-blue-400 rounded p-2 px-3 mt-1.5 text-white text-sm hover:bg-blue-500' onClick={()=>setAuctionVenues([...auctionVenues, auctionVenue])}>Add</button>

                                    </div>
                                ): (
                                    <div className='flex flex-col gap-2'>
                                     {auctionVenues.length === 0 ?(
                                        <div className="flex justify-center items-center bg-slate-200 rounded h-40">
                                            <div className="text-slate-400">
                                                No venues Yet
                                            </div>
                                        </div>
                                     ):(auctionVenues?.map((av)=>(
                                        <div className='bg-slate-200 shadow rounded p-3 flex justify-between items-center'>
                                            <div className="">{av.name}</div>
                                            <div className="flex gap-2"><FaEdit/><FaTrash/></div>
                                        </div>
                                    )))}
                                    
                                 </div>
                                )}
                        </div>
                    </div>
                </div>
                </div>
    )
}
{
    data && data.map((field) => (
        <div key={field._id}>
            <h3>{field.label}</h3>
            <input type={field.type} placeholder={field.placeholder} value={values[field.label]} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} />
        </div>
    ))
}
        </div >
    )
}
export default Page;