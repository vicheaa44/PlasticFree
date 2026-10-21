import type { Answers } from './footprint'

export interface SwapItem {
  id: string
  /** Plastic in one disposable item, in grams. */
  plasticG: number
  /** Typical uses per year. */
  perYear: number
  /** Indicative cost of one disposable item (or the fee / discount it carries), in EUR. */
  unitCost: number
  /** Indicative total cost of the alternative in the first year, including the one-off purchase, in EUR. */
  altCost: number
  /** When set, the default quantity follows the calculator answer of the same name (per week). */
  link?: keyof Answers
  max: number
}

export const SWAP_ITEMS: readonly SwapItem[] = [
  { id: 'bottle', plasticG: 14, perYear: 300, unitCost: 0.4, altCost: 16, link: 'bottles', max: 1500 },
  { id: 'bag', plasticG: 7, perYear: 150, unitCost: 0.12, altCost: 4, link: 'bags', max: 1000 },
  { id: 'cup', plasticG: 10, perYear: 120, unitCost: 0.15, altCost: 8, max: 600 },
  { id: 'detergent', plasticG: 80, perYear: 6, unitCost: 7, altCost: 30, max: 30 },
  { id: 'shampoo', plasticG: 25, perYear: 6, unitCost: 4.5, altCost: 18, max: 30 },
  { id: 'soap', plasticG: 30, perYear: 8, unitCost: 2.2, altCost: 7.2, max: 40 },
  { id: 'wrap', plasticG: 50, perYear: 4, unitCost: 2.5, altCost: 12, max: 24 },
  { id: 'zipbag', plasticG: 5, perYear: 150, unitCost: 0.04, altCost: 10, max: 800 },
  { id: 'produce', plasticG: 3, perYear: 100, unitCost: 0.02, altCost: 6, max: 600 },
  { id: 'cutlery', plasticG: 3, perYear: 100, unitCost: 0.03, altCost: 6, max: 600 },
  { id: 'toothbrush', plasticG: 18, perYear: 4, unitCost: 2, altCost: 10, max: 12 },
  { id: 'razor', plasticG: 12, perYear: 12, unitCost: 1.2, altCost: 23, max: 60 },
]

export function findSwap(id: string): SwapItem | undefined {
  return SWAP_ITEMS.find((item) => item.id === id)
}

/** Default uses per year for an item, following the calculator where the two overlap. */
export function defaultPerYear(item: SwapItem, answers: Answers): number {
  if (item.link) return Math.min(Math.max(Math.round(answers[item.link] * 52), 0), item.max)
  return item.perYear
}

function safeQuantity(item: SwapItem, perYear: number): number {
  return Number.isFinite(perYear) ? Math.min(Math.max(perYear, 0), item.max) : 0
}

export function swapSavingKg(item: SwapItem, perYear: number): number {
  return (safeQuantity(item, perYear) * item.plasticG) / 1000
}

export interface SwapMoney {
  plasticCost: number
  altCost: number
  /** Money kept in the first year (negative: the alternative costs more at first). */
  firstYearNet: number
  /** Months until the alternative has paid for itself, or null when the disposable costs nothing. */
  paybackMonths: number | null
}

export function swapMoney(item: SwapItem, perYear: number): SwapMoney {
  const plasticCost = safeQuantity(item, perYear) * item.unitCost
  const monthly = plasticCost / 12
  return {
    plasticCost,
    altCost: item.altCost,
    firstYearNet: plasticCost - item.altCost,
    paybackMonths: monthly > 0 ? item.altCost / monthly : null,
  }
}

/** Total plastic kept out of the bin per year by the chosen swaps. */
export function totalSwapSavingKg(chosen: readonly string[], quantities: Record<string, number>, answers: Answers): number {
  let total = 0
  for (const id of new Set(chosen)) {
    const item = findSwap(id)
    if (!item) continue
    total += swapSavingKg(item, quantities[id] ?? defaultPerYear(item, answers))
  }
  return total
}
