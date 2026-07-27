import { NextResponse } from 'next/server'

const SHIPPING_RATES = {
  default: { roro: 1200, container: 2500, insurance: 150 },
  'Kenya': { roro: 1400, container: 2800, insurance: 180 },
  'Tanzania': { roro: 1350, container: 2700, insurance: 170 },
  'Uganda': { roro: 1500, container: 3000, insurance: 200 },
  'Nigeria': { roro: 1600, container: 3200, insurance: 210 },
  'South Africa': { roro: 1800, container: 3500, insurance: 230 },
  'UK': { roro: 1500, container: 3000, insurance: 200 },
  'Australia': { roro: 1700, container: 3300, insurance: 220 },
  'New Zealand': { roro: 1800, container: 3500, insurance: 230 },
  'USA': { roro: 2000, container: 4000, insurance: 250 },
  'Canada': { roro: 1900, container: 3800, insurance: 240 },
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { country, method, vehiclePrice } = body

    if (!country) {
      return NextResponse.json({ message: 'Country is required' }, { status: 400 })
    }

    const rates = SHIPPING_RATES[country] || SHIPPING_RATES.default
    const shippingCost = rates[method] || rates.roro
    const insurance = rates.insurance
    const total = (parseFloat(vehiclePrice) || 0) + shippingCost + insurance

    return NextResponse.json({
      country,
      method: method || 'roro',
      vehiclePrice: parseFloat(vehiclePrice) || 0,
      shippingCost,
      insurance,
      estimatedTotal: total,
      estimatedDays: method === 'container' ? '30-45' : '20-35',
    }, { status: 200 })
  } catch (error) {
    console.error('Shipping calculator error:', error)
    return NextResponse.json({ message: 'Error calculating shipping' }, { status: 500 })
  }
}
