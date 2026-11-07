export interface Cue {
  start: number
  end: number
  text: string
}

function toSeconds(h: string, m: string, s: string, ms: string) {
  return (
    Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms.padEnd(3, '0')) / 1000
  )
}

const SRT_TIME = /(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})/

/** Parses a subset of SRT/WebVTT: timed text cues, ignoring styling. */
export function parseSubtitles(raw: string): Cue[] {
  const lines = raw.replace(/\r/g, '').split('\n')
  const cues: Cue[] = []
  let i = 0
  while (i < lines.length) {
    const match = SRT_TIME.exec(lines[i])
    if (match) {
      const start = toSeconds(match[1], match[2], match[3], match[4])
      const end = toSeconds(match[5], match[6], match[7], match[8])
      i++
      const textLines: string[] = []
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i])
        i++
      }
      cues.push({ start, end, text: textLines.join(' ').replace(/<[^>]+>/g, '') })
    }
    i++
  }
  return cues
}

export function activeCue(cues: Cue[], t: number) {
  return cues.find((c) => t >= c.start && t <= c.end) ?? null
}

/** Fraction (0-1) of a cue elapsed, for proportional word-by-word highlighting. */
export function cueProgress(cue: Cue, t: number) {
  if (cue.end <= cue.start) return 1
  return Math.min(1, Math.max(0, (t - cue.start) / (cue.end - cue.start)))
}
