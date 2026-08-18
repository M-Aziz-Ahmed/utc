import '../public-site.css'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import { AuthProvider } from '@/components/public/AuthContext'
import SignupModal from '@/components/public/SignupModal'

export const metadata = {
  title: {
    default: 'Universal Trading Co. - Premium Japanese Vehicle Exports',
    template: '%s | Universal Trading Co.'
  },
  description: 'Universal Trading Co. (UTC) - Premium Japanese vehicle export company. Browse our stock of quality Japanese vehicles, auctions, worldwide shipping, and more.',
  keywords: ['Japanese vehicles', 'car export', 'Japan auction', 'vehicle shipping', 'UTC', 'Universal Trading Co', 'used cars Japan', 'JDM'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Universal Trading Co.',
  },
}

export default function PublicLayout({ children }) {
  return (
    <AuthProvider>
      <div className="public-site">
        <PublicHeader />
        <main className="public-main">
          {children}
        </main>
        <PublicFooter />
        <SignupModal />
      </div>
    </AuthProvider>
  )
}
