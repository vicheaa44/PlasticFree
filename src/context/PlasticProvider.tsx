import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { challengeSavedG, toISODate } from '../utils/challenge'
import { calcFootprint, clampCount, CATEGORIES, TYPICAL_ANSWERS, type CategoryId } from '../utils/footprint'
import type { UserSpot } from '../utils/map'
import { findSwap, totalSwapSavingKg } from '../utils/swaps'
import { defaultState, loadState, saveState, type PlasticState } from '../utils/storage'
import { PlasticContext, type PlasticContextValue } from './plastic'

export function PlasticProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlasticState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const setAnswer = useCallback((id: CategoryId, value: number) => {
    const category = CATEGORIES.find((c) => c.id === id)
    if (!category) return
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: clampCount(value, category.max) } }))
  }, [])

  const resetAnswers = useCallback(() => {
    setState((s) => ({ ...s, answers: { ...TYPICAL_ANSWERS } }))
  }, [])

  const toggleSwap = useCallback((id: string) => {
    if (!findSwap(id)) return
    setState((s) => ({ ...s, swaps: s.swaps.includes(id) ? s.swaps.filter((x) => x !== id) : [...s.swaps, id] }))
  }, [])

  const setSwapQty = useCallback((id: string, value: number) => {
    const item = findSwap(id)
    if (!item) return
    setState((s) => ({ ...s, swapQty: { ...s.swapQty, [id]: Math.min(Math.max(Math.round(value), 0), item.max) } }))
  }, [])

  const startChallenge = useCallback(() => {
    setState((s) => ({ ...s, challenge: { start: toISODate(new Date()), done: [] } }))
  }, [])

  const toggleDay = useCallback((day: number) => {
    setState((s) => {
      const done = s.challenge.done.includes(day) ? s.challenge.done.filter((d) => d !== day) : [...s.challenge.done, day].sort((a, b) => a - b)
      return { ...s, challenge: { ...s.challenge, done } }
    })
  }, [])

  const resetChallenge = useCallback(() => {
    setState((s) => ({ ...s, challenge: defaultState().challenge }))
  }, [])

  const addSpot = useCallback((spot: Omit<UserSpot, 'id'>) => {
    const id = `mine/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
    setState((s) => ({ ...s, spots: [...s.spots, { ...spot, id, name: spot.name.slice(0, 80) }] }))
  }, [])

  const removeSpot = useCallback((id: string) => {
    setState((s) => ({ ...s, spots: s.spots.filter((spot) => spot.id !== id) }))
  }, [])

  const value = useMemo<PlasticContextValue>(
    () => ({
      ...state,
      footprintKg: calcFootprint(state.answers).totalKg,
      swapSavedKg: totalSwapSavingKg(state.swaps, state.swapQty, state.answers),
      challengeSavedKg: challengeSavedG(state.challenge.done) / 1000,
      setAnswer,
      resetAnswers,
      toggleSwap,
      setSwapQty,
      startChallenge,
      toggleDay,
      resetChallenge,
      addSpot,
      removeSpot,
    }),
    [state, setAnswer, resetAnswers, toggleSwap, setSwapQty, startChallenge, toggleDay, resetChallenge, addSpot, removeSpot],
  )

  return <PlasticContext.Provider value={value}>{children}</PlasticContext.Provider>
}
