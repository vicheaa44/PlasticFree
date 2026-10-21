import { describe, expect, it } from 'vitest'
import { bottleEquivalents, calcFootprint, categoryKg, CATEGORIES, clampCount, TYPICAL_ANSWERS, TYPICAL_KG } from './footprint'

describe('footprint calculator', () => {
  it('is zero when nothing is used', () => {
    const result = calcFootprint({ bottles: 0, bags: 0, food: 0, takeaway: 0, care: 0 })
    expect(result.totalKg).toBe(0)
    expect(result.itemsPerYear).toBe(0)
  })

  it('turns weekly counts into yearly kilograms', () => {
    const bottles = CATEGORIES.find((c) => c.id === 'bottles')!
    // 10 bottles a week x 14 g x 52 weeks = 7.28 kg
    expect(categoryKg(bottles, 10)).toBeCloseTo(7.28, 5)
  })

  it('treats monthly categories per month', () => {
    const care = CATEGORIES.find((c) => c.id === 'care')!
    // 2 bottles a month x 45 g x 12 months = 1.08 kg
    expect(categoryKg(care, 2)).toBeCloseTo(1.08, 5)
  })

  it('sums every category for the typical person', () => {
    const result = calcFootprint(TYPICAL_ANSWERS)
    const sum = Object.values(result.perCategory).reduce((a, b) => a + b, 0)
    expect(result.totalKg).toBeCloseTo(sum, 9)
    expect(TYPICAL_KG).toBeCloseTo(20.652, 3)
  })

  it('counts items per year', () => {
    const result = calcFootprint({ bottles: 1, bags: 0, food: 0, takeaway: 0, care: 1 })
    expect(result.itemsPerYear).toBe(52 + 12)
  })

  it('clamps nonsense input instead of inventing numbers', () => {
    expect(clampCount(-5, 30)).toBe(0)
    expect(clampCount(500, 30)).toBe(30)
    expect(clampCount(Number.NaN, 30)).toBe(0)
    expect(clampCount(2.6, 30)).toBe(3)
  })

  it('converts a weight into bottle equivalents', () => {
    expect(bottleEquivalents(1.4)).toBe(100)
    expect(bottleEquivalents(0)).toBe(0)
  })
})
