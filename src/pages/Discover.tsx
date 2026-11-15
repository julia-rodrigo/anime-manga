import { Link } from 'react-router-dom'
import { EntryGrid } from '../components/EntryGrid'
import { ErrorRetry } from '../components/ErrorRetry'
import { Loader } from '../components/Loader'
import { fetchDiscover, type Entry } from '../lib/api'
import { useAsync } from '../lib/useAsync'

export function Discover() {
  const rows = useAsync(fetchDiscover, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-10 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-transparent to-indigo-500/15 p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Discover anime, manga &amp; light novels
        </h1>
        <p className="mt-2 max-w-xl text-white/60">
          Browse trending series, dig through genres, and head to the Media Lab
          to practice dubbing and karaoke-style sing-alongs over your own clips.
        </p>
      </section>

      {rows.status === 'loading' ? (
        <Loader />
      ) : rows.status === 'error' ? (
        <ErrorRetry message="Couldn't load the catalogue. Check your connection." onRetry={rows.reload} />
      ) : (
        <>
          <Row title="Trending anime" to="/browse/anime" items={rows.data.trending} />
          <Row title="This season" to="/browse/anime" items={rows.data.season} />
          <Row title="Trending manga" to="/browse/manga" items={rows.data.manga} />
          <Row title="Popular light novels" to="/browse/novel" items={rows.data.novels} />
        </>
      )}
    </div>
  )
}

function Row({ title, to, items }: { title: string; to: string; items: Entry[] }) {
  if (items.length === 0) return null
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <Link to={to} className="text-sm text-fuchsia-300 hover:text-fuchsia-200">
          See all
        </Link>
      </div>
      <EntryGrid items={items} />
    </section>
  )
}
