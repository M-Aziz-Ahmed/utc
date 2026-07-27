import { NextResponse } from 'next/server'
import { getPublicVehicles, getVehicleCount, getFilterOptions } from '@/utils/publicVehicleService'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const page = searchParams.get('page') || 1
    const limit = searchParams.get('limit') || 20
    const sort = searchParams.get('sort') || 'latest'
    const make = searchParams.get('make') || ''
    const model = searchParams.get('model') || ''
    const yearFrom = searchParams.get('yearFrom') || ''
    const yearTo = searchParams.get('yearTo') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const fuelType = searchParams.get('fuelType') || ''
    const transmission = searchParams.get('transmission') || ''
    const bodyType = searchParams.get('bodyType') || ''
    const driveType = searchParams.get('driveType') || ''
    const steering = searchParams.get('steering') || ''
    const location = searchParams.get('location') || ''
    const minMileage = searchParams.get('minMileage') || ''
    const maxMileage = searchParams.get('maxMileage') || ''
    const q = searchParams.get('q') || ''

    const filters = {}
    if (make) filters.make = make
    if (model) filters.model = model
    if (q) {
      filters.make = q
      filters.model = q
    }
    if (yearFrom || yearTo) {
      filters.yearFrom = yearFrom
      filters.yearTo = yearTo
    }
    if (minPrice || maxPrice) {
      filters.minPrice = minPrice
      filters.maxPrice = maxPrice
    }
    if (fuelType) filters.fuelType = fuelType
    if (transmission) filters.transmission = transmission
    if (bodyType) filters.bodyType = bodyType
    if (driveType) filters.driveType = driveType
    if (steering) filters.steering = steering
    if (location) filters.location = location

    const result = await getPublicVehicles({ page, limit, sort, filters })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Public vehicles API error:', error)
    return NextResponse.json({ message: 'Error fetching vehicles' }, { status: 500 })
  }
}
