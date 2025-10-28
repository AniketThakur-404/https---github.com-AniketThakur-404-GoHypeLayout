// app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'              // ✅ add this
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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {/* Google Ads tag (gtag.js) – loads after hydration */}
        {GA_ID ? (
          <>
            <Script
              id="gtag-base"
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

            {/* ✅ wrap in Suspense because GtagPageView uses useSearchParams */}
            <Suspense fallback={null}>
              <GtagPageView />
            </Suspense>
          </>
        ) : (
          <Script id="gtag-missing" strategy="afterInteractive">
            {`console.warn('NEXT_PUBLIC_GOOGLE_ADS_ID is not set; gtag not initialized.')`}
          </Script>
        )}

        <CursorSpotlight />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
