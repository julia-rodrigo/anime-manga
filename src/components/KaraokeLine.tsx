export function KaraokeLine({ text, progress }: { text: string; progress: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  const litCount = Math.floor(progress * words.length)

  return (
    <p className="text-center text-xl font-semibold leading-relaxed sm:text-2xl">
      {words.map((w, i) => (
        <span
          key={i}
          className={
            i < litCount
              ? 'text-fuchsia-300'
              : i === litCount
                ? 'text-white'
                : 'text-white/30'
          }
        >
          {w}{' '}
        </span>
      ))}
    </p>
  )
}
