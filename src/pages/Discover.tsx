import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { ErrorRetry } from '../components/ErrorRetry'
import { Loader } from '../components/Loader'
import { jikan, type AnimeEntry, type MangaEntry } from '../lib/jikan'

type RowState<T> = { status: 'loading' | 'error' | 'ready'; items: T[] }

export function Discover() {
  const [season, setSeason] = useState<RowState<AnimeEntry>>({
    status: 'loading',
    items: [],
  })
  const [topAnime, setTopAnime] = useState<RowState<AnimeEntry>>({
    status: 'loading',
    items: [],
  })
  const [topManga, setTopManga] = useState<RowState<MangaEntry>>({
    status: 'loading',
    items: [],
  })

  const loadSeason = useCallback(() => {
    setSeason({ status: 'loading', items: [] })
    jikan
      .seasonNow()
      .then((r) => setSeason({ status: 'ready', items: r.data.slice(0, 12) }))
      .catch(() => setSeason({ status: 'error', items: [] }))
  }, [])

  const loadTopAnime = useCallback(() => {
    setTopAnime({ status: 'loading', items: [] })
    jikan
      .topAnime()
      .then((r) => setTopAnime({ status: 'ready', items: r.data.slice(0, 12) }))
      .catch(() => setTopAnime({ status: 'error', items: [] }))
  }, [])

  const loadTopManga = useCallback(() => {
    setTopManga({ status: 'loading', items: [] })
    jikan
      .topManga()
      .then((r) => setTopManga({ status: 'ready', items: r.data.slice(0, 12) }))
      .catch(() => setTopManga({ status: 'error', items: [] }))
  }, [])

  useEffect(() => {
    loadSeason()
    loadTopAnime()
    loadTopManga()
  }, [loadSeason, loadTopAnime, loadTopManga])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-12 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-transparent to-indigo-500/15 p-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Discover anime &amp; manga
        </h1>
        <p className="mt-2 max-w-xl text-white/60">
          Browse trending series, dig through genres, and head to the Media Lab
          to practice dubbing and karaoke-style sing-alongs over your own clips.
        </p>
      </section>

      <Row title="This season" state={season} kind="anime" onRetry={loadSeason} />
      <Row title="Top anime" state={topAnime} kind="anime" onRetry={loadTopAnime} />
      <Row title="Top manga" state={topManga} kind="manga" onRetry={loadTopManga} />
    </div>
  )
}

function Row<T extends AnimeEntry | MangaEntry>({
  title,
  state,
  kind,
  onRetry,
}: {
  title: string
  state: RowState<T>
  kind: 'anime' | 'manga'
  onRetry: () => void
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-semibold text-white">{title}</h2>
      {state.status === 'loading' ? (
        <Loader />
      ) : state.status === 'error' ? (
        <ErrorRetry message="Couldn't load this from Jikan right now." onRetry={onRetry} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {state.items.map((it) => (
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
    </section>
  )
}
