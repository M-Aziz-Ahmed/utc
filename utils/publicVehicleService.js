import dbConnect from './dbConnection'
import Vehicle from '@/models/Vehicle'

const PUBLIC_VEHICLE_STATUS = process.env.PUBLIC_VEHICLE_STATUS || 'EXPORTED'

const FIELD_MAPPING = {
  vehicleId: '_id',
  stockId: 'stockId',
  make: 'Make',
  model: 'Model',
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
  exportStatus: 'exportStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
}

function mapVehicleToPublic(vehicle) {
  const get = (fieldName) => vehicle[FIELD_MAPPING[fieldName]] || vehicle[fieldName] || ''

  const images = vehicle[FIELD_MAPPING.images] || vehicle['Vehicle Images'] || []
  const thumbnail = vehicle[FIELD_MAPPING.thumbnailImage] || vehicle['Thumbnail Image'] || ''
  const mainImage = vehicle.mainImageUrl || thumbnail || (Array.isArray(images) && images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0]?.path) : '')

  let allImages = []
  if (Array.isArray(images)) {
    allImages = images.map(img => typeof img === 'string' ? img : img?.path).filter(Boolean)
  }
  if (mainImage && !allImages.includes(mainImage)) {
    allImages.unshift(mainImage)
  }

  const year = get('year')
  const make = get('make')
  const model = get('model')

  return {
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
}

function buildFilterQuery(filters = {}) {
  const query = {}

  if (filters.status) {
    query.exportStatus = filters.status
  } else {
    query.exportStatus = PUBLIC_VEHICLE_STATUS
  }

  if (filters.make) {
    query['Make'] = { $regex: filters.make, $options: 'i' }
  }
  if (filters.model) {
    query['Model'] = { $regex: filters.model, $options: 'i' }
  }
  if (filters.yearFrom || filters.yearTo) {
    const yearFilter = {}
    if (filters.yearFrom) yearFilter.$gte = parseInt(filters.yearFrom)
    if (filters.yearTo) yearFilter.$lte = parseInt(filters.yearTo)
    query['Year'] = yearFilter
  }
  if (filters.minPrice || filters.maxPrice) {
    const priceFilter = {}
    if (filters.minPrice) priceFilter.$gte = parseFloat(filters.minPrice)
    if (filters.maxPrice) priceFilter.$lte = parseFloat(filters.maxPrice)
    query['Price'] = priceFilter
  }
  if (filters.fuelType) {
    query['Fuel Type'] = { $regex: filters.fuelType, $options: 'i' }
  }
  if (filters.transmission) {
    query['Gear Box Type'] = { $regex: filters.transmission, $options: 'i' }
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
}

export async function getPublicVehicleById(id) {
  await dbConnect()
  const vehicle = await Vehicle.findById(id).lean()
  if (!vehicle) return null
  return mapVehicleToPublic(vehicle)
}

export async function getPublicVehicleBySlug(slug) {
  await dbConnect()
  const vehicles = await Vehicle.find({}).lean()
  const mapped = vehicles.map(mapVehicleToPublic)
  return mapped.find(v => v.slug === slug) || null
}

export async function getVehicleCount() {
  await dbConnect()
  return await Vehicle.countDocuments({ exportStatus: PUBLIC_VEHICLE_STATUS })
}

export async function getFeaturedVehicles(limit = 8) {
  await dbConnect()
  const vehicles = await Vehicle.find({ exportStatus: PUBLIC_VEHICLE_STATUS })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean()
  return vehicles.map(mapVehicleToPublic)
}

export async function getNewArrivals(limit = 8) {
  await dbConnect()
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
  const vehicles = await Vehicle.find({
    exportStatus: PUBLIC_VEHICLE_STATUS,
    createdAt: { $gte: twoWeeksAgo }
  }).sort({ createdAt: -1 }).limit(parseInt(limit)).lean()
  return vehicles.map(mapVehicleToPublic)
}

export async function getFilterOptions() {
  await dbConnect()
  const vehicles = await Vehicle.find({ exportStatus: PUBLIC_VEHICLE_STATUS }).lean()

  const makes = [...new Set(vehicles.map(v => v['Make']).filter(Boolean))].sort()
  const fuelTypes = [...new Set(vehicles.map(v => v['Fuel Type']).filter(Boolean))].sort()
  const transmissions = [...new Set(vehicles.map(v => v['Gear Box Type']).filter(Boolean))].sort()
  const bodyTypes = [...new Set(vehicles.map(v => v['Body Type']).filter(Boolean))].sort()
  const driveTypes = [...new Set(vehicles.map(v => v['Drive Type']).filter(Boolean))].sort()
  const years = vehicles.map(v => parseInt(v['Year'])).filter(Boolean)
  const minYear = years.length ? Math.min(...years) : 2000
  const maxYear = years.length ? Math.max(...years) : new Date().getFullYear()
  const prices = vehicles.map(v => parseFloat(v['Price'])).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 100000

  return { makes, fuelTypes, transmissions, bodyTypes, driveTypes, minYear, maxYear, minPrice, maxPrice }
}
