import { describe, expect, it } from 'vitest'
import { CHALLENGE_DAYS, CHALLENGE_TASKS, challengeSavedG, dayNumber, isUnlocked, parseISODate, projectedYearKg, streak, toISODate } from './challenge'

describe('challenge', () => {
  it('has exactly one task for each of the 30 days', () => {
    expect(CHALLENGE_TASKS).toHaveLength(CHALLENGE_DAYS)
  })

  it('formats and parses local dates', () => {
    const date = new Date(2026, 9, 5)
    expect(toISODate(date)).toBe('2026-10-05')
    expect(parseISODate('2026-10-05')?.getDate()).toBe(5)
    expect(parseISODate('not a date')).toBeNull()
  })

  it('is on day 0 before it starts', () => {
    expect(dayNumber(null, new Date(2026, 9, 5))).toBe(0)
    expect(dayNumber('2026-10-06', new Date(2026, 9, 5))).toBe(0)
  })

  it('counts the start day as day 1 and caps at 30', () => {
    expect(dayNumber('2026-10-05', new Date(2026, 9, 5, 23, 59))).toBe(1)
    expect(dayNumber('2026-10-05', new Date(2026, 9, 6, 0, 1))).toBe(2)
    expect(dayNumber('2026-10-05', new Date(2027, 2, 1))).toBe(30)
  })

  it('unlocks days up to today only', () => {
    const now = new Date(2026, 9, 7)
    expect(isUnlocked(3, '2026-10-05', now)).toBe(true)
    expect(isUnlocked(4, '2026-10-05', now)).toBe(false)
    expect(isUnlocked(1, null, now)).toBe(false)
  })

  it('adds up the plastic saved, counting a day once', () => {
    expect(challengeSavedG([1, 2, 2])).toBe(CHALLENGE_TASKS[0].savedG + CHALLENGE_TASKS[1].savedG)
    expect(challengeSavedG([])).toBe(0)
    expect(challengeSavedG([99])).toBe(0)
  })

  it('projects a yearly figure from completed habits', () => {
    // day 1: 7 g x 150 = 1.05 kg, day 2: 14 g x 300 = 4.2 kg
    expect(projectedYearKg([1, 2])).toBeCloseTo(5.25, 5)
  })

  it('counts a streak ending today or yesterday', () => {
    expect(streak([1, 2, 3], 3)).toBe(3)
    expect(streak([1, 2, 3], 4)).toBe(3)
    expect(streak([1, 2, 3], 5)).toBe(0)
    expect(streak([1, 3, 4], 4)).toBe(2)
    expect(streak([], 4)).toBe(0)
    expect(streak([1], 0)).toBe(0)
  })
})
