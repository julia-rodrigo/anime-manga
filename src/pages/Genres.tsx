import { useEffect, useState } from 'react'
import { GenreChip } from '../components/GenreChip'
import { Loader } from '../components/Loader'
import { jikan, type JikanGenre } from '../lib/jikan'

export function Genres() {
  const [animeGenres, setAnimeGenres] = useState<JikanGenre[] | null>(null)
  const [mangaGenres, setMangaGenres] = useState<JikanGenre[] | null>(null)

  useEffect(() => {
    jikan.animeGenres().then((r) => setAnimeGenres(r.data))
    jikan.mangaGenres().then((r) => setMangaGenres(r.data))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Genres</h1>

      <h2 className="mb-3 text-lg font-semibold text-white/80">Anime genres</h2>
      {animeGenres === null ? (
        <Loader />
      ) : (
        <div className="mb-10 flex flex-wrap gap-2">
          {animeGenres.map((g) => (
            <GenreChip key={g.mal_id} id={g.mal_id} name={g.name} kind="anime" />
          ))}
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-white/80">Manga genres</h2>
      {mangaGenres === null ? (
        <Loader />
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
