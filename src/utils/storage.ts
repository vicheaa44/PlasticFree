import { CATEGORIES, clampCount, TYPICAL_ANSWERS, type Answers } from './footprint'
import { CHALLENGE_DAYS, parseISODate } from './challenge'
import { findSwap } from './swaps'
import { LAYERS, type LayerId, type UserSpot } from './map'

export interface ChallengeState {
  start: string | null
  done: number[]
}

export interface PlasticState {
  answers: Answers
  swaps: string[]
  swapQty: Record<string, number>
  challenge: ChallengeState
  spots: UserSpot[]
}

export const STORAGE_KEY = 'plasticfree-state-v1'

export function defaultState(): PlasticState {
  return { answers: { ...TYPICAL_ANSWERS }, swaps: [], swapQty: {}, challenge: { start: null, done: [] }, spots: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Rebuilds a state from whatever was in localStorage; every field that does not check out falls back to its default. */
export function sanitizeState(raw: unknown): PlasticState {
  const state = defaultState()
  if (!isRecord(raw)) return state

  if (isRecord(raw.answers)) {
    for (const category of CATEGORIES) {
      const value = raw.answers[category.id]
      if (typeof value === 'number') state.answers[category.id] = clampCount(value, category.max)
    }
  }

  if (Array.isArray(raw.swaps)) {
    state.swaps = [...new Set(raw.swaps.filter((id): id is string => typeof id === 'string' && findSwap(id) !== undefined))]
  }

  if (isRecord(raw.swapQty)) {
    for (const [id, value] of Object.entries(raw.swapQty)) {
      const item = findSwap(id)
      if (item && typeof value === 'number' && Number.isFinite(value)) state.swapQty[id] = Math.min(Math.max(Math.round(value), 0), item.max)
    }
  }

  if (isRecord(raw.challenge)) {
    const { start, done } = raw.challenge
    if (typeof start === 'string' && parseISODate(start)) state.challenge.start = start
    if (Array.isArray(done)) {
      state.challenge.done = [...new Set(done.filter((d): d is number => Number.isInteger(d) && d >= 1 && d <= CHALLENGE_DAYS))].sort((a, b) => a - b)
    }
  }

  if (Array.isArray(raw.spots)) {
    state.spots = raw.spots.flatMap((spot): UserSpot[] => {
      if (!isRecord(spot)) return []
      const { id, layer, lat, lon, name } = spot
      if (typeof id !== 'string' || typeof name !== 'string') return []
      if (typeof layer !== 'string' || !LAYERS.includes(layer as LayerId)) return []
      if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon)) return []
      return [{ id, layer: layer as LayerId, lat, lon, name: name.slice(0, 80) }]
    })
  }

  return state
}

export function loadState(): PlasticState {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    return text ? sanitizeState(JSON.parse(text)) : defaultState()
  } catch {
    return defaultState()
  }
}

export function saveState(state: PlasticState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or blocked — the app still works for this session
  }
}
