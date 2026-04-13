import vacanciesJson from './vacancies.json'

export type VacancySourceRow = {
  organization: string
  city: string
  videoLink: string
  address: string
  vacancy: string
  position: string
  vk: string
  website: string
  description: string
  percent: string
  microscope: string
  chiefName: string
  /** Широта (WGS84). Если заданы оба — lat и lng — точка на карте берётся отсюда, иначе — по городу. */
  lat?: number | null
  /** Долгота (WGS84). */
  lng?: number | null
}

export type ClinicRecord = {
  id: number
  /** Категория для фильтров (одна из jobCategories или пусто) */
  jobName: string
  organization: string
  city: string
  address: string
  /** Название вакансии в карточке */
  vacancyTitle: string
  website: string
  vk: string
  description: string
  percent: string
  microscope: string
  chiefName: string
  videoUrl: string
  lat: number
  lng: number
}

const JOB_CATEGORIES = [
  'Врач стоматолог',
  'Средний медицинский персонал',
  'Младший медицинский персонал',
  'Главврач, управляющий',
] as const

/** Приблизительные центры городов для точки на карте, если нет своих координат */
const CITY_COORDS: Record<string, [number, number]> = {
  пермь: [58.0105, 56.2294],
  екатеринбург: [56.8389, 60.6057],
  москва: [55.7558, 37.6173],
  калуга: [54.5293, 36.2754],
  сортавала: [61.7032, 30.6917],
  санктпетербург: [59.9343, 30.3351],
  спб: [59.9343, 30.3351],
}

function stripZWSP(s: string): string {
  return s.replace(/\u200b/g, '').trim()
}

function normalizeCityKey(city: string): string {
  return stripZWSP(city)
    .replace(/^г\.\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function manualCoords(row: VacancySourceRow): [number, number] | null {
  const lat = row.lat
  const lng = row.lng
  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return [lat, lng]
  }
  return null
}

function coordsForCity(city: string, index: number): [number, number] {
  const key = normalizeCityKey(city)
  const base = CITY_COORDS[key]
  const jitter = (i: number) => (i % 7) * 0.0022 - 0.0066
  if (base) {
    return [base[0] + jitter(index), base[1] + jitter(index + 3)]
  }
  return [58.01 + jitter(index), 56.23 + jitter(index + 1)]
}

/** Rutube watch/private → embed для iframe */
export function rutubeToEmbed(url: string): string {
  const u = stripZWSP(url)
  if (!u) return ''
  if (u.includes('/play/embed/')) return u
  const m = u.match(/rutube\.ru\/(?:video\/(?:private\/)?)([a-f0-9]{20,40})/i)
  if (m?.[1]) {
    return `https://rutube.ru/play/embed/${m[1]}`
  }
  return u
}

export function normalizeWebsiteUrl(raw: string): string {
  const s = stripZWSP(raw)
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s.replace(/^\/\//, '')}`
}

function normalizeCategory(raw: string): string {
  const s = stripZWSP(raw)
  if (!s) return ''
  const exact = JOB_CATEGORIES.find((c) => c === s)
  if (exact) return exact
  const lower = s.toLowerCase()
  return JOB_CATEGORIES.find((c) => c.toLowerCase() === lower) ?? ''
}

function isHeaderLine(cols: string[]): boolean {
  const a = stripZWSP(cols[0] ?? '').toLowerCase()
  if (a === 'организация') return true
  if (cols.some((c) => stripZWSP(c).includes('Позиция*'))) return true
  return false
}

export function parseVacanciesTsv(tsv: string): ClinicRecord[] {
  const lines = tsv.split(/\r?\n/).map((l) => l.trimEnd())
  const out: ClinicRecord[] = []
  let id = 0

  for (const line of lines) {
    if (!stripZWSP(line)) continue
    const cols = line.split('\t')
    if (cols.length < 5 || isHeaderLine(cols)) continue

    const organization = stripZWSP(cols[0] ?? '')
    const city = stripZWSP(cols[1] ?? '')
    const rutubeRaw = stripZWSP(cols[2] ?? '')
    const address = stripZWSP(cols[3] ?? '')
    const vacancyTitle = stripZWSP(cols[4] ?? '')
    const positionRaw = stripZWSP(cols[5] ?? '')
    const vk = normalizeWebsiteUrl(stripZWSP(cols[6] ?? ''))
    const website = normalizeWebsiteUrl(stripZWSP(cols[7] ?? ''))
    const description = stripZWSP(cols[8] ?? '')
    const percent = stripZWSP(cols[9] ?? '')
    const microscope = stripZWSP(cols[10] ?? '')
    const chiefName = stripZWSP(cols[11] ?? '')

    const jobName = normalizeCategory(positionRaw)
    const videoUrl = rutubeToEmbed(rutubeRaw)
    const [lat, lng] = coordsForCity(city || 'Пермь', id)

    id += 1
    out.push({
      id,
      jobName,
      organization,
      city,
      address,
      vacancyTitle: vacancyTitle || organization || 'Вакансия',
      website,
      vk,
      description,
      percent,
      microscope,
      chiefName,
      videoUrl,
      lat,
      lng,
    })
  }

  return out
}

/** Редактируйте `vacancies.json` — источник данных для карты и карточек. */
export function parseVacanciesJson(rows: VacancySourceRow[]): ClinicRecord[] {
  return rows.map((row, index) => {
    const organization = stripZWSP(row.organization ?? '')
    const city = stripZWSP(row.city ?? '')
    const address = stripZWSP(row.address ?? '')
    const vacancyTitle = stripZWSP(row.vacancy ?? '')
    const positionRaw = stripZWSP(row.position ?? '')
    const vk = normalizeWebsiteUrl(stripZWSP(row.vk ?? ''))
    const website = normalizeWebsiteUrl(stripZWSP(row.website ?? ''))
    const description = stripZWSP(row.description ?? '')
    const percent = stripZWSP(row.percent ?? '')
    const microscope = stripZWSP(row.microscope ?? '')
    const chiefName = stripZWSP(row.chiefName ?? '')
    const jobName = normalizeCategory(positionRaw)
    const videoUrl = rutubeToEmbed(stripZWSP(row.videoLink ?? ''))
    const fromJson = manualCoords(row)
    const [lat, lng] = fromJson ?? coordsForCity(city || 'Пермь', index)
    return {
      id: index + 1,
      jobName,
      organization,
      city,
      address,
      vacancyTitle: vacancyTitle || organization || 'Вакансия',
      website,
      vk,
      description,
      percent,
      microscope,
      chiefName,
      videoUrl,
      lat,
      lng,
    }
  })
}

export const clinics: ClinicRecord[] = parseVacanciesJson(
  vacanciesJson as VacancySourceRow[],
)
