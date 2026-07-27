import Link from 'next/link'
import SellCarForm from '@/components/public/SellCarForm'

export const metadata = {
  title: 'Sell Your Car to UTC',
  description: 'Sell your Japanese vehicle through Universal Trading Co. Get a free valuation and secure payment for your car.',
}

const steps = [
  { num: '01', title: 'Submit Details', desc: 'Fill in your vehicle details and contact information using our simple form below.' },
  { num: '02', title: 'Get Valuation', desc: 'Our expert team reviews your submission and provides a competitive market valuation.' },
  { num: '03', title: 'Agree Price', desc: 'We discuss the valuation with you and agree on a fair price that works for both parties.' },
  { num: '04', title: 'Get Paid', desc: 'Once agreed, we arrange payment quickly and handle all export logistics from Japan.' },
]

export default function SellYourCarPage() {
  return (
    <>
      <section className="sell-hero">
        <div className="utc-container">
          <h1>Sell Your Car to UTC</h1>
          <p>
            Looking to sell your Japanese vehicle? Universal Trading Co. makes it easy.
            Get a fair valuation and secure payment with hassle-free export handling.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="utc-container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Simple 4-Step Process</h2>
            <p className="section-desc">From submission to payment, we handle everything so you don&apos;t have to.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#F9FAFB' }}>
        <div className="utc-container">
          <SellCarForm />
        </div>
      </section>

      <section className="cta-banner">
        <div className="utc-container">
          <h2>Questions About Selling Your Car?</h2>
          <p>Our team is ready to help you with any questions about the selling process.</p>
          <Link href="/contact" className="btn-white">Contact Us</Link>
        </div>
      </section>
    </>
  )
}
