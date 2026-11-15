import { entryMeta, type Entry } from '../lib/api'
import { Card } from './Card'

export function EntryGrid({ items }: { items: Entry[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((it) => (
        <Card
          key={it.id}
          to={`/${it.kind}/${it.id}`}
          image={it.cover}
          title={it.title}
          meta={entryMeta(it)}
          score={it.score}
        />
      ))}
    </div>
  )
}
