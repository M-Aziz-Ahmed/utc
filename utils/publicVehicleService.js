import dbConnect from './dbConnection'
import Vehicle from '@/models/Vehicle'

const PUBLIC_VEHICLE_STATUS = process.env.PUBLIC_VEHICLE_STATUS || 'export'

const FIELD_MAPPING = {
  vehicleId: '_id',
  stockId: 'stockId',
  make: 'manufacturer',
  model: 'model',
  year: 'Year',
  price: 'Price',
  mileage: 'Mileage',
  engine: 'Engine Capacity',
  transmission: 'Gear Box Type',
  fuelType: 'Fuel Type',
  bodyType: 'Body Type',
  driveType: 'Drive Type',
  steering: 'Steering',
  color: 'Color',
  seats: 'Seats',
  doors: 'Doors',
  chassisNumber: 'Chassis No.',
  engineNumber: 'Engine No.',
  condition: 'Condition',
  location: 'Car Location',
  grade: 'Category / Grade',
  images: 'Vehicle Images',
  thumbnailImage: 'Thumbnail Image',
  allocation: 'allocation',
  allocationStatus: 'allocationStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
}

const FIELD_ALIASES = {
  year: ['Year', 'Year Make', 'Year of Registration', 'Model Year', 'Manufacture Year'],
  mileage: ['Mileage', 'Millage', 'KM', 'Odometer'],
  transmission: ['Gear Box Type', 'Transmission', 'Gearbox', 'Trans'],
  fuelType: ['Fuel Type', 'Fuel', 'Engine Type'],
  engine: ['Engine Capacity', 'Engine', 'Engine CC', 'Displacement'],
  seats: ['Seats', 'Seating Capacity', 'Seat Count'],
  doors: ['Doors', 'Door Count'],
  bodyType: ['Body Type', 'Body'],
  driveType: ['Drive Type', 'Drive', 'Drivetrain'],
  chassisNumber: ['Chassis No.', 'Chassis No', 'Chassis Number', 'VIN'],
  color: ['Color', 'Colour'],
  condition: ['Condition'],
  grade: ['Category / Grade', 'Grade', 'Auction Grade'],
  location: ['Car Location', 'Location', 'Yard Location'],
}

function mapVehicleToPublic(vehicle) {
  const get = (fieldName) => {
    const primary = FIELD_MAPPING[fieldName]
    if (primary && vehicle[primary]) return vehicle[primary]
    const aliases = FIELD_ALIASES[fieldName]
    if (aliases) {
      for (const alias of aliases) {
        if (vehicle[alias]) return vehicle[alias]
      }
    }
    return vehicle[fieldName] || ''
  }

  const images = vehicle[FIELD_MAPPING.images] || vehicle['Vehicle Images'] || []
  const thumbnail = vehicle[FIELD_MAPPING.thumbnailImage] || vehicle['Thumbnail Image'] || ''
  const gatePassPaths = (Array.isArray(vehicle.gatePassImages) ? vehicle.gatePassImages : []).map(img => img?.path).filter(Boolean)

  let allImages = []
  let mainImage = ''
  if (gatePassPaths.length > 0) {
    // Public site shows only the photos taken when the car arrived (uploaded at In Gate Pass time)
    allImages = gatePassPaths
    mainImage = gatePassPaths[0]
  } else {
    mainImage = vehicle.mainImageUrl || thumbnail || (Array.isArray(images) && images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0]?.path) : '')
    if (Array.isArray(images)) {
      allImages = images.map(img => typeof img === 'string' ? img : img?.path).filter(Boolean)
    }
    if (mainImage && !allImages.includes(mainImage)) {
      allImages.unshift(mainImage)
    }
  }

  const year = get('year')
  const make = get('make')
  const model = get('model')

  const mapped = {
    vehicleId: vehicle._id?.toString(),
    stockId: get('stockId'),
    make,
    model,
    year: year ? parseInt(year) || year : null,
    price: get('price'),
    mileage: get('mileage'),
    engine: get('engine'),
    transmission: get('transmission'),
    fuelType: get('fuelType'),
    bodyType: get('bodyType'),
    driveType: get('driveType'),
    steering: get('steering'),
    color: get('color'),
    seats: get('seats'),
    doors: get('doors'),
    chassisNumber: get('chassisNumber'),
    engineNumber: get('engineNumber'),
    condition: get('condition'),
    location: get('location'),
    grade: get('grade'),
    images: allImages,
    mainImage,
    allocation: get('allocation'),
    allocationStatus: vehicle.allocationStatus,
    exportStatus: vehicle.exportStatus,
    title: `${year} ${make} ${model}`.trim() || 'Vehicle',
    slug: `${year}-${make}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
    isNewArrival: (() => {
      const created = new Date(vehicle.createdAt)
      const now = new Date()
      const diffDays = (now - created) / (1000 * 60 * 60 * 24)
      return diffDays <= 14
    })(),
  }

  // Include ALL dynamic fields from the vehicle object to support custom fields
  // This ensures fields like "Final Price" or any other dynamic field are available
  const knownKeys = new Set(Object.values(FIELD_MAPPING))
  Object.keys(vehicle).forEach(key => {
    // Skip internal MongoDB fields and already-mapped fields
    if (key !== '_id' && key !== '__v' && !mapped[key] && !key.startsWith('_')) {
      mapped[key] = vehicle[key]
    }
  })

  return mapped
}

function buildFilterQuery(filters = {}) {
  const query = {}
  const orParts = []

  if (filters.status) {
    query.allocation = filters.status
  } else {
    query.allocation = PUBLIC_VEHICLE_STATUS
  }

  if (filters.make) {
    query['manufacturer'] = { $regex: filters.make, $options: 'i' }
  }
  if (filters.model) {
    query['model'] = { $regex: filters.model, $options: 'i' }
  }
  if (filters.yearFrom || filters.yearTo) {
    const yearFilter = {}
    if (filters.yearFrom) yearFilter.$gte = parseInt(filters.yearFrom)
    if (filters.yearTo) yearFilter.$lte = parseInt(filters.yearTo)
    orParts.push(...FIELD_ALIASES.year.map(a => ({ [a]: yearFilter })))
  }
  if (filters.minPrice || filters.maxPrice) {
    const priceFilter = {}
    if (filters.minPrice) priceFilter.$gte = parseFloat(filters.minPrice)
    if (filters.maxPrice) priceFilter.$lte = parseFloat(filters.maxPrice)
    query['Price'] = priceFilter
  }
  if (filters.fuelType) {
    orParts.push(...FIELD_ALIASES.fuelType.map(a => ({ [a]: { $regex: filters.fuelType, $options: 'i' } })))
  }
  if (filters.transmission) {
    orParts.push(...FIELD_ALIASES.transmission.map(a => ({ [a]: { $regex: filters.transmission, $options: 'i' } })))
  }
  if (filters.bodyType) {
    query['Body Type'] = { $regex: filters.bodyType, $options: 'i' }
  }
  if (filters.driveType) {
    query['Drive Type'] = { $regex: filters.driveType, $options: 'i' }
  }
  if (filters.steering) {
    query['Steering'] = { $regex: filters.steering, $options: 'i' }
  }
  if (filters.location) {
    query['Car Location'] = { $regex: filters.location, $options: 'i' }
  }

  if (orParts.length > 0) {
    query.$or = orParts
  }

  return query
}

function buildSortQuery(sort) {
  switch (sort) {
    case 'price_asc': return { 'Price': 1 }
    case 'price_desc': return { 'Price': -1 }
    case 'year_desc': return { 'Year': -1 }
    case 'year_asc': return { 'Year': 1 }
    case 'mileage_asc': return { 'Mileage': 1 }
    case 'oldest': return { 'createdAt': 1 }
    case 'latest':
    default: return { 'createdAt': -1 }
  }
}

export async function getPublicVehicles({
  page = 1,
  limit = 20,
  sort = 'latest',
  filters = {},
} = {}) {
  try {
    await dbConnect()

    const query = buildFilterQuery(filters)
    const sortQuery = buildSortQuery(sort)
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).sort(sortQuery).skip(skip).limit(parseInt(limit)).lean(),
      Vehicle.countDocuments(query),
    ])

    return {
      vehicles: vehicles.map(mapVehicleToPublic),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }
  } catch (error) {
    console.error('getPublicVehicles error:', error.message)
    return {
      vehicles: [],
      pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 },
    }
  }
}

export async function getPublicVehicleById(id) {
  try {
    await dbConnect()
    const vehicle = await Vehicle.findOne({ _id: id, allocation: PUBLIC_VEHICLE_STATUS }).lean()
    if (!vehicle) return null
    return mapVehicleToPublic(vehicle)
  } catch (error) {
    console.error('getPublicVehicleById error:', error.message)
    return null
  }
}

export async function getPublicVehicleBySlug(slug) {
  try {
    await dbConnect()
    const vehicles = await Vehicle.find({ allocation: PUBLIC_VEHICLE_STATUS }).lean()
    const mapped = vehicles.map(mapVehicleToPublic)
    return mapped.find(v => v.slug === slug || v.vehicleId === slug) || null
  } catch (error) {
    console.error('getPublicVehicleBySlug error:', error.message)
    return null
  }
}

export async function getVehicleCount() {
  try {
    await dbConnect()
    return await Vehicle.countDocuments({ allocation: PUBLIC_VEHICLE_STATUS })
  } catch (error) {
    console.error('getVehicleCount error:', error.message)
    return 0
  }
}

export async function getFeaturedVehicles(limit = 8) {
  try {
    await dbConnect()
    const vehicles = await Vehicle.find({ allocation: PUBLIC_VEHICLE_STATUS })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean()
    return vehicles.map(mapVehicleToPublic)
  } catch (error) {
    console.error('getFeaturedVehicles error:', error.message)
    return []
  }
}

export async function getNewArrivals(limit = 8) {
  try {
    await dbConnect()
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const vehicles = await Vehicle.find({
      allocation: PUBLIC_VEHICLE_STATUS,
      createdAt: { $gte: twoWeeksAgo }
    }).sort({ createdAt: -1 }).limit(parseInt(limit)).lean()
    return vehicles.map(mapVehicleToPublic)
  } catch (error) {
    console.error('getNewArrivals error:', error.message)
    return []
  }
}

function getAnyField(vehicle, aliases) {
  for (const alias of aliases) {
    if (vehicle[alias]) return vehicle[alias]
  }
  return ''
}

export async function getFilterOptions() {
  try {
    await dbConnect()
    const vehicles = await Vehicle.find({ allocation: PUBLIC_VEHICLE_STATUS }).lean()

    const makes = [...new Set(vehicles.map(v => v['manufacturer'] || v['Make']).filter(Boolean))].sort()
    const fuelTypes = [...new Set(vehicles.map(v => getAnyField(v, FIELD_ALIASES.fuelType)).filter(Boolean))].sort()
    const transmissions = [...new Set(vehicles.map(v => getAnyField(v, FIELD_ALIASES.transmission)).filter(Boolean))].sort()
    const bodyTypes = [...new Set(vehicles.map(v => getAnyField(v, FIELD_ALIASES.bodyType)).filter(Boolean))].sort()
    const driveTypes = [...new Set(vehicles.map(v => getAnyField(v, FIELD_ALIASES.driveType)).filter(Boolean))].sort()
    const years = vehicles.map(v => parseInt(getAnyField(v, FIELD_ALIASES.year))).filter(Boolean)
    const minYear = years.length ? Math.min(...years) : 2000
    const maxYear = years.length ? Math.max(...years) : new Date().getFullYear()
    const prices = vehicles.map(v => parseFloat(v['Price'])).filter(Boolean)
    const minPrice = prices.length ? Math.min(...prices) : 0
    const maxPrice = prices.length ? Math.max(...prices) : 100000

    return { makes, fuelTypes, transmissions, bodyTypes, driveTypes, minYear, maxYear, minPrice, maxPrice }
  } catch (error) {
    console.error('getFilterOptions error:', error.message)
    return { makes: [], fuelTypes: [], transmissions: [], bodyTypes: [], driveTypes: [], minYear: 2000, maxYear: new Date().getFullYear(), minPrice: 0, maxPrice: 100000 }
  }
}
