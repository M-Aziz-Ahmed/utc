export default function AccountDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Dashboard</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>Welcome back! Here&apos;s an overview of your account.</p>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>&#9825;</div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-label">Wishlist Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>&#9744;</div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-label">Reservations</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#DCfce7', color: '#16A34A' }}>&#9993;</div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-label">Inquiries</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>&#128666;</div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-label">Vehicles in Transit</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
          <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', padding: 40 }}>No recent activity</p>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="/stock" className="btn-primary" style={{ textAlign: 'center', fontSize: 13, padding: '10px 16px' }}>Browse Stock</a>
            <a href="/contact" className="btn-outline" style={{ textAlign: 'center', fontSize: 13, padding: '10px 16px' }}>Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  )
}
