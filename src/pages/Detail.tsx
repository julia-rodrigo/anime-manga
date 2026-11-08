import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorRetry } from '../components/ErrorRetry'
import { Loader } from '../components/Loader'
import { jikan, type AnimeEntry, type MangaEntry } from '../lib/jikan'

type Status = 'loading' | 'error' | 'ready'

export function Detail() {
  const { kind, id } = useParams<{ kind: 'anime' | 'manga'; id: string }>()
  const [status, setStatus] = useState<Status>('loading')
  const [entry, setEntry] = useState<AnimeEntry | MangaEntry | null>(null)

  function load() {
    if (!id) return
    setStatus('loading')
    const req = kind === 'manga' ? jikan.mangaById(id) : jikan.animeById(id)
    req
      .then((r) => {
        setEntry(r.data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(load, [kind, id])

  if (status === 'loading') return <Loader />
  if (status === 'error' || !entry) {
    return <ErrorRetry message="Couldn't load this from Jikan right now." onRetry={load} />
  }

  const isAnime = kind === 'anime'
  const anime = entry as AnimeEntry
  const manga = entry as MangaEntry

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <img
          src={entry.images.jpg.large_image_url ?? entry.images.jpg.image_url}
          alt={entry.title}
          className="w-full rounded-xl object-cover sm:w-56"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{entry.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-white/60">
            {entry.score ? <span>★ {entry.score}</span> : null}
            <span>{entry.status}</span>
            {isAnime ? (
              <span>{anime.episodes ?? '?'} episodes</span>
            ) : (
              <span>
                {manga.chapters ?? '?'} chapters · {manga.volumes ?? '?'} volumes
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.genres.map((g) => (
              <span
                key={g.mal_id}
                className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70"
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 whitespace-pre-line text-white/80">
        {entry.synopsis ?? 'No synopsis available.'}
      </p>

      {isAnime && (anime.theme?.openings?.length || anime.theme?.endings?.length) ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-lg font-semibold text-white">Theme songs</h2>
          {anime.theme?.openings?.length ? (
            <div className="mb-2">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Openings
              </p>
              <ul className="text-sm text-white/70">
                {anime.theme.openings.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {anime.theme?.endings?.length ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">
                Endings
              </p>
              <ul className="text-sm text-white/70">
                {anime.theme.endings.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-3 text-xs text-white/40">
            Titles &amp; artists only — head to the Media Lab to sing or dub
            along with your own audio.
          </p>
        </div>
      ) : null}
    </div>
  )
}
