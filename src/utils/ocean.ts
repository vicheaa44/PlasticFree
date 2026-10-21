/** Levels above this are drawn as the same, fully choked ocean. */
export const LEVEL_MAX = 1.5

export const MAX_PLASTIC = 120
export const MAX_FISH = 28

export type OceanState = 'clean' | 'light' | 'polluted' | 'choked'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 0 = clean water, 1 = the ocean a typical person's footprint would feed, above 1 = worse than typical.
 * Everything saved comes off the yearly footprint before it is compared with the typical one.
 */
export function pollutionLevel(footprintKg: number, savedKg: number, typicalKg: number): number {
  if (typicalKg <= 0) return 0
  return clamp((footprintKg - savedKg) / typicalKg, 0, LEVEL_MAX)
}

export function plasticCount(level: number): number {
  return Math.round((clamp(level, 0, LEVEL_MAX) / LEVEL_MAX) * MAX_PLASTIC)
}

export function fishCount(level: number): number {
  const norm = clamp(level, 0, LEVEL_MAX) / LEVEL_MAX
  return Math.round(MAX_FISH * (1 - 0.75 * norm))
}

export function oceanState(level: number): OceanState {
  if (level < 0.15) return 'clean'
  if (level < 0.5) return 'light'
  if (level < 1.1) return 'polluted'
  return 'choked'
}

/** Plastic kept out of the bin if `people` people made the same choices, in tonnes per year. */
export function scaleToTonnes(savedKg: number, people: number): number {
  return (Math.max(savedKg, 0) * people) / 1000
}
