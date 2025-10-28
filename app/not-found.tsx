// app/not-found.tsx
'use client'

import { Suspense } from 'react'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <main className="flex flex-col items-center justify-center h-screen text-center bg-black text-white">
        <h1 className="text-5xl font-bold mb-4">404 – Page Not Found</h1>
        <p className="text-gray-400 mb-6">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition"
        >
          Go Back Home
        </Link>
      </main>
    </Suspense>
  )
}
