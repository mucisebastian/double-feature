import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Initialize Inter font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Double Feature',
  description: 'A daily movie and album guessing game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans min-h-screen bg-white text-black ${inter.className}`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 