import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import CursorSpotlight from '../components/cursor-spotlight'

export const metadata: Metadata = {
  title: 'Gohype',
  description: 'Created by Gohype',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <CursorSpotlight />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
