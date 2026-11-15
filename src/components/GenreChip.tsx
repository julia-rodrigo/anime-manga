import { Link } from 'react-router-dom'
import type { Kind } from '../lib/api'

export function GenreChip({ name, kind }: { name: string; kind: Kind }) {
  return (
    <Link
      to={`/browse/${kind}?genre=${encodeURIComponent(name)}`}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition-colors hover:border-fuchsia-400/50 hover:bg-fuchsia-500/10 hover:text-fuchsia-300"
    >
      {name}
    </Link>
  )
}
