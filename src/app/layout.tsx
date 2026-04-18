import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stok Takip',
  description: 'Depo raf stok takip uygulaması',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gray-100 min-h-screen antialiased">{children}</body>
    </html>
  )
}
