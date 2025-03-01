import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import YearValidator from '@/components/YearValidator'

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Double Feature',
  description: 'Guess a movie and album from the same year',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <YearValidator />
      </body>
    </html>
  )
} 