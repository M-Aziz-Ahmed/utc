import Link from 'next/link'

const gradingScale = [
  { grade: 'S', condition: 'Superior', desc: 'Brand new condition, virtually no defects. Less than 12 months old.' },
  { grade: '6', condition: 'Excellent', desc: 'Excellent condition with minimal wear. Very well maintained.' },
  { grade: '5', condition: 'Very Good', desc: 'Minor scratches or dents. Overall very presentable.' },
  { grade: '4.5', condition: 'Good Plus', desc: 'Slight wear but mechanically sound. Popular choice for exports.' },
  { grade: '4', condition: 'Good', desc: 'Normal wear for age. Good condition inside and out.' },
  { grade: '3.5', condition: 'Fair Plus', desc: 'Above average wear. May need minor cosmetic work.' },
  { grade: '3', condition: 'Fair', desc: 'Average condition. Mechanically functional with cosmetic issues.' },
  { grade: '2', condition: 'Below Average', desc: 'Significant wear. Budget option, may need repairs.' },
  { grade: '1', condition: 'Poor', desc: 'Rough condition. Sold mainly for parts or major restoration.' },
]

const auctionSteps = [
  {
    num: '01',
    title: 'Browse Auctions',
    desc: 'Access Japan\'s top auctions including USS, TAA, JU, and CAA. Browse thousands of vehicles with detailed inspection reports and grade ratings.',
  },
  {
    num: '02',
    title: 'UTC Bids',
    desc: 'Once you find a vehicle, our experienced bidding team places competitive bids on your behalf. We leverage our established relationships and volume to secure the best prices.',
  },
  {
    num: '03',
    title: 'Quality Inspection',
    desc: 'Every purchased vehicle undergoes a thorough multi-point inspection at our yard in Japan. We verify condition, document any issues, and ensure it matches auction descriptions.',
  },
  {
    num: '04',
    title: 'Export Process',
    desc: 'We handle all export documentation, customs clearance, and shipping arrangements. From payment to port delivery, we manage every detail of the export process.',
  },
]

export const metadata = {
  title: 'Japanese Vehicle Auctions',
  description: 'Learn how UTC provides direct access to Japanese vehicle auctions. Browse, bid, and buy quality graded vehicles from USS, TAA, JU, and more.',
}

export default function AuctionsPage() {
  return (
    <>
      <div className="page-header">
        <div className="utc-container">
          <h1>Japanese Vehicle Auctions</h1>
          <p>Direct access to Japan&apos;s largest and most trusted vehicle auctions</p>
        </div>
      </div>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid">
            <div className="info-content">
              <h2>How Japanese Auctions Work</h2>
              <p>
                Japan operates the world&apos;s largest and most efficient used vehicle auction system.
                Every week, hundreds of thousands of vehicles pass through over 100 auction houses
                across the country. These auctions are not open to the public — only licensed dealers
                with certified membership can participate.
              </p>
              <p>
                As a licensed auction member, UTC gives you direct access to this exclusive marketplace.
                Vehicles are professionally inspected, graded, and photographed before each auction,
                providing complete transparency on condition, mileage, and history.
              </p>
              <p>
                Major auction houses include USS (United Used Cars), TAA (Tokyo Auto Auctions),
                JU (Japan Auto Auction), CAA (Chubu Auto Auctions), and HAA (Hanshin Auto Auctions).
                Each operates on a weekly or bi-weekly schedule, ensuring a constant flow of vehicles.
              </p>
            </div>
            <div className="info-image" style={{ background: 'var(--utc-gray-100)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--utc-gray-400)', fontSize: 48 }}>
              &#127751;
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid reverse">
            <div className="info-content">
              <h2>The Auction Grading System</h2>
              <p>
                Every vehicle at a Japanese auction receives a condition grade from 1 to 6,
                plus an &quot;S&quot; grade for brand new vehicles. This system provides a standardized
                assessment so buyers know exactly what they&apos;re getting before purchase.
              </p>
              <p>
                The grade reflects the overall exterior, interior, and mechanical condition.
                An interior sub-grade (A, B, or C) is also assigned to describe the cabin condition.
                Higher grades indicate better condition and typically command higher prices.
              </p>
            </div>
            <div style={{ background: 'white', borderRadius: 'var(--utc-radius-lg)', border: '1px solid var(--utc-gray-200)', padding: 24, maxHeight: 400, overflowY: 'auto' }}>
              {gradingScale.map((g) => (
                <div key={g.grade} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--utc-gray-100)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--utc-radius)', background: 'var(--utc-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                    {g.grade}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--utc-gray-900)' }}>{g.condition}</div>
                    <div style={{ fontSize: 13, color: 'var(--utc-gray-500)', lineHeight: 1.5 }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid">
            <div className="info-content">
              <h2>How UTC Purchases from Auctions</h2>
              <p>
                UTC maintains active memberships with all major Japanese auction houses. Our licensed
                buyers attend auctions daily, both in-person and through online bidding platforms.
                This dual approach ensures we can bid on vehicles regardless of auction location.
              </p>
              <p>
                Before bidding, we provide our clients with complete auction sheets, translated inspection
                reports, and professional photographs. We advise on fair market value and recommended
                bidding limits based on current market conditions and vehicle condition.
              </p>
              <p>
                Once a bid is won, the vehicle is immediately secured and transported to our preparation
                facility. Our team handles payment coordination, documentation, and prepares the vehicle
                for export — all within days of the auction date.
              </p>
            </div>
            <div className="info-image" style={{ background: 'var(--utc-gray-100)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--utc-gray-400)', fontSize: 48 }}>
              &#128176;
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="utc-container">
          <div className="info-grid reverse">
            <div className="info-content">
              <h2>Our Inspection Process</h2>
              <p>
                After winning an auction, every vehicle passes through our rigorous multi-point
                inspection process at our Japan facility. This goes beyond the auction inspection
                to give you complete confidence in your purchase.
              </p>
              <p>
                Our inspection covers engine and transmission performance, electrical systems,
                undercarriage condition, body panel integrity, interior condition, and safety
                features. We document everything with detailed photographs and reports.
              </p>
              <p>
                If any issues are discovered, we inform you immediately and can arrange repairs
                before export or adjust pricing accordingly. Transparency is the foundation of
                our business — we want you to know exactly what you&apos;re receiving.
              </p>
            </div>
            <div className="info-image" style={{ background: 'var(--utc-gray-100)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--utc-gray-400)', fontSize: 48 }}>
              &#128269;
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">The Process</span>
            <h2 className="section-title">From Auction to Delivery</h2>
            <p className="section-desc">A streamlined four-step process to get your vehicle from Japan to your door.</p>
          </div>
          <div className="steps-grid">
            {auctionSteps.map((step) => (
              <div className="step-card" key={step.num}>
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="utc-container">
          <h2>Ready to Buy from Auction?</h2>
          <p>Get access to thousands of quality Japanese vehicles. Let UTC find your perfect match.</p>
          <Link href="/contact" className="btn-white">Get in Touch</Link>
        </div>
      </section>
    </>
  )
}
