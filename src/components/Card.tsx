import { Link } from 'react-router-dom'

export function Card({
  to,
  image,
  title,
  meta,
  score,
}: {
  to: string
  image: string
  title: string
  meta: string
  score: number | null
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-transform hover:-translate-y-1 hover:border-fuchsia-400/40"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-white/10">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {score ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-amber-300">
            ★ {score}
          </span>
        ) : null}
      </div>
      <div className="flex-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs text-white/50">{meta}</p>
      </div>
    </Link>
  )
}
