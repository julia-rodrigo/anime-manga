const BASE = 'https://api.jikan.moe/v4'

// Jikan's public API enforces a strict rate limit (~3 req/s, 60 req/min).
// Firing requests in parallel trips it immediately, so every call is funneled
// through a single queue with spacing between requests.
let queue: Promise<unknown> = Promise.resolve()
const MIN_GAP_MS = 400

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const result = await task()
    await new Promise((r) => setTimeout(r, MIN_GAP_MS))
    return result
  })
  // Swallow so one failed task doesn't poison the chain for later callers.
  queue = run.catch(() => undefined)
  return run
}

async function fetchOnce<T>(path: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${BASE}${path}`, { signal: controller.signal })
    if (!res.ok) {
      throw new Error(`Jikan request failed: ${res.status}`)
    }
    return (await res.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

async function get<T>(path: string): Promise<T> {
  return enqueue(async () => {
    const maxAttempts = 5
    let lastError: unknown
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fetchOnce<T>(path)
      } catch (err) {
        lastError = err
        const isRateLimited = err instanceof Error && err.message.includes('429')
        if (!isRateLimited && !(err instanceof Error && err.message === 'Failed to fetch')) {
          throw err
        }
        await new Promise((r) => setTimeout(r, 600 * 2 ** attempt))
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Jikan request failed')
  })
}

export interface JikanImage {
  image_url: string
  large_image_url?: string
}

export interface JikanGenre {
  mal_id: number
  name: string
}

export interface JikanTheme {
  openings?: string[]
  endings?: string[]
}

export interface AnimeEntry {
  mal_id: number
  title: string
  synopsis: string | null
  score: number | null
  episodes: number | null
  status: string | null
  year: number | null
  images: { jpg: JikanImage }
  genres: JikanGenre[]
  theme?: JikanTheme
  type: string | null
}

export interface MangaEntry {
  mal_id: number
  title: string
  synopsis: string | null
  score: number | null
  chapters: number | null
  volumes: number | null
  status: string | null
  images: { jpg: JikanImage }
  genres: JikanGenre[]
  type: string | null
}

interface Paginated<T> {
  data: T[]
}

interface Single<T> {
  data: T
}

export const jikan = {
  topAnime: (page = 1) => get<Paginated<AnimeEntry>>(`/top/anime?page=${page}`),
  topManga: (page = 1) => get<Paginated<MangaEntry>>(`/top/manga?page=${page}`),
  seasonNow: () => get<Paginated<AnimeEntry>>('/seasons/now'),
  searchAnime: (q: string, genre?: number, page = 1) =>
    get<Paginated<AnimeEntry>>(
      `/anime?q=${encodeURIComponent(q)}${genre ? `&genres=${genre}` : ''}&page=${page}&order_by=popularity&sort=asc`,
    ),
  searchManga: (q: string, genre?: number, page = 1) =>
    get<Paginated<MangaEntry>>(
      `/manga?q=${encodeURIComponent(q)}${genre ? `&genres=${genre}` : ''}&page=${page}&order_by=popularity&sort=asc`,
    ),
  animeGenres: () => get<Paginated<JikanGenre>>('/genres/anime'),
  mangaGenres: () => get<Paginated<JikanGenre>>('/genres/manga'),
  animeById: (id: string | number) => get<Single<AnimeEntry>>(`/anime/${id}/full`),
  mangaById: (id: string | number) => get<Single<MangaEntry>>(`/manga/${id}/full`),
}
