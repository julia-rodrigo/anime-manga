import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { EntryGrid } from '../components/EntryGrid'
import { ErrorRetry } from '../components/ErrorRetry'
import { Loader } from '../components/Loader'
import { fetchList, isKind, KIND_LABEL, type Entry, type Kind } from '../lib/api'
import { useAsync } from '../lib/useAsync'

export function Browse() {
  const { kind } = useParams()
  if (!isKind(kind)) return <Navigate to="/" replace />
  return <BrowseKind key={kind} kind={kind} />
}

function BrowseKind({ kind }: { kind: Kind }) {
  const [params] = useSearchParams()
  const genre = params.get('genre') ?? ''
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 350)
    return () => clearTimeout(t)
  }, [query])

  const first = useAsync(() => fetchList(kind, { search, genre }), [kind, search, genre])

  const [more, setMore] = useState<Entry[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [moreState, setMoreState] = useState<'idle' | 'loading' | 'error'>('idle')

  useEffect(() => {
    setMore([])
    setPage(1)
    setMoreState('idle')
    setHasNext(first.status === 'ready' && first.data.hasNext)
  }, [first.status, first.data])

  function loadMore() {
    setMoreState('loading')
    fetchList(kind, { search, genre, page: page + 1 }).then(
      (next) => {
        setMore((prev) => [...prev, ...next.items])
        setPage((p) => p + 1)
        setHasNext(next.hasNext)
        setMoreState('idle')
      },
      () => setMoreState('error'),
    )
  }

  const label = KIND_LABEL[kind].toLowerCase()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-white">{KIND_LABEL[kind]}</h1>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${label}…`}
          className="w-full max-w-md rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-fuchsia-400 focus:outline-none"
        />
        {genre ? (
          <Link
            to={`/browse/${kind}`}
            className="rounded-full bg-fuchsia-500/20 px-3 py-1.5 text-sm text-fuchsia-300"
          >
            {genre} ✕
          </Link>
        ) : null}
      </div>

      {first.status === 'loading' ? (
        <Loader />
      ) : first.status === 'error' ? (
        <ErrorRetry message={`Couldn't load ${label}. Check your connection.`} onRetry={first.reload} />
      ) : first.data.items.length === 0 ? (
        <p className="text-white/50">No results.</p>
      ) : (
        <>
          <EntryGrid items={[...first.data.items, ...more]} />
          {hasNext ? (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={moreState === 'loading'}
                className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50"
              >
                {moreState === 'loading'
                  ? 'Loading…'
                  : moreState === 'error'
                    ? 'Failed — tap to retry'
                    : 'Load more'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
