import { describe, expect, it } from 'vitest'
import { fishCount, LEVEL_MAX, MAX_FISH, MAX_PLASTIC, oceanState, plasticCount, pollutionLevel, scaleToTonnes } from './ocean'

describe('ocean level', () => {
  it('is 1 for a typical footprint with nothing saved', () => {
    expect(pollutionLevel(20, 0, 20)).toBe(1)
  })

  it('drops as plastic is saved and never goes below 0', () => {
    expect(pollutionLevel(20, 10, 20)).toBe(0.5)
    expect(pollutionLevel(20, 50, 20)).toBe(0)
  })

  it('caps very high footprints', () => {
    expect(pollutionLevel(200, 0, 20)).toBe(LEVEL_MAX)
  })

  it('survives a zero baseline', () => {
    expect(pollutionLevel(5, 0, 0)).toBe(0)
  })

  it('has more plastic and fewer fish as the level rises', () => {
    expect(plasticCount(0)).toBe(0)
    expect(plasticCount(LEVEL_MAX)).toBe(MAX_PLASTIC)
    expect(fishCount(0)).toBe(MAX_FISH)
    expect(fishCount(LEVEL_MAX)).toBeLessThan(MAX_FISH / 2)
    expect(plasticCount(1)).toBeGreaterThan(plasticCount(0.5))
    expect(fishCount(1)).toBeLessThan(fishCount(0.5))
  })

  it('names the four states', () => {
    expect(oceanState(0)).toBe('clean')
    expect(oceanState(0.3)).toBe('light')
    expect(oceanState(0.7)).toBe('polluted')
    expect(oceanState(1.2)).toBe('choked')
  })

  it('scales a personal saving to tonnes', () => {
    expect(scaleToTonnes(10, 1_000_000)).toBe(10_000)
    expect(scaleToTonnes(-3, 1000)).toBe(0)
  })
})
