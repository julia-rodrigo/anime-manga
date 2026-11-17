import { useState } from 'react'
import type { EntryDetail, Episode, Trailer, WatchLink } from '../lib/api'

export function WatchSection({ entry }: { entry: EntryDetail }) {
  const isAnime = entry.kind === 'anime'
  if (!entry.trailer && entry.links.length === 0 && entry.episodeLinks.length === 0) {
    return (
      <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">
        No official {isAnime ? 'streaming' : 'reading'} links are listed for this title yet.
      </section>
    )
  }

  return (
    <section className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold text-white">{isAnime ? 'Watch' : 'Read'}</h2>
      {entry.trailer ? <TrailerPlayer trailer={entry.trailer} title={entry.title} /> : null}
      {entry.links.length ? (
        <ServiceLinks links={entry.links} label={isAnime ? 'Watch officially on' : 'Read officially on'} />
      ) : null}
      {entry.episodeLinks.length ? <EpisodeList episodes={entry.episodeLinks} /> : null}
    </section>
  )
}

function TrailerPlayer({ trailer, title }: { trailer: Trailer; title: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-white/40">Trailer</p>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe
            src={`${trailer.embedUrl}&autoplay=1`}
            title={`${title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title} trailer`}
            className="group absolute inset-0 h-full w-full"
          >
            {trailer.thumbnail ? (
              <img src={trailer.thumbnail} alt="" className="h-full w-full object-cover opacity-80" />
            ) : null}
            <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500 text-2xl text-white shadow-lg transition-transform group-hover:scale-110">
              ▶
            </span>
          </button>
        )}
      </div>
      <a href={trailer.watchUrl} className="mt-2 inline-block text-xs text-white/50 underline">
        Trailer not playing? Open it in YouTube
      </a>
    </div>
  )
}

function ServiceLinks({ links, label }: { links: WatchLink[]; label: string }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-white/40">{label}</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.url}
            href={l.url}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color ?? '#d946ef' }} />
            {l.site}
            {l.language ? <span className="font-normal text-white/40">{l.language}</span> : null}
          </a>
        ))}
      </div>
    </div>
  )
}

const EPISODES_SHOWN = 12

function EpisodeList({ episodes }: { episodes: Episode[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? episodes : episodes.slice(0, EPISODES_SHOWN)

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-white/40">
        Episodes ({episodes.length}) · opens on {episodes[0].site}
      </p>
      <ul className="space-y-2">
        {visible.map((ep) => (
          <li key={ep.url}>
            <a
              href={ep.url}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 hover:border-fuchsia-400/40"
            >
              <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-white/10">
                {ep.thumbnail ? (
                  <img src={ep.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : null}
                <span className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-xs text-white">
                  ▶
                </span>
              </div>
              <span className="line-clamp-2 text-sm text-white/80">{ep.title}</span>
            </a>
          </li>
        ))}
      </ul>
      {episodes.length > EPISODES_SHOWN ? (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/20"
        >
          {showAll ? 'Show fewer' : `Show all ${episodes.length} episodes`}
        </button>
      ) : null}
    </div>
  )
}
