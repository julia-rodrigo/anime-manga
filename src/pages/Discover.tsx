import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { Loader } from '../components/Loader'
import { jikan, type AnimeEntry, type MangaEntry } from '../lib/jikan'

export function Discover() {
  const [season, setSeason] = useState<AnimeEntry[] | null>(null)
  const [topAnime, setTopAnime] = useState<AnimeEntry[] | null>(null)
  const [topManga, setTopManga] = useState<MangaEntry[] | null>(null)

  useEffect(() => {
    jikan.seasonNow().then((r) => setSeason(r.data.slice(0, 12)))
    jikan.topAnime().then((r) => setTopAnime(r.data.slice(0, 12)))
    jikan.topManga().then((r) => setTopManga(r.data.slice(0, 12)))
  }, [])

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

      <Row title="This season" items={season} kind="anime" />
      <Row title="Top anime" items={topAnime} kind="anime" />
      <Row title="Top manga" items={topManga} kind="manga" />
    </div>
  )
}

function Row({
  title,
  items,
  kind,
}: {
  title: string
  items: (AnimeEntry | MangaEntry)[] | null
  kind: 'anime' | 'manga'
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-semibold text-white">{title}</h2>
      {items === null ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((it) => (
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
