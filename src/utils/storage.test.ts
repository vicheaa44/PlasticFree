import { describe, expect, it } from 'vitest'
import { TYPICAL_ANSWERS } from './footprint'
import { defaultState, sanitizeState } from './storage'

describe('stored state', () => {
  it('falls back to defaults for junk', () => {
    expect(sanitizeState(null)).toEqual(defaultState())
    expect(sanitizeState('nope')).toEqual(defaultState())
    expect(sanitizeState([1, 2])).toEqual(defaultState())
  })

  it('starts from the typical person', () => {
    expect(defaultState().answers).toEqual(TYPICAL_ANSWERS)
  })

  it('keeps valid answers and clamps out-of-range ones', () => {
    const state = sanitizeState({ answers: { bottles: 12, bags: 999, food: -3, takeaway: 'x' } })
    expect(state.answers.bottles).toBe(12)
    expect(state.answers.bags).toBe(20)
    expect(state.answers.food).toBe(0)
    expect(state.answers.takeaway).toBe(TYPICAL_ANSWERS.takeaway)
  })

  it('keeps only known, unique swaps and clamps quantities', () => {
    const state = sanitizeState({ swaps: ['bottle', 'bottle', 'ghost', 7], swapQty: { bottle: 99999, ghost: 5, cup: 'a' } })
    expect(state.swaps).toEqual(['bottle'])
    expect(state.swapQty).toEqual({ bottle: 1500 })
  })

  it('validates the challenge start date and days', () => {
    const good = sanitizeState({ challenge: { start: '2026-10-05', done: [3, 1, 1, 0, 31, 2.5, 'x'] } })
    expect(good.challenge.start).toBe('2026-10-05')
    expect(good.challenge.done).toEqual([1, 3])
    expect(sanitizeState({ challenge: { start: 'yesterday', done: [] } }).challenge.start).toBeNull()
  })

  it('keeps well-formed spots only', () => {
    const state = sanitizeState({
      spots: [
        { id: 'a', layer: 'water', lat: 47, lon: 28, name: 'Fountain' },
        { id: 'b', layer: 'nope', lat: 47, lon: 28, name: 'x' },
        { id: 'c', layer: 'bulk', lat: Number.NaN, lon: 28, name: 'x' },
        'junk',
      ],
    })
    expect(state.spots).toHaveLength(1)
    expect(state.spots[0].name).toBe('Fountain')
  })
})
