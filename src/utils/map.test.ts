import { describe, expect, it } from 'vitest'
import { acceptsPlastic, buildQuery, classify, groupByLayer, haversineKm, OVERPASS_ENDPOINTS, parseGeocode, parseOverpass, recyclingMaterials } from './map'

const origin = { lat: 47.0105, lon: 28.8638 }

describe('overpass query', () => {
  const query = buildQuery(47.0105, 28.8638, 4000)

  it('asks for recycling points and water points around a point', () => {
    expect(query).toContain('nwr["amenity"="recycling"](around:4000,47.01050,28.86380)')
    expect(query).toContain('nwr["amenity"="drinking_water"]')
    expect(query).toContain('[out:json]')
  })

  it('covers every bulk and zero-waste tag', () => {
    expect(query).toContain('"bulk_purchase"="yes"')
    expect(query).toContain('"bulk_purchase"="only"')
    expect(query).toContain('"zero_waste"="yes"')
    expect(query).toContain('"shop"="refill"')
  })

  it('uses exact matches only, because regular expressions make public servers slow', () => {
    expect(query).not.toContain('~')
  })

  it('has fallback mirrors', () => {
    expect(OVERPASS_ENDPOINTS.length).toBeGreaterThanOrEqual(2)
  })
})

describe('layers', () => {
  it('sorts an element into a layer by its tags', () => {
    expect(classify({ amenity: 'recycling' })).toBe('recycling')
    expect(classify({ amenity: 'drinking_water' })).toBe('water')
    expect(classify({ shop: 'convenience', bulk_purchase: 'yes' })).toBe('bulk')
    expect(classify({ shop: 'convenience', zero_waste: 'only' })).toBe('bulk')
    expect(classify({ shop: 'refill' })).toBe('bulk')
    expect(classify({ shop: 'convenience' })).toBeNull()
    expect(classify({})).toBeNull()
  })
})

describe('distance', () => {
  it('is zero for the same point', () => {
    expect(haversineKm(47, 28, 47, 28)).toBe(0)
  })

  it('matches a known distance', () => {
    // Chisinau -> Bucharest is about 358 km in a straight line (the road is longer).
    const km = haversineKm(47.0105, 28.8638, 44.4268, 26.1025)
    expect(km).toBeGreaterThan(350)
    expect(km).toBeLessThan(366)
  })
})

describe('recycling materials', () => {
  it('reads only the accepted materials', () => {
    const tags = { amenity: 'recycling', 'recycling:glass': 'yes', 'recycling:paper': 'yes', 'recycling:plastic': 'no', name: 'x' }
    expect(recyclingMaterials(tags)).toEqual(['glass', 'paper'])
  })

  it('detects plastic in any form', () => {
    expect(acceptsPlastic(['glass', 'plastic_bottles'])).toBe(true)
    expect(acceptsPlastic(['glass', 'paper'])).toBe(false)
  })
})

describe('parsing an overpass response', () => {
  const response = {
    elements: [
      { type: 'node', id: 2, lat: 47.05, lon: 28.9, tags: { amenity: 'recycling', 'recycling:plastic_bottles': 'yes' } },
      { type: 'way', id: 3, center: { lat: 47.011, lon: 28.865 }, tags: { amenity: 'recycling', name: 'Eco point' } },
      { type: 'node', id: 6, lat: 47.02, lon: 28.87, tags: { amenity: 'drinking_water' } },
      { type: 'node', id: 7, lat: 47.03, lon: 28.88, tags: { shop: 'convenience', bulk_purchase: 'only', name: 'Loose' } },
      { type: 'node', id: 8, lat: 47.03, lon: 28.88, tags: { shop: 'kiosk' } },
      { type: 'node', id: 2, lat: 47.05, lon: 28.9, tags: { amenity: 'recycling' } },
      { type: 'node', id: 4, tags: { amenity: 'recycling' } },
      { id: 5, lat: 1, lon: 2, tags: { amenity: 'recycling' } },
      null,
    ],
  }

  it('sorts by distance, resolves way centres and drops duplicates, junk and unrelated shops', () => {
    const spots = parseOverpass(response, origin)
    expect(spots.map((s) => s.id)).toEqual(['way/3', 'node/6', 'node/7', 'node/2'])
    expect(spots[0].name).toBe('Eco point')
    expect(spots[3].materials).toEqual(['plastic_bottles'])
    expect(spots[0].distanceKm).toBeLessThan(spots[3].distanceKm)
    expect(spots[0].osmUrl).toBe('https://www.openstreetmap.org/way/3')
  })

  it('gives every spot the right layer', () => {
    const grouped = groupByLayer(parseOverpass(response, origin))
    expect(grouped.recycling).toHaveLength(2)
    expect(grouped.water).toHaveLength(1)
    expect(grouped.bulk.map((s) => s.name)).toEqual(['Loose'])
  })

  it('returns nothing for a malformed response', () => {
    expect(parseOverpass(null, origin)).toEqual([])
    expect(parseOverpass({ elements: 'nope' }, origin)).toEqual([])
    expect(parseOverpass({}, origin)).toEqual([])
  })

  it('only lists materials for recycling points', () => {
    const spots = parseOverpass({ elements: [{ type: 'node', id: 1, lat: 1, lon: 2, tags: { shop: 'bulk', 'recycling:glass': 'yes' } }] }, origin)
    expect(spots[0].layer).toBe('bulk')
    expect(spots[0].materials).toEqual([])
  })
})

describe('geocoding', () => {
  it('reads the first Nominatim hit', () => {
    const place = parseGeocode([{ lat: '47.02', lon: '28.83', display_name: 'Chișinău, Moldova, Europe' }])
    expect(place).toEqual({ lat: 47.02, lon: 28.83, label: 'Chișinău, Moldova' })
  })

  it('returns null for no hit or bad coordinates', () => {
    expect(parseGeocode([])).toBeNull()
    expect(parseGeocode(null)).toBeNull()
    expect(parseGeocode([{ lat: 'x', lon: 'y' }])).toBeNull()
  })
})
