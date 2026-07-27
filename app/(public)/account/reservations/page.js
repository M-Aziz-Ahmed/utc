export default function ReservationsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>My Reservations</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>Track your vehicle reservations.</p>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Vehicle</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No reservations yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
