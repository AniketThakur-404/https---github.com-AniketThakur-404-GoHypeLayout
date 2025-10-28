// components/GtagPageView.tsx
'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export default function GtagPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevUrlRef = useRef<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined') return

    const search = searchParams?.toString()
    const url = pathname + (search ? `?${search}` : '')

    // avoid duplicate fires if effect re-runs with the same url
    if (prevUrlRef.current === url) return
    prevUrlRef.current = url

    // debounce one tick to coalesce rapid updates
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      window.gtag?.('config', GA_ID, {
        page_path: url,
        page_title: typeof document !== 'undefined' ? document.title : undefined,
      })
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[gtag] page_view', { id: GA_ID, url })
      }
    }, 0)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [pathname, searchParams])

  return null
}
