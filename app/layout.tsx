import type { Metadata } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import CursorSpotlight from '../components/cursor-spotlight'
import GtagPageView from './gtag-pageview'
export const metadata: Metadata = {
  title: 'Gohype',
  description: 'Created by Gohype',
  generator: '',
}

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        
        // ...
        <GtagPageView />

        {/* Google tag (gtag.js) – loads after hydration */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>

        <CursorSpotlight />
        {children}
        <Analytics />
      </body>
    </html>
  )
}