import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorRetry } from '../components/ErrorRetry'
import { GenreChip } from '../components/GenreChip'
import { Loader } from '../components/Loader'
import { WatchSection } from '../components/WatchSection'
import { fetchEntry, fetchThemes, type Themes } from '../lib/api'
import { useAsync } from '../lib/useAsync'

export function Detail() {
  const { id } = useParams()
  const entry = useAsync(() => fetchEntry(Number(id)), [id])
  const [themes, setThemes] = useState<Themes | null>(null)

  const data = entry.data
  useEffect(() => {
    setThemes(null)
    if (!data || data.kind !== 'anime' || !data.idMal) return
    let cancelled = false
    fetchThemes(data.idMal).then((t) => {
      if (!cancelled) setThemes(t)
    })
    return () => {
      cancelled = true
    }
  }, [data])

  if (entry.status === 'loading') return <Loader />
  if (entry.status === 'error') {
    return <ErrorRetry message="Couldn't load this title. Check your connection." onRetry={entry.reload} />
  }

  const e = entry.data
  const facts = [
    e.format,
    e.status,
    e.year ? String(e.year) : null,
    e.episodes ? `${e.episodes} episodes` : null,
    e.chapters ? `${e.chapters} chapters` : null,
    e.volumes ? `${e.volumes} volumes` : null,
  ].filter(Boolean)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <img
          src={e.coverLarge}
          alt={e.title}
          className="mx-auto w-48 shrink-0 self-start rounded-xl object-cover sm:mx-0 sm:w-56"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{e.title}</h1>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-white/60">
            {e.score ? <span className="text-amber-300">★ {e.score.toFixed(1)}</span> : null}
            {facts.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {e.genres.map((g) => (
              <GenreChip key={g} name={g} kind={e.kind} />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 whitespace-pre-line text-white/80">
        {e.description || 'No synopsis available.'}
      </p>

      <WatchSection entry={e} />

      {themes && (themes.openings.length || themes.endings.length) ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-lg font-semibold text-white">Theme songs</h2>
          <ThemeList label="Openings" items={themes.openings} />
          <ThemeList label="Endings" items={themes.endings} />
          <p className="mt-3 text-xs text-white/40">
            Titles &amp; artists only — head to the Media Lab to sing or dub
            along with your own audio.
          </p>
        </div>
      ) : null}
    </div>
  )
}

function ThemeList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="mb-2">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <ul className="text-sm text-white/70">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  )
}
