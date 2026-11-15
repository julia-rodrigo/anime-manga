import { useState } from 'react'
import { ErrorRetry } from '../components/ErrorRetry'
import { GenreChip } from '../components/GenreChip'
import { Loader } from '../components/Loader'
import { fetchGenres, KIND_LABEL, KINDS, type Kind } from '../lib/api'
import { useAsync } from '../lib/useAsync'

export function Genres() {
  const [kind, setKind] = useState<Kind>('anime')
  const genres = useAsync(fetchGenres, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-white">Genres</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              k === kind ? 'bg-fuchsia-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>

      {genres.status === 'loading' ? (
        <Loader />
      ) : genres.status === 'error' ? (
        <ErrorRetry message="Couldn't load genres. Check your connection." onRetry={genres.reload} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {genres.data.map((g) => (
            <GenreChip key={g} name={g} kind={kind} />
          ))}
        </div>
      )}
    </div>
  )
}
