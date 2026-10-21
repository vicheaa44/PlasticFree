export type LayerId = 'recycling' | 'bulk' | 'water'

export interface Spot {
  id: string
  layer: LayerId
  lat: number
  lon: number
  name?: string
  /** Materials a recycling point takes, e.g. "plastic_bottles", "glass". */
  materials: string[]
  distanceKm: number
  osmUrl: string
}

export interface UserSpot {
  id: string
  layer: LayerId
  lat: number
  lon: number
  name: string
}

export const LAYERS: readonly LayerId[] = ['recycling', 'bulk', 'water']

/** Mirrors tried in turn, fastest first, so one busy server does not break the map. */
export const OVERPASS_ENDPOINTS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

const REQUEST_TIMEOUT_MS = 15000
const MAX_RESULTS = 1500

/**
 * One Overpass query for every layer around a point. Only exact key=value matches are used:
 * regular-expression filters make the public servers several times slower.
 * Coordinates are rounded to keep the query cacheable.
 */
export function buildQuery(lat: number, lon: number, radiusM: number): string {
  const around = `(around:${Math.round(radiusM)},${lat.toFixed(5)},${lon.toFixed(5)})`
  const filters = [
    '"amenity"="recycling"',
    '"amenity"="drinking_water"',
    '"bulk_purchase"="yes"',
    '"bulk_purchase"="only"',
    '"zero_waste"="yes"',
    '"zero_waste"="only"',
    '"shop"="zero_waste"',
    '"shop"="bulk"',
    '"shop"="refill"',
    '"shop"="bulk_food"',
  ]
  const body = filters.map((filter) => `nwr[${filter}]${around};`).join('')
  return `[out:json][timeout:25];(${body});out center tags ${MAX_RESULTS};`
}

/** Which layer an element belongs to, or null when it is not one we show. */
export function classify(tags: Record<string, string>): LayerId | null {
  if (tags.amenity === 'recycling') return 'recycling'
  if (tags.amenity === 'drinking_water') return 'water'
  if (tags.bulk_purchase === 'yes' || tags.bulk_purchase === 'only') return 'bulk'
  if (tags.zero_waste === 'yes' || tags.zero_waste === 'only') return 'bulk'
  if (tags.shop === 'zero_waste' || tags.shop === 'bulk' || tags.shop === 'refill' || tags.shop === 'bulk_food') return 'bulk'
  return null
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)))
}

/** `recycling:plastic_bottles=yes` -> "plastic_bottles". */
export function recyclingMaterials(tags: Record<string, string>): string[] {
  const materials: string[] = []
  for (const [key, value] of Object.entries(tags)) {
    if (key.startsWith('recycling:') && value === 'yes') materials.push(key.slice('recycling:'.length))
  }
  return materials.sort()
}

export function acceptsPlastic(materials: readonly string[]): boolean {
  return materials.some((m) => m.startsWith('plastic'))
}

interface OverpassElement {
  type?: string
  id?: number
  lat?: number
  lon?: number
  center?: { lat?: number; lon?: number }
  tags?: Record<string, string>
}

/** Turns an Overpass response into spots sorted by distance from `origin`; anything malformed is skipped. */
export function parseOverpass(json: unknown, origin: { lat: number; lon: number }): Spot[] {
  const elements = (json as { elements?: unknown } | null)?.elements
  if (!Array.isArray(elements)) return []
  const spots: Spot[] = []
  const seen = new Set<string>()
  for (const raw of elements as OverpassElement[]) {
    if (!raw || typeof raw.id !== 'number' || typeof raw.type !== 'string') continue
    const lat = raw.lat ?? raw.center?.lat
    const lon = raw.lon ?? raw.center?.lon
    if (typeof lat !== 'number' || typeof lon !== 'number') continue
    const tags = raw.tags ?? {}
    const layer = classify(tags)
    if (!layer) continue
    const id = `${raw.type}/${raw.id}`
    if (seen.has(id)) continue
    seen.add(id)
    spots.push({
      id,
      layer,
      lat,
      lon,
      name: tags.name || tags['name:en'] || undefined,
      materials: layer === 'recycling' ? recyclingMaterials(tags) : [],
      distanceKm: haversineKm(origin.lat, origin.lon, lat, lon),
      osmUrl: `https://www.openstreetmap.org/${raw.type}/${raw.id}`,
    })
  }
  return spots.sort((a, b) => a.distanceKm - b.distanceKm)
}

/** Splits a spot list by layer. */
export function groupByLayer(spots: readonly Spot[]): Record<LayerId, Spot[]> {
  const grouped: Record<LayerId, Spot[]> = { recycling: [], bulk: [], water: [] }
  for (const spot of spots) grouped[spot.layer].push(spot)
  return grouped
}

export interface Place {
  lat: number
  lon: number
  label: string
}

/** Reads the first hit of a Nominatim search, or null when there is none. */
export function parseGeocode(json: unknown): Place | null {
  if (!Array.isArray(json) || json.length === 0) return null
  const first = json[0] as { lat?: string; lon?: string; display_name?: string }
  const lat = Number(first.lat)
  const lon = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { lat, lon, label: (first.display_name ?? '').split(',').slice(0, 2).join(',').trim() }
}

const cache = new Map<string, Spot[]>()

async function postOverpass(query: string, signal?: AbortSignal): Promise<unknown> {
  let lastError: unknown = new Error('Overpass unavailable')
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      })
      if (!response.ok) throw new Error(`Overpass ${response.status}`)
      return await response.json()
    } catch (error) {
      // A cancelled search stops here; a slow or failing mirror falls through to the next one.
      if (signal?.aborted) throw error
      lastError = error
    }
  }
  throw lastError
}

/** Every recycling point, bulk shop and water point within `radiusM` of a place. */
export async function fetchSpots(lat: number, lon: number, radiusM: number, signal?: AbortSignal): Promise<Spot[]> {
  const query = buildQuery(lat, lon, radiusM)
  const hit = cache.get(query)
  if (hit) return hit
  const spots = parseOverpass(await postOverpass(query, signal), { lat, lon })
  cache.set(query, spots)
  return spots
}

export async function geocode(query: string, lang: string, signal?: AbortSignal): Promise<Place | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=${encodeURIComponent(lang)}&q=${encodeURIComponent(query)}`
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Nominatim ${response.status}`)
  return parseGeocode(await response.json())
}
