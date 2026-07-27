import { NextResponse } from 'next/server'
import { getFilterOptions } from '@/utils/publicVehicleService'

export async function GET() {
  try {
    const options = await getFilterOptions()
    return NextResponse.json(options, { status: 200 })
  } catch (error) {
    console.error('Filter options API error:', error)
    return NextResponse.json({ message: 'Error fetching filter options' }, { status: 500 })
  }
}
