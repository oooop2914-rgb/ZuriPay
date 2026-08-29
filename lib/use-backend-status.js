// lib/use-backend-status.js
import { useEffect, useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export function useBackendStatus() {
  const [online, setOnline] = useState(null) // null = belum dicek

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(4000) })
        if (mounted) setOnline(res.ok)
      } catch {
        if (mounted) setOnline(false)
      }
    }

    check()
    const interval = setInterval(check, 15000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return online
}
