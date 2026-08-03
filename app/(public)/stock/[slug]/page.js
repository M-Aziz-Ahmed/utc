import { cache } from 'react'
import Link from 'next/link'
import VehicleDetailContent from '@/components/public/VehicleDetailContent'
import { getPublicVehicleById, getPublicVehicleBySlug } from '@/utils/publicVehicleService'

const getVehicle = cache(async (slug) => {
  const byId = await getPublicVehicleById(slug)
  if (byId) return byId
  return getPublicVehicleBySlug(slug)
})

export async function generateMetadata({ params }) {
  const { slug } = await params
  const vehicle = await getVehicle(slug)

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found',
      description: 'The requested vehicle could not be found.',
    }
  }

  const price = vehicle.price ? `$${parseFloat(vehicle.price).toLocaleString()}` : 'Price on Request'

  return {
    title: `${vehicle.title} - ${price}`,
    description: `Buy ${vehicle.title} - ${vehicle.mileage ? `${parseFloat(vehicle.mileage).toLocaleString()} km` : ''} ${vehicle.fuelType || ''} ${vehicle.transmission || ''}. ${price}. Available for worldwide export from Japan.`,
    openGraph: {
      title: `${vehicle.title} - ${price}`,
      description: `Buy ${vehicle.title} from UTC. Quality Japanese vehicle export.`,
      images: vehicle.mainImage ? [vehicle.mainImage] : [],
      type: 'website',
    },
  }
}

export default async function VehicleDetailPage({ params }) {
  const { slug } = await params
  const vehicle = await getVehicle(slug)

  if (!vehicle) {
    return (
      <div className="vehicle-detail-page">
        <div className="utc-container">
          <div className="breadcrumb" style={{ marginBottom: 24 }}>
            <Link href="/">Home</Link>
            <span className="separator">&#8250;</span>
            <Link href="/stock">Stock</Link>
            <span className="separator">&#8250;</span>
            <span className="current">Not Found</span>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">&#128533;</div>
            <h3>Vehicle Not Found</h3>
            <p>The vehicle you are looking for does not exist or has been removed.</p>
            <Link href="/stock">
              <button className="btn-primary" style={{ marginTop: 16 }}>Browse Our Stock</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <VehicleDetailContent vehicle={vehicle} />
}
