export type CategoryId = 'bottles' | 'bags' | 'food' | 'takeaway' | 'care'

export interface Category {
  id: CategoryId
  /** Typical weight of the plastic in one item, in grams. */
  gramsPerItem: number
  period: 'week' | 'month'
  max: number
}

/**
 * The five groups the calculator asks about. Weights are typical values for everyday products
 * (e.g. a 0.5 L PET bottle weighs roughly 10–15 g), listed in the UI under "How is this calculated?".
 */
export const CATEGORIES: readonly Category[] = [
  { id: 'bottles', gramsPerItem: 14, period: 'week', max: 30 },
  { id: 'bags', gramsPerItem: 7, period: 'week', max: 20 },
  { id: 'food', gramsPerItem: 12, period: 'week', max: 40 },
  { id: 'takeaway', gramsPerItem: 30, period: 'week', max: 14 },
  { id: 'care', gramsPerItem: 45, period: 'month', max: 12 },
]

export type Answers = Record<CategoryId, number>

/** The "typical person" every comparison in the app is made against. */
export const TYPICAL_ANSWERS: Answers = { bottles: 7, bags: 4, food: 15, takeaway: 2, care: 3 }

/** Plastic packaging waste per EU resident in 2022 (Eurostat), in kg. */
export const EU_PACKAGING_PER_PERSON_KG = 36.1

const PERIODS_PER_YEAR = { week: 52, month: 12 } as const

export function clampCount(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(Math.round(value), 0), max)
}

export function categoryKg(category: Category, count: number): number {
  const safe = clampCount(count, category.max)
  return (safe * category.gramsPerItem * PERIODS_PER_YEAR[category.period]) / 1000
}

export interface Footprint {
  perCategory: Record<CategoryId, number>
  totalKg: number
  /** Plastic items thrown away in a year. */
  itemsPerYear: number
}

export function calcFootprint(answers: Answers): Footprint {
  const perCategory = {} as Record<CategoryId, number>
  let totalKg = 0
  let itemsPerYear = 0
  for (const category of CATEGORIES) {
    const kg = categoryKg(category, answers[category.id])
    perCategory[category.id] = kg
    totalKg += kg
    itemsPerYear += clampCount(answers[category.id], category.max) * PERIODS_PER_YEAR[category.period]
  }
  return { perCategory, totalKg, itemsPerYear }
}

export const TYPICAL_KG = calcFootprint(TYPICAL_ANSWERS).totalKg

/** How many 0.5 L bottles weigh as much as `kg` of plastic. */
export function bottleEquivalents(kg: number): number {
  return Math.round((kg * 1000) / 14)
}
