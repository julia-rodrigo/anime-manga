const ENDPOINT = 'https://graphql.anilist.co'

export type Kind = 'anime' | 'manga' | 'novel'

export const KINDS: Kind[] = ['anime', 'manga', 'novel']

export const KIND_LABEL: Record<Kind, string> = {
  anime: 'Anime',
  manga: 'Manga',
  novel: 'Light novels',
}

export function isKind(value: string | undefined): value is Kind {
  return value === 'anime' || value === 'manga' || value === 'novel'
}

export interface Entry {
  id: number
  idMal: number | null
  kind: Kind
  title: string
  cover: string
  coverLarge: string
  score: number | null
  format: string | null
  status: string | null
  episodes: number | null
  chapters: number | null
  volumes: number | null
  year: number | null
  genres: string[]
  description: string
}

interface RawMedia {
  id: number
  idMal: number | null
  type: 'ANIME' | 'MANGA'
  format: string | null
  status: string | null
  episodes: number | null
  chapters: number | null
  volumes: number | null
  averageScore: number | null
  genres: string[] | null
  title: { english: string | null; romaji: string | null }
  coverImage: { large: string | null; extraLarge: string | null }
  startDate: { year: number | null } | null
  description?: string | null
}

const FIELDS = `
  id idMal type format status episodes chapters volumes averageScore genres
  title { english romaji }
  coverImage { large extraLarge }
  startDate { year }
`

const FORMAT_LABEL: Record<string, string> = {
  TV: 'TV',
  TV_SHORT: 'TV short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
  MANGA: 'Manga',
  NOVEL: 'Light novel',
  ONE_SHOT: 'One-shot',
}

const STATUS_LABEL: Record<string, string> = {
  FINISHED: 'Finished',
  RELEASING: 'Ongoing',
  NOT_YET_RELEASED: 'Upcoming',
  CANCELLED: 'Cancelled',
  HIATUS: 'On hiatus',
}

function cleanDescription(raw: string) {
  return raw
    .replace(/~!.*?!~/gs, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function toEntry(m: RawMedia): Entry {
  const cover = m.coverImage.large ?? m.coverImage.extraLarge ?? ''
  return {
    id: m.id,
    idMal: m.idMal,
    kind: m.type === 'ANIME' ? 'anime' : m.format === 'NOVEL' ? 'novel' : 'manga',
    title: m.title.english ?? m.title.romaji ?? 'Untitled',
    cover,
    coverLarge: m.coverImage.extraLarge ?? cover,
    score: m.averageScore ? m.averageScore / 10 : null,
    format: m.format ? (FORMAT_LABEL[m.format] ?? m.format) : null,
    status: m.status ? (STATUS_LABEL[m.status] ?? m.status) : null,
    episodes: m.episodes,
    chapters: m.chapters,
    volumes: m.volumes,
    year: m.startDate?.year ?? null,
    genres: m.genres ?? [],
    description: m.description ? cleanDescription(m.description) : '',
  }
}

export function entryMeta(e: Entry) {
  if (e.kind === 'anime') return e.episodes ? `${e.episodes} eps` : (e.status ?? 'Anime')
  if (e.chapters) return `${e.chapters} ch`
  if (e.volumes) return `${e.volumes} vol`
  return e.status ?? KIND_LABEL[e.kind]
}

class HttpStatusError extends Error {
  status: number
  constructor(status: number) {
    super(`Request failed: ${status}`)
    this.status = status
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function post<T>(body: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body,
      signal: controller.signal,
    })
    if (!res.ok) throw new HttpStatusError(res.status)
    const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
    if (!json.data) throw new Error(json.errors?.[0]?.message ?? 'Empty response')
    return json.data
  } finally {
    clearTimeout(timeout)
  }
}

// One retry for rate limiting, timeouts and network failures; a real 4xx fails
// at once. Worst case (server hanging) is ~17s before the UI offers Retry.
async function run<T>(body: string): Promise<T> {
  try {
    return await post<T>(body)
  } catch (err) {
    if (err instanceof HttpStatusError && err.status !== 429 && err.status < 500) throw err
    await wait(1000)
    return post<T>(body)
  }
}

const cache = new Map<string, Promise<unknown>>()

function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const body = JSON.stringify({ query, variables })
  const hit = cache.get(body)
  if (hit) return hit as Promise<T>
  const pending = run<T>(body)
  cache.set(body, pending)
  pending.catch(() => cache.delete(body))
  return pending
}

function kindFilter(kind: Kind) {
  if (kind === 'anime') return { type: 'ANIME' }
  if (kind === 'novel') return { type: 'MANGA', format: 'NOVEL' }
  return { type: 'MANGA', formatNot: 'NOVEL' }
}

function currentSeason() {
  const now = new Date()
  const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  return { season: seasons[Math.floor(now.getMonth() / 3)], year: now.getFullYear() }
}

export interface DiscoverRows {
  trending: Entry[]
  season: Entry[]
  manga: Entry[]
  novels: Entry[]
}

export async function fetchDiscover(): Promise<DiscoverRows> {
  const data = await gql<Record<keyof DiscoverRows, { media: RawMedia[] }>>(
    `query ($season: MediaSeason, $year: Int) {
      trending: Page(perPage: 12) { media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${FIELDS} } }
      season: Page(perPage: 12) { media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) { ${FIELDS} } }
      manga: Page(perPage: 12) { media(type: MANGA, format_not: NOVEL, sort: TRENDING_DESC, isAdult: false) { ${FIELDS} } }
      novels: Page(perPage: 12) { media(type: MANGA, format: NOVEL, sort: POPULARITY_DESC, isAdult: false) { ${FIELDS} } }
    }`,
    currentSeason(),
  )
  return {
    trending: data.trending.media.map(toEntry),
    season: data.season.media.map(toEntry),
    manga: data.manga.media.map(toEntry),
    novels: data.novels.media.map(toEntry),
  }
}

export interface ListPage {
  items: Entry[]
  hasNext: boolean
}

export async function fetchList(
  kind: Kind,
  opts: { search?: string; genre?: string; page?: number },
): Promise<ListPage> {
  const search = opts.search?.trim() || undefined
  const data = await gql<{ Page: { pageInfo: { hasNextPage: boolean }; media: RawMedia[] } }>(
    `query ($page: Int, $type: MediaType, $format: MediaFormat, $formatNot: MediaFormat, $search: String, $genre: String, $sort: [MediaSort]) {
      Page(page: $page, perPage: 24) {
        pageInfo { hasNextPage }
        media(type: $type, format: $format, format_not: $formatNot, search: $search, genre: $genre, sort: $sort, isAdult: false) { ${FIELDS} }
      }
    }`,
    {
      ...kindFilter(kind),
      page: opts.page ?? 1,
      search,
      genre: opts.genre || undefined,
      sort: search ? ['SEARCH_MATCH'] : ['POPULARITY_DESC'],
    },
  )
  return { items: data.Page.media.map(toEntry), hasNext: data.Page.pageInfo.hasNextPage }
}

export async function fetchGenres(): Promise<string[]> {
  const data = await gql<{ GenreCollection: string[] }>('{ GenreCollection }')
  return data.GenreCollection.filter((g) => g !== 'Hentai')
}

export async function fetchEntry(id: number): Promise<Entry> {
  const data = await gql<{ Media: RawMedia }>(
    `query ($id: Int) { Media(id: $id) { ${FIELDS} description(asHtml: false) } }`,
    { id },
  )
  return toEntry(data.Media)
}

export interface Themes {
  openings: string[]
  endings: string[]
}

/** Opening/ending song titles are only on Jikan; best-effort, never blocks the page. */
export async function fetchThemes(idMal: number): Promise<Themes | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${idMal}/themes`, {
      signal: controller.signal,
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: Themes }
    return json.data ?? null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
