import Link from 'next/link'

export const metadata = {
  title: 'News & Updates',
  description: 'Stay up to date with the latest news from Universal Trading Co. - Japanese vehicle export industry updates, market trends, and company announcements.',
}

const articles = [
  {
    id: 1,
    title: 'Japanese Used Car Exports Reach Record High in 2025',
    date: 'January 15, 2026',
    excerpt: 'Japan\'s used car export industry continues to grow, with over 1.7 million vehicles shipped overseas in the past year. Discover which markets are driving demand.',
    image: null,
    category: 'Industry News',
  },
  {
    id: 2,
    title: 'New Emissions Standards: What Exporters Need to Know',
    date: 'January 8, 2026',
    excerpt: 'Upcoming changes to emissions regulations in key import markets are reshaping which vehicles are in demand. Here\'s how UTC is adapting.',
    image: null,
    category: 'Regulations',
  },
  {
    id: 3,
    title: 'Top 5 Reliable SUVs for Export from Japan in 2026',
    date: 'December 28, 2025',
    excerpt: 'From the Toyota Land Cruiser to the Nissan Patrol, these SUVs remain the most sought-after vehicles for overseas buyers. See our top picks.',
    image: null,
    category: 'Vehicle Guides',
  },
  {
    id: 4,
    title: 'UTC Expands Shipping Routes to East Africa',
    date: 'December 15, 2025',
    excerpt: 'We are pleased to announce new direct shipping routes to Kenya, Tanzania, and Mozambique, reducing delivery times by up to two weeks.',
    image: null,
    category: 'Company News',
  },
  {
    id: 5,
    title: 'Understanding Japanese Auction Grades: A Complete Guide',
    date: 'December 1, 2025',
    excerpt: 'Japanese auction grading can be confusing for first-time buyers. Learn what each grade means and how to interpret inspection reports.',
    image: null,
    category: 'Buying Guides',
  },
  {
    id: 6,
    title: 'The Rise of Hybrid and Electric Vehicles in Japan\'s Export Market',
    date: 'November 20, 2025',
    excerpt: 'Hybrid and electric vehicles are gaining popularity in export markets. See which models are leading the charge and why buyers are making the switch.',
    image: null,
    category: 'Market Trends',
  },
]

export default function NewsPage() {
  return (
    <>
      <div className="page-header">
        <div className="utc-container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">&#8250;</span>
            <span className="current">News & Updates</span>
          </div>
          <h1>News & Updates</h1>
          <p>Stay informed with the latest from Universal Trading Co. and the Japanese vehicle export industry</p>
        </div>
      </div>

      <section className="section">
        <div className="utc-container">
          <div className="news-grid">
            {articles.map(article => (
              <article className="news-card" key={article.id}>
                <div className="news-card-image">
                  {article.image ? (
                    <img src={article.image} alt={article.title} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #FEE2E2 0%, #F3F4F6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#DC2626',
                      fontSize: 32,
                      fontWeight: 800,
                    }}>
                      UTC
                    </div>
                  )}
                </div>
                <div className="news-card-body">
                  <div className="news-card-date">
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      borderRadius: 9999,
                      fontSize: 11,
                      fontWeight: 600,
                      marginRight: 8,
                    }}>
                      {article.category}
                    </span>
                    {article.date}
                  </div>
                  <h3 className="news-card-title">{article.title}</h3>
                  <p className="news-card-excerpt">{article.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="utc-container">
          <h2>Want to Learn More?</h2>
          <p>Contact us for the latest information on Japanese vehicle exports and availability.</p>
          <Link href="/contact" className="btn-white">Get in Touch</Link>
        </div>
      </section>
    </>
  )
}
