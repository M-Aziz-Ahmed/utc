import Link from 'next/link'
import dbConnect from '@/utils/dbConnection'
import Vehicle from '@/models/Vehicle'
import GatePass from '@/models/GatePass'

export const metadata = {
  title: 'Vehicle Tracking | Universal Trading Co.',
  description: 'Track your vehicle in real time.',
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default async function VehicleTrackPage({ params }) {
  const { vehicleId } = await params

  let vehicle = null
  let gatePasses = []
  try {
    await dbConnect()
    // Accept either the Mongo ObjectId (from QR) or the sequential stock ID (e.g. /track/5)
    const isObjectId = /^[a-f0-9]{24}$/i.test(vehicleId)
    const vehicleQuery = isObjectId ? { _id: vehicleId } : { stockId: parseInt(vehicleId, 10) }
    vehicle = await Vehicle.findOne(vehicleQuery).populate('yard', 'name location').lean()
    const gatePassQuery = vehicle ? (isObjectId ? { vehicle: vehicleId } : { vehicle: vehicle._id }) : { vehicle: vehicleId }
    gatePasses = await GatePass.find(gatePassQuery).populate('yard', 'name location').sort({ createdAt: 1 }).lean()
  } catch (e) {
    vehicle = null
  }

  if (!vehicle) {
    return (
      <div className="vehicle-detail-page">
        <div className="utc-container">
          <div className="empty-state" style={{ paddingTop: 80 }}>
            <div className="empty-state-icon">&#128533;</div>
            <h3>Vehicle Not Found</h3>
            <p>The vehicle you are scanning could not be found.</p>
            <Link href="/">
              <button className="btn-primary" style={{ marginTop: 16 }}>Back to Home</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const title = [vehicle.manufacturer, vehicle.model].filter(Boolean).join(' ') || 'Vehicle'
  const igp = gatePasses.find(g => g.type === 'IGP')
  const ogp = gatePasses.find(g => g.type === 'OGP')

  let status = 'On the Way'
  let statusColor = '#1a73e8'
  let statusBg = '#e8f0fe'
  let statusIcon = '&#128652;'
  let statusNote = 'Vehicle has not arrived at the yard yet.'

  if (vehicle.physicalOut && ogp) {
    status = 'Shipped'
    statusColor = '#7c3aed'
    statusBg = '#ede9fe'
    statusIcon = '&#128666;'
    statusNote = 'Vehicle has been shipped out for export.'
  } else if (vehicle.physicalIn && igp) {
    status = 'In Yard'
    statusColor = '#059669'
    statusBg = '#d1fae5'
    statusIcon = '&#128204;'
    statusNote = 'Vehicle is safely stored in our yard.'
  }

  const yardName = vehicle.yard?.name || igp?.yard?.name || '—'
  const yardLocation = vehicle.yard?.location || igp?.yard?.location || ''
  const gatePassImages = (Array.isArray(vehicle.gatePassImages) ? vehicle.gatePassImages : []).map(img => img?.path).filter(Boolean)

  const timeline = []
  if (igp) {
    timeline.push({
      title: 'Arrived at Yard',
      date: fmtDateTime(igp.date || vehicle.physicalInDate),
      detail: `${igp.gatePassNumber || 'IGP'}${yardName && yardName !== '—' ? ` · ${yardName}${yardLocation ? `, ${yardLocation}` : ''}` : ''}`,
      done: true,
    })
  }
  if (ogp) {
    timeline.push({
      title: 'Shipped for Export',
      date: fmtDateTime(ogp.date || vehicle.physicalOutDate),
      detail: `${ogp.gatePassNumber || 'OGP'}${ogp.containerNumber ? ` · Container ${ogp.containerNumber}` : ''}${ogp.blNumber ? ` · B/L ${ogp.blNumber}` : ''}`,
      done: true,
    })
  }

  return (
    <div className="vehicle-detail-page">
      <div className="utc-container" style={{ maxWidth: 760 }}>
        <div style={{ padding: '32px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#9aa0a6', textTransform: 'uppercase' }}>Universal Trading Co.</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '6px 0 2px' }}>{title}</h1>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Vehicle Tracking{vehicle.stockId ? ` · Stock ${vehicle.stockId}` : ''}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12, background: statusBg, color: statusColor }}>
              <span style={{ fontSize: 24, lineHeight: 1 }} dangerouslySetInnerHTML={{ __html: statusIcon }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{status}</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{statusNote}</div>
              </div>
            </div>
          </div>

          {gatePassImages.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {gatePassImages.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <img src={img} alt={`${title} - photo ${i + 1}`} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 4 }}>Current Location</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{vehicle.physicalOut && ogp ? 'In transit to destination' : (vehicle.physicalIn ? `${yardName}${yardLocation ? ` · ${yardLocation}` : ''}` : 'Not arrived yet')}</div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 4 }}>Last Updated</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{fmtDate(vehicle.updatedAt)}</div>
            </div>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Movement History</h3>
          <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: 8, paddingLeft: 20 }}>
            {timeline.length === 0 && (
              <div style={{ fontSize: 13, color: '#94a3b8', paddingBottom: 8 }}>No movements recorded yet. This vehicle has not been scanned into the yard.</div>
            )}
            {timeline.map((item, i) => (
              <div key={i} style={{ position: 'relative', paddingBottom: 20 }}>
                <div style={{ position: 'absolute', left: -26, top: 4, width: 12, height: 12, borderRadius: '50%', background: item.done ? '#059669' : '#e2e8f0', border: '2px solid #fff', boxShadow: '0 0 0 2px #059669' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.detail}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{item.date}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#9aa0a6' }}>
            This page is updated automatically whenever the vehicle is scanned at one of our yards.
          </div>
        </div>
      </div>
    </div>
  )
}
