import "./globals.css"
import "./public-site.css"

export const metadata = {
  title: {
    default: "Universal Trading Co. - Premium Japanese Vehicle Exports",
    template: "%s | Universal Trading Co."
  },
  description: "Universal Trading Co. (UTC) - Premium Japanese vehicle export company.",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
