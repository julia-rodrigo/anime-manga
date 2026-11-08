import { useEffect, useState } from 'react'

export function Loader() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-2 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-fuchsia-400" />
      {slow ? (
        <p className="text-xs text-white/40">
          Still working — Jikan's free API can be slow or rate-limited.
        </p>
      ) : null}
    </div>
  )
}
