'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const RikusoManagementPage = () => {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [showPresoldModal, setShowPresoldModal] = useState(false)
    const [rikusoCompanies, setRikusoCompanies] = useState([])
    const [consignees, setConsignees] = useState([])
    const [presoldData, setPresoldData] = useState({
        consigneeName: '',
        label: ''
    })
    const [allocations, setAllocations] = useState({})

    useEffect(() => {
        fetchVehicles()
        fetchRikusoCompanies()
        fetchConsignees()
    }, [])

    const fetchVehicles = async () => {
        try {
            const res = await fetch('/api/vehicles')
            if (res.ok) {
                const data = await res.json()
                setVehicles(data)
                // Initialize allocations state
                const initialAllocations = {}
                data.forEach(v => {
                    initialAllocations[v._id] = v.allocation || ''
                })
                setAllocations(initialAllocations)
            }
        } catch (err) {
            console.error('Error fetching vehicles:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchRikusoCompanies = async () => {
        try {
            const res = await fetch('/api/manufacturer')
            if (res.ok) {
                const data = await res.json()
                setRikusoCompanies(data.filter(m => m.isRikusoCompany))
            }
        } catch (err) {
            console.error('Error fetching rikuso companies:', err)
        }
    }

    const fetchConsignees = async () => {
        try {
            const res = await fetch('/api/consignee')
            if (res.ok) {
                const data = await res.json()
                setConsignees(data)
            }
        } catch (err) {
            console.error('Error fetching consignees:', err)
        }
    }

    const handlePresold = (vehicle) => {
        setSelectedVehicle(vehicle)
        // Pre-fill if updating existing presold
        if (vehicle.consignee) {
            const existingConsignee = consignees.find(c => c._id === vehicle.consignee)
            if (existingConsignee) {
                setPresoldData({
                    consigneeName: existingConsignee.name,
                    label: existingConsignee.label || ''
                })
            }
        }
        setShowPresoldModal(true)
    }

    const handleRikusoChange = async (vehicleId, rikusoCompanyId) => {
        try {
            const res = await fetch('/api/vehicles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicleId,
                    rikusoCompany: rikusoCompanyId || null,
                    rikusoStatus: rikusoCompanyId !== ''
                })
            })
            
            if (res.ok) {
                // Update vehicle in state
                setVehicles(prev => prev.map(v => 
                    v._id === vehicleId 
                        ? { ...v, rikusoCompany: rikusoCompanyId || null, rikusoStatus: rikusoCompanyId !== '' }
                        : v
                ))
                alert('Rikuso company updated successfully!')
            }
        } catch (err) {
            console.error('Error updating rikuso:', err)
            alert('Failed to update rikuso company')
        }
    }

    const handleAllocationChange = async (vehicleId, allocation) => {
        try {
            const res = await fetch(`/api/vehicles`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    vehicleId, 
                    allocation,
                    // allocationStatus is ONLY controlled by the Presold button, not by allocation type
                })
            })
            
            if (res.ok) {
                setAllocations(prev => ({ ...prev, [vehicleId]: allocation }))
                setVehicles(prev => prev.map(v => 
                    v._id === vehicleId 
                        ? { ...v, allocation }
                        : v
                ))
            }
        } catch (err) {
            console.error('Error updating allocation:', err)
            alert('Failed to update allocation')
        }
    }

    const handlePresoldSubmit = async (e) => {
        e.preventDefault()
        
        try {
            // Create or reuse consignee
            const res = await fetch('/api/consignee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: presoldData.consigneeName,
                    label: presoldData.label
                })
            })
            
            if (!res.ok) throw new Error('Failed to create consignee')
            const newConsignee = await res.json()
            
            // Update vehicle — set allocationStatus: true HERE (presold confirmed)
            const updateRes = await fetch('/api/vehicles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicleId: selectedVehicle._id,
                    consignee: newConsignee._id,
                    allocationStatus: true
                })
            })
            
            if (!updateRes.ok) throw new Error('Failed to update vehicle')
            
            setVehicles(prev => prev.map(v => 
                v._id === selectedVehicle._id 
                    ? { ...v, consignee: newConsignee._id, allocationStatus: true }
                    : v
            ))
            
            setConsignees(prev => [...prev, newConsignee])
            alert('Presold label saved successfully!')
            setShowPresoldModal(false)
            setPresoldData({ consigneeName: '', label: '' })
        } catch (err) {
            console.error('Error saving presold:', err)
            alert('Failed to save presold label')
        }
    }

    const handleRemovePresold = async (vehicle) => {
        if (!confirm('Remove presold status from this vehicle?')) return
        try {
            const res = await fetch('/api/vehicles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicleId: vehicle._id,
                    consignee: null,
                    allocationStatus: false
                })
            })
            if (!res.ok) throw new Error('Failed')
            setVehicles(prev => prev.map(v =>
                v._id === vehicle._id ? { ...v, consignee: null, allocationStatus: false } : v
            ))
        } catch (err) {
            alert('Failed to remove presold: ' + err.message)
        }
    }

    const getVehicleTitle = (vehicle) => {
        const titleFields = ['Model', 'model', 'name', 'title']
        for (const field of titleFields) {
            if (vehicle[field]) return vehicle[field]
        }
        return 'Vehicle'
    }

    const getVehicleImage = (vehicle) => {
        // Prefer thumbnail field, then fall back to first image found
        const keys = Object.keys(vehicle)
        const thumbKey = keys.find(k =>
            k.toLowerCase().replace(/[\s_]/g, '').includes('thumbnail') &&
            Array.isArray(vehicle[k]) && vehicle[k][0]?.path && vehicle[k][0]?.type?.startsWith('image/')
        )
        if (thumbKey) return vehicle[thumbKey][0].path

        for (const key of keys) {
            const value = vehicle[key]
            if (Array.isArray(value) && value.length > 0) {
                const first = value[0]
                if (first && typeof first === 'object' && first.path && first.type?.startsWith('image/')) {
                    return first.path
                }
            }
        }
        if (vehicle.files && vehicle.files.length > 0) {
            const imageFile = vehicle.files.find(f => f.type?.startsWith('image/'))
            if (imageFile) return imageFile.path
        }
        return null
    }

    const allocationOptions = [
        { value: 'export', label: 'Export' },
        { value: 'khitai', label: 'Khitai' },
        { value: 'resale-to-auction', label: 'Resale to Auction' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Vehicle Allocation & Rikuso Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage vehicle allocations, presold labels, and Rikuso forms</p>
                    </div>
                    <Link 
                        href="/admin/manage"
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage Rikuso Companies
                    </Link>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm text-blue-900 font-semibold mb-1">Note:</p>
                            <p className="text-sm text-blue-800">All dots/colors will be in gray by default. When we done its allocation & Rikuso then their color will be changed.</p>
                        </div>
                    </div>
                </div>

                {/* Vehicles Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles Found</h3>
                        <p className="text-gray-600 mb-6">Add vehicles first to manage allocations</p>
                        <Link href="/admin/vehicles/add" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Vehicle
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((vehicle) => {
                            const image = getVehicleImage(vehicle)
                            const title = getVehicleTitle(vehicle)
                            const allocationStatus = vehicle.allocationStatus || false
                            const rikusoStatus = vehicle.rikusoStatus || false
                            
                            return (
                                <div key={vehicle._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                                    {/* Image with Status Dots */}
                                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                                        {image ? (
                                            <img src={image} alt={title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                        )}
                                        
                                        {/* Status Dots */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <div 
                                                className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${allocationStatus ? 'bg-green-500' : 'bg-gray-400'}`} 
                                                title="Allocation Status"
                                            ></div>
                                            <div 
                                                className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${rikusoStatus ? 'bg-blue-500' : 'bg-gray-400'}`} 
                                                title="Rikuso Status"
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
                                        
                                        {/* Allocation Dropdown */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                                                Vehicle Allocation
                                            </label>
                                            <select 
                                                value={allocations[vehicle._id] || ''}
                                                onChange={(e) => handleAllocationChange(vehicle._id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select allocation...</option>
                                                {allocationOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Presold Label Display */}
                                        {vehicle.consignee && (
                                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    <span className="text-xs font-bold text-blue-900 uppercase">Presold Label</span>
                                                </div>
                                                <p className="text-sm text-blue-800 font-semibold">
                                                    {consignees.find(c => c._id === vehicle.consignee)?.label || 'Label not set'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Rikuso Company Dropdown */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                                                Rikuso Company
                                            </label>
                                            <select 
                                                value={vehicle.rikusoCompany || ''}
                                                onChange={(e) => handleRikusoChange(vehicle._id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            >
                                                <option value="">Select Rikuso company...</option>
                                                {rikusoCompanies.map(company => (
                                                    <option key={company._id} value={company._id}>
                                                        {company.companyName || company.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePresold(vehicle)}
                                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                                            >
                                                {vehicle.consignee ? 'Update Presold' : 'Add Presold'}
                                            </button>
                                            {vehicle.allocationStatus && (
                                                <button
                                                    onClick={() => handleRemovePresold(vehicle)}
                                                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded-lg transition"
                                                    title="Remove Presold"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Presold Modal */}
            {showPresoldModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPresoldModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Blue Color Presold Label</h3>
                            <button onClick={() => setShowPresoldModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            After enabling button it ask for consignee name
                        </p>
                        <form onSubmit={handlePresoldSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Consignee Name</label>
                                <input
                                    type="text"
                                    value={presoldData.consigneeName}
                                    onChange={(e) => setPresoldData({...presoldData, consigneeName: e.target.value})}
                                    placeholder="Enter consignee name..."
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
                                <input
                                    type="text"
                                    value={presoldData.label}
                                    onChange={(e) => setPresoldData({...presoldData, label: e.target.value})}
                                    placeholder="Enter label..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPresoldModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    )
}

export default RikusoManagementPage
