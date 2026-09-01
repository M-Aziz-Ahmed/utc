'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/stock', label: 'Stock' },
  { href: '/auctions', label: 'Auctions' },
  { href: '/services', label: 'Services' },
  { href: '/shipping', label: 'Shipping' },
  { href: '/about', label: 'About Us' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact Us' },
]

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const run = async () => { setMobileOpen(false) }
    run()
  }, [pathname])

  return (
    <>
      <header className={`utc-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-top">
          <div className="utc-container">
            Premium Japanese Vehicle Exports — Worldwide Shipping Available
          </div>
        </div>
        <div className="header-main">
          <Link href="/" className="logo-section">
            <div className="logo-icon">UTC</div>
            <div className="logo-text">
              <div className="company-name">Universal Trading Co.</div>
              <div className="company-full">Vehicle Export Specialist</div>
            </div>
          </Link>

          <nav className="main-nav">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link href="/sell-your-car" className="btn-sell">Sell Your Car</Link>
            <Link href="/account/wishlist" className="icon-btn" title="Wishlist">
              &#9825;
            </Link>
            <Link href="/account/dashboard" className="icon-btn" title="Account">
              &#128100;
            </Link>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              &#9776;
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="mobile-menu-panel" onClick={e => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <div className="logo-icon" style={{ width: 36, height: 36, fontSize: 14 }}>UTC</div>
            <button className="mobile-menu-close" onClick={() => setMobileOpen(false)}>&#10005;</button>
          </div>
          <nav className="mobile-nav">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-actions">
            <Link href="/sell-your-car" className="btn-primary" style={{ textAlign: 'center' }}>Sell Your Car</Link>
            <Link href="/account/dashboard" className="btn-outline" style={{ textAlign: 'center' }}>My Account</Link>
          </div>
        </div>
      </div>
    </>
  )
}
