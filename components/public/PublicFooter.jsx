import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="utc-footer">
      <div className="utc-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="logo-icon" style={{ width: 48, height: 48, fontSize: 18 }}>UTC</div>
            <p>
              Universal Trading Co. is a premier Japanese vehicle export company,
              delivering quality vehicles worldwide from Japan&apos;s best auctions.
            </p>
            <div className="footer-social">
              <a href="#" title="Facebook">&#102;</a>
              <a href="#" title="Twitter">&#120;</a>
              <a href="#" title="Instagram">&#9673;</a>
              <a href="#" title="YouTube">&#9654;</a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/stock">Browse Stock</Link></li>
              <li><Link href="/auctions">Auctions</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/shipping">Shipping</Link></li>
              <li><Link href="/sell-your-car">Sell Your Car</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/news">News</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/account/dashboard">My Account</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li><Link href="/services">Vehicle Export</Link></li>
              <li><Link href="/shipping">Worldwide Shipping</Link></li>
              <li><Link href="/auctions">Auction Buying</Link></li>
              <li><Link href="/services">Inspection</Link></li>
              <li><Link href="/services">Documentation</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <ul>
              <li style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                  Japan Office<br />
                  Tokyo, Japan
                </span>
              </li>
              <li>
                <a href="mailto:info@universaltrading.co.jp">info@universaltrading.co.jp</a>
              </li>
              <li>
                <a href="tel:+81-3-1234-5678">+81-3-1234-5678</a>
              </li>
              <li>
                <a href="https://wa.me/81901234567" style={{ color: '#25D366' }}>WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Universal Trading Co. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
