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
      <div className="mx-auto max-w-6xl px-4 py-3">
        <span className="block text-lg font-bold tracking-tight text-white">
          anime<span className="text-fuchsia-400">manga</span>
        </span>
        <nav className="-mx-4 mt-2 flex gap-1 overflow-x-auto px-4 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-0">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 transition-colors ${
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
