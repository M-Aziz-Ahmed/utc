'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const sidebarLinks = [
  { href: '/account/dashboard', label: 'Dashboard', icon: '&#9632;' },
  { href: '/account/wishlist', label: 'My Vehicles', icon: '&#9825;' },
  { href: '/account/reservations', label: 'Reservations', icon: '&#9744;' },
  { href: '/account/profile', label: 'My Profile', icon: '&#128100;' },
]

export default function AccountLayout({ children }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="dashboard-layout">
      <aside className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>My Account</h3>
        </div>
        <nav className="dashboard-nav">
          {sidebarLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              <span dangerouslySetInnerHTML={{ __html: link.icon }} />
              {link.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid #e5e7eb', margin: '16px 0', paddingTop: 16 }}>
            <Link href="/" style={{ color: '#6b7280' }}>
              <span dangerouslySetInnerHTML={{ __html: '&#8592;' }} />
              Back to Website
            </Link>
          </div>
        </nav>
      </aside>

      <div className="dashboard-content">
        <button
          className="mobile-filter-btn"
          style={{ marginBottom: 16 }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          &#9776; Menu
        </button>
        {children}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 260px;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s;
            box-shadow: var(--utc-shadow-xl);
          }
          .dashboard-sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
