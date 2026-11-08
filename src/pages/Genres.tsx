import { useEffect, useState } from 'react'
import { ErrorRetry } from '../components/ErrorRetry'
import { GenreChip } from '../components/GenreChip'
import { Loader } from '../components/Loader'
import { jikan, type JikanGenre } from '../lib/jikan'

type Status = 'loading' | 'error' | 'ready'

export function Genres() {
  const [animeStatus, setAnimeStatus] = useState<Status>('loading')
  const [animeGenres, setAnimeGenres] = useState<JikanGenre[]>([])
  const [mangaStatus, setMangaStatus] = useState<Status>('loading')
  const [mangaGenres, setMangaGenres] = useState<JikanGenre[]>([])

  function loadAnimeGenres() {
    setAnimeStatus('loading')
    jikan
      .animeGenres()
      .then((r) => {
        setAnimeGenres(r.data)
        setAnimeStatus('ready')
      })
      .catch(() => setAnimeStatus('error'))
  }

  function loadMangaGenres() {
    setMangaStatus('loading')
    jikan
      .mangaGenres()
      .then((r) => {
        setMangaGenres(r.data)
        setMangaStatus('ready')
      })
      .catch(() => setMangaStatus('error'))
  }

  useEffect(() => {
    loadAnimeGenres()
    loadMangaGenres()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Genres</h1>

      <h2 className="mb-3 text-lg font-semibold text-white/80">Anime genres</h2>
      {animeStatus === 'loading' ? (
        <Loader />
      ) : animeStatus === 'error' ? (
        <ErrorRetry
          message="Couldn't load anime genres right now."
          onRetry={loadAnimeGenres}
        />
      ) : (
        <div className="mb-10 flex flex-wrap gap-2">
          {animeGenres.map((g) => (
            <GenreChip key={g.mal_id} id={g.mal_id} name={g.name} kind="anime" />
          ))}
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-white/80">Manga genres</h2>
      {mangaStatus === 'loading' ? (
        <Loader />
      ) : mangaStatus === 'error' ? (
        <ErrorRetry
          message="Couldn't load manga genres right now."
          onRetry={loadMangaGenres}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {mangaGenres.map((g) => (
            <GenreChip key={g.mal_id} id={g.mal_id} name={g.name} kind="manga" />
          ))}
        </div>
      )}
    </div>
  )
}
