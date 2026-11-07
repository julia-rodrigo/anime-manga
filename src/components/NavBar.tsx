import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Discover' },
  { to: '/browse/anime', label: 'Anime' },
  { to: '/browse/manga', label: 'Manga' },
  { to: '/genres', label: 'Genres' },
  { to: '/media-lab', label: 'Media Lab' },
]

export function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b10]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <span className="text-lg font-bold tracking-tight text-white">
          anime<span className="text-fuchsia-400">manga</span>
        </span>
        <nav className="flex gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 transition-colors ${
                  isActive
                    ? 'bg-fuchsia-500/20 text-fuchsia-300'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
