export function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-white/50">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-full bg-fuchsia-500/20 px-4 py-1.5 text-sm font-semibold text-fuchsia-300 hover:bg-fuchsia-500/30"
      >
        Retry
      </button>
    </div>
  )
}
