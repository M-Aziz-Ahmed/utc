import { NextResponse } from 'next/server'
import { getPublicVehicleById } from '@/utils/publicVehicleService'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const vehicle = await getPublicVehicleById(id)

    if (!vehicle) {
      return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })
    }

    return NextResponse.json(vehicle, { status: 200 })
  } catch (error) {
    console.error('Public vehicle detail API error:', error)
    return NextResponse.json({ message: 'Error fetching vehicle' }, { status: 500 })
  }
}
