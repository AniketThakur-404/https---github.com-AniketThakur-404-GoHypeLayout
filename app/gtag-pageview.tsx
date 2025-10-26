'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

export default function GtagPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_ID) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    // Fire a page_view on route change
    // @ts-ignore - gtag exists after the Script loads
    window.gtag?.('config', GA_ID, { page_path: url })
  }, [pathname, searchParams])

  return null
}
