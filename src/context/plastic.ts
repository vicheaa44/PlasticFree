import { createContext, useContext } from 'react'
import type { CategoryId } from '../utils/footprint'
import type { UserSpot } from '../utils/map'
import type { PlasticState } from '../utils/storage'

export interface PlasticContextValue extends PlasticState {
  /** Yearly footprint from the calculator, in kg. */
  footprintKg: number
  /** Yearly saving from the chosen swaps, in kg. */
  swapSavedKg: number
  /** Plastic avoided by the challenge tasks done so far, in kg. */
  challengeSavedKg: number
  setAnswer: (id: CategoryId, value: number) => void
  resetAnswers: () => void
  toggleSwap: (id: string) => void
  setSwapQty: (id: string, value: number) => void
  startChallenge: () => void
  toggleDay: (day: number) => void
  resetChallenge: () => void
  addSpot: (spot: Omit<UserSpot, 'id'>) => void
  removeSpot: (id: string) => void
}

export const PlasticContext = createContext<PlasticContextValue | null>(null)

export function usePlastic(): PlasticContextValue {
  const ctx = useContext(PlasticContext)
  if (!ctx) throw new Error('usePlastic must be used within a PlasticProvider')
  return ctx
}
