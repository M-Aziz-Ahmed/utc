import { NextResponse } from 'next/server'
import { getVehicleCount } from '@/utils/publicVehicleService'

export async function GET() {
  try {
    const count = await getVehicleCount()
    return NextResponse.json({ count }, { status: 200 })
  } catch (error) {
    console.error('Vehicle count API error:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
