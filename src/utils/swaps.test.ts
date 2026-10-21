import { describe, expect, it } from 'vitest'
import { TYPICAL_ANSWERS } from './footprint'
import { defaultPerYear, findSwap, SWAP_ITEMS, swapMoney, swapSavingKg, totalSwapSavingKg } from './swaps'

describe('swap savings', () => {
  const bottle = findSwap('bottle')!

  it('knows every catalogue item', () => {
    expect(SWAP_ITEMS.length).toBeGreaterThanOrEqual(10)
    expect(new Set(SWAP_ITEMS.map((i) => i.id)).size).toBe(SWAP_ITEMS.length)
  })

  it('saves weight x uses per year', () => {
    // 300 bottles x 14 g = 4.2 kg
    expect(swapSavingKg(bottle, 300)).toBeCloseTo(4.2, 5)
  })

  it('never goes negative or past the item maximum', () => {
    expect(swapSavingKg(bottle, -10)).toBe(0)
    expect(swapSavingKg(bottle, 1e9)).toBeCloseTo((bottle.max * bottle.plasticG) / 1000, 5)
    expect(swapSavingKg(bottle, Number.NaN)).toBe(0)
  })

  it('follows the calculator for bottles and bags', () => {
    expect(defaultPerYear(bottle, { ...TYPICAL_ANSWERS, bottles: 10 })).toBe(520)
    expect(defaultPerYear(findSwap('cup')!, TYPICAL_ANSWERS)).toBe(120)
  })

  it('computes first-year money and payback', () => {
    const money = swapMoney(bottle, 300)
    expect(money.plasticCost).toBeCloseTo(120, 5)
    expect(money.firstYearNet).toBeCloseTo(120 - 16, 5)
    // 16 EUR alternative, 10 EUR per month of bottles -> 1.6 months
    expect(money.paybackMonths).toBeCloseTo(1.6, 5)
  })

  it('shows honestly when the alternative costs more at first', () => {
    const razor = findSwap('razor')!
    expect(swapMoney(razor, razor.perYear).firstYearNet).toBeLessThan(0)
  })

  it('has no payback figure when the disposable is free', () => {
    expect(swapMoney(bottle, 0).paybackMonths).toBeNull()
  })

  it('sums only the chosen swaps, once each, ignoring unknown ids', () => {
    const total = totalSwapSavingKg(['bottle', 'bottle', 'nope', 'cup'], { bottle: 300 }, TYPICAL_ANSWERS)
    expect(total).toBeCloseTo(4.2 + (120 * 10) / 1000, 5)
  })
})
