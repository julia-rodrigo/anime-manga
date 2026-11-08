import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { ErrorRetry } from '../components/ErrorRetry'
import { Loader } from '../components/Loader'
import { jikan, type AnimeEntry, type MangaEntry } from '../lib/jikan'

type Status = 'loading' | 'error' | 'ready'

export function Browse() {
  const { kind } = useParams<{ kind: 'anime' | 'manga' }>()
  const [params] = useSearchParams()
  const genre = params.get('genre')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('loading')
  const [results, setResults] = useState<(AnimeEntry | MangaEntry)[]>([])
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    const genreId = genre ? Number(genre) : undefined
    const req =
      kind === 'manga'
        ? jikan.searchManga(query, genreId)
        : jikan.searchAnime(query, genreId)

    // Debounce typed queries so we don't hammer the rate-limited API on
    // every keystroke.
    const delay = query ? 400 : 0
    const timer = setTimeout(() => {
      req
        .then((r) => {
          if (cancelled) return
          setResults(r.data)
          setStatus('ready')
        })
        .catch(() => {
          if (cancelled) return
          setStatus('error')
        })
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [kind, query, genre, reloadTick])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold capitalize text-white">
        Browse {kind}
      </h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${kind}...`}
        className="mb-6 w-full max-w-md rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-fuchsia-400 focus:outline-none"
      />
      {status === 'loading' ? (
        <Loader />
      ) : status === 'error' ? (
        <ErrorRetry
          message="Couldn't load this from Jikan right now."
          onRetry={() => setReloadTick((t) => t + 1)}
        />
      ) : results.length === 0 ? (
        <p className="text-white/50">No results.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((it) => (
            <Card
              key={it.mal_id}
              to={`/${kind}/${it.mal_id}`}
              image={it.images.jpg.large_image_url ?? it.images.jpg.image_url}
              title={it.title}
              meta={
                kind === 'anime'
                  ? `${(it as AnimeEntry).episodes ?? '?'} eps`
                  : `${(it as MangaEntry).chapters ?? '?'} ch`
              }
              score={it.score}
            />
          ))}
        </div>
      )}
    </div>
  )
}
