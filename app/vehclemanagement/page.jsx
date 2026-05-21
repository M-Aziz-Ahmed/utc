'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const Page = () => {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)

    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/vehicles')
            if (!res.ok) throw new Error('Failed to fetch vehicles')
            const data = await res.json()
            setVehicles(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        })
    }

    const getVehicleImage = (vehicle) => {
        // Try to find image from dynamic fields (field labels like "car images")
        const keys = Object.keys(vehicle)
        for (const key of keys) {
            const value = vehicle[key]
            // Check if it's an array of file objects with image type
            if (Array.isArray(value) && value.length > 0) {
                const firstItem = value[0]
                if (firstItem && typeof firstItem === 'object' && firstItem.path && firstItem.type?.startsWith('image/')) {
                    return firstItem.path
                }
            }
        }
        
        // Try to find an image from files array
        if (vehicle.files && vehicle.files.length > 0) {
            const imageFile = vehicle.files.find(f => f.type?.startsWith('image/'))
            if (imageFile) return imageFile.path
        }
        
        return null
    }

    const getVehicleTitle = (vehicle) => {
        // Try common field names for vehicle title
        const titleFields = ['name', 'title', 'model', 'Model', 'Vehicle Name', 'make', 'Make', 'Name', 'Title']
        for (const field of titleFields) {
            if (vehicle[field]) return vehicle[field]
        }
        
        // If no title field found, try to find the first non-empty string field
        const keys = Object.keys(vehicle)
        for (const key of keys) {
            const value = vehicle[key]
            // Skip internal fields, arrays, and objects
            if (!key.startsWith('_') && key !== 'files' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'createdBy' && key !== '__v' && 
                typeof value === 'string' && value.trim() !== '' && !Array.isArray(value) && typeof value !== 'object') {
                return value
            }
        }
        
        return 'Vehicle'
    }

    const filteredVehicles = vehicles.filter(vehicle => {
        const searchLower = searchTerm.toLowerCase()
        const vehicleString = JSON.stringify(vehicle).toLowerCase()
        return vehicleString.includes(searchLower)
    })

    const handleViewDetails = (vehicle) => {
        setSelectedVehicle(vehicle)
        setShowDetailsModal(true)
    }

    const closeDetailsModal = () => {
        setShowDetailsModal(false)
        setSelectedVehicle(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Vehicle Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'} in inventory
                            </p>
                        </div>
                        
                        <Link 
                            href="/vehclemanagement/add-vehicles"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Vehicle
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search and View Controls */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md w-full">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2 bg-white border border-gray-300 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <p className="text-gray-600">Loading vehicles...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <p className="text-red-700 font-semibold">{error}</p>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm ? 'No vehicles found' : 'No vehicles yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first vehicle'}
                        </p>
                        {!searchTerm && (
                            <Link 
                                href="/vehclemanagement/add-vehicles"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Your First Vehicle
                            </Link>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <VehicleGrid vehicles={filteredVehicles} getVehicleImage={getVehicleImage} getVehicleTitle={getVehicleTitle} formatDate={formatDate} onViewDetails={handleViewDetails} />
                ) : (
                    <VehicleList vehicles={filteredVehicles} getVehicleImage={getVehicleImage} getVehicleTitle={getVehicleTitle} formatDate={formatDate} onViewDetails={handleViewDetails} />
                )}
            </div>

            {/* Vehicle Details Modal */}
            {showDetailsModal && selectedVehicle && (
                <VehicleDetailsModal 
                    vehicle={selectedVehicle} 
                    onClose={closeDetailsModal}
                    getVehicleTitle={getVehicleTitle}
                    formatDate={formatDate}
                />
            )}
        </div>
    )
}


// Vehicle Details Modal Component
const VehicleDetailsModal = ({ vehicle, onClose, getVehicleTitle, formatDate }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    
    // Collect all images from the vehicle
    const getAllImages = () => {
        const images = []
        
        // Get images from dynamic fields (like "car images")
        Object.entries(vehicle).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(item => {
                    if (item && typeof item === 'object' && item.path && item.type?.startsWith('image/')) {
                        images.push({ ...item, fieldName: key })
                    }
                })
            }
        })
        
        // Get images from files array
        if (vehicle.files && Array.isArray(vehicle.files)) {
            vehicle.files.forEach(file => {
                if (file.type?.startsWith('image/')) {
                    images.push({ ...file, fieldName: 'files' })
                }
            })
        }
        
        return images
    }

    const images = getAllImages()
    const hasImages = images.length > 0

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goToImage = (index) => {
        setCurrentImageIndex(index)
    }

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [onClose])

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{getVehicleTitle(vehicle)}</h2>
                        <p className="text-sm text-gray-500 mt-1">Added {formatDate(vehicle.createdAt)}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Image Slider Section */}
                        <div className="space-y-4">
                            {hasImages ? (
                                <>
                                    {/* Main Image Display */}
                                    <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video">
                                        <img
                                            src={images[currentImageIndex].path}
                                            alt={images[currentImageIndex].name || 'Vehicle image'}
                                            className="w-full h-full object-contain"
                                        />
                                        
                                        {/* Image Counter */}
                                        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>

                                        {/* Navigation Arrows */}
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition"
                                                >
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition"
                                                >
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Thumbnail Strip */}
                                    {images.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {images.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => goToImage(index)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                                                        index === currentImageIndex
                                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                                            : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                >
                                                    <img
                                                        src={image.path}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <svg className="w-20 h-20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm">No images available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Vehicle Details Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Vehicle Information
                                </h3>
                                
                                <div className="space-y-3">
                                    {Object.entries(vehicle)
                                        .filter(([key, value]) => {
                                            // Skip internal fields, arrays, and objects
                                            if (key.startsWith('_') || key === 'files' || key === 'createdAt' || key === 'updatedAt' || key === 'createdBy' || key === '__v') {
                                                return false
                                            }
                                            if (Array.isArray(value) || typeof value === 'object') {
                                                return false
                                            }
                                            if (value === '' || value === null || value === undefined) {
                                                return false
                                            }
                                            return true
                                        })
                                        .map(([key, value]) => (
                                            <div key={key} className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1">{key}</p>
                                                <p className="text-base text-gray-900 font-medium">{String(value)}</p>
                                            </div>
                                        ))}
                                    
                                    {Object.entries(vehicle).filter(([key, value]) => {
                                        if (key.startsWith('_') || key === 'files' || key === 'createdAt' || key === 'updatedAt' || key === 'createdBy' || key === '__v') {
                                            return false
                                        }
                                        if (Array.isArray(value) || typeof value === 'object') {
                                            return false
                                        }
                                        if (value === '' || value === null || value === undefined) {
                                            return false
                                        }
                                        return true
                                    }).length === 0 && (
                                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                                            <p className="text-sm text-gray-500 italic">No additional information available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Files Section */}
                            {hasImages && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Images ({images.length})
                                    </h3>
                                    
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {images.map((image, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                                    <img src={image.path} alt={image.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{image.name || `Image ${index + 1}`}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{image.fieldName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition"
                    >
                        Close
                    </button>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Vehicle
                    </button>
                </div>
            </div>
        </div>
    )
}


// Grid View Component
const VehicleGrid = ({ vehicles, getVehicleImage, getVehicleTitle, formatDate, onViewDetails }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => {
                const image = getVehicleImage(vehicle)
                const title = getVehicleTitle(vehicle)
                
                return (
                    <div key={vehicle._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all transform hover:scale-[1.02]">
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                            {image ? (
                                <img 
                                    src={image} 
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                            )}
                            {/* File Count Badge */}
                            {vehicle.files && vehicle.files.length > 0 && (
                                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {vehicle.files.length}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{title}</h3>
                            
                            {/* Vehicle Details */}
                            <div className="space-y-2 mb-4">
                                {Object.entries(vehicle).map(([key, value]) => {
                                    // Skip internal fields, files, and arrays (images/files are shown separately)
                                    if (key.startsWith('_') || key === 'files' || key === 'createdAt' || key === 'updatedAt' || key === 'createdBy' || key === '__v' || Array.isArray(value) || typeof value === 'object') {
                                        return null
                                    }
                                    
                                    // Skip empty values
                                    if (value === '' || value === null || value === undefined) {
                                        return null
                                    }
                                    
                                    return (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-600 font-medium capitalize">{key}:</span>
                                            <span className="text-gray-900 truncate ml-2">{String(value)}</span>
                                        </div>
                                    )
                                }).filter(Boolean).length > 0 ? (
                                    Object.entries(vehicle).map(([key, value]) => {
                                        if (key.startsWith('_') || key === 'files' || key === 'createdAt' || key === 'updatedAt' || key === 'createdBy' || key === '__v' || Array.isArray(value) || typeof value === 'object') {
                                            return null
                                        }
                                        if (value === '' || value === null || value === undefined) {
                                            return null
                                        }
                                        return (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-gray-600 font-medium capitalize">{key}:</span>
                                                <span className="text-gray-900 truncate ml-2">{String(value)}</span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No additional details</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-500">
                                    {formatDate(vehicle.createdAt)}
                                </span>
                                <button 
                                    onClick={() => onViewDetails(vehicle)}
                                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                                >
                                    View Details
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// List View Component
const VehicleList = ({ vehicles, getVehicleImage, getVehicleTitle, formatDate, onViewDetails }) => {
    return (
        <div className="space-y-4">
            {vehicles.map((vehicle) => {
                const image = getVehicleImage(vehicle)
                const title = getVehicleTitle(vehicle)
                
                return (
                    <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row">
                            {/* Image */}
                            <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-gray-100 to-gray-200 shrink-0">
                                {image ? (
                                    <img 
                                        src={image} 
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-5">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
                                        <p className="text-sm text-gray-500">Added {formatDate(vehicle.createdAt)}</p>
                                    </div>
                                    {vehicle.files && vehicle.files.length > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {vehicle.files.length} {vehicle.files.length === 1 ? 'file' : 'files'}
                                        </div>
                                    )}
                                </div>

                                {/* Vehicle Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                                    {Object.entries(vehicle).filter(([key, value]) => {
                                        // Skip internal fields, arrays, and empty values
                                        if (key.startsWith('_') || key === 'files' || key === 'createdAt' || key === 'updatedAt' || key === 'createdBy' || key === '__v' || Array.isArray(value) || typeof value === 'object') {
                                            return false
                                        }
                                        if (value === '' || value === null || value === undefined) {
                                            return false
                                        }
                                        return true
                                    }).length > 0 ? (
                                        Object.entries(vehicle).map(([key, value]) => {
                                            if (key.startsWith('_') || key === 'files' || key === 'createdAt' || key === 'updatedAt' || key === 'createdBy' || key === '__v' || Array.isArray(value) || typeof value === 'object') {
                                                return null
                                            }
                                            if (value === '' || value === null || value === undefined) {
                                                return null
                                            }
                                            
                                            return (
                                                <div key={key} className="bg-gray-50 rounded-lg p-2">
                                                    <p className="text-xs text-gray-600 font-medium mb-1 capitalize">{key}</p>
                                                    <p className="text-sm text-gray-900 font-semibold truncate">{String(value)}</p>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="col-span-full">
                                            <p className="text-sm text-gray-500 italic">No additional details available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onViewDetails(vehicle)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View Details
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition text-sm">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Page
