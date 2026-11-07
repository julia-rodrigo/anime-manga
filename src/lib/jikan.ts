const BASE = 'https://api.jikan.moe/v4'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 800))
      return get<T>(path)
    }
    throw new Error(`Jikan request failed: ${res.status}`)
  }
  const json = await res.json()
  return json as T
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
