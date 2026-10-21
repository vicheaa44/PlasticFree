export interface ChallengeTask {
  /** Plastic avoided by doing the task once, in grams. */
  savedG: number
  /** How many times a year it would happen if it became a habit. */
  perYear: number
}

export const CHALLENGE_DAYS = 30

/** One task per day. The grams are estimates built from the same item weights as the calculator. */
export const CHALLENGE_TASKS: readonly ChallengeTask[] = [
  { savedG: 7, perYear: 150 },
  { savedG: 14, perYear: 300 },
  { savedG: 3, perYear: 100 },
  { savedG: 10, perYear: 120 },
  { savedG: 6, perYear: 100 },
  { savedG: 30, perYear: 8 },
  { savedG: 30, perYear: 100 },
  { savedG: 5, perYear: 150 },
  { savedG: 4, perYear: 60 },
  { savedG: 20, perYear: 50 },
  { savedG: 25, perYear: 6 },
  { savedG: 20, perYear: 100 },
  { savedG: 25, perYear: 80 },
  { savedG: 5, perYear: 150 },
  { savedG: 50, perYear: 50 },
  { savedG: 18, perYear: 4 },
  { savedG: 15, perYear: 40 },
  { savedG: 80, perYear: 6 },
  { savedG: 7, perYear: 100 },
  { savedG: 14, perYear: 150 },
  { savedG: 4, perYear: 100 },
  { savedG: 50, perYear: 6 },
  { savedG: 12, perYear: 12 },
  { savedG: 6, perYear: 100 },
  { savedG: 14, perYear: 100 },
  { savedG: 50, perYear: 12 },
  { savedG: 0, perYear: 0 },
  { savedG: 0, perYear: 0 },
  { savedG: 0, perYear: 0 },
  { savedG: 0, perYear: 0 },
]

function dayStamp(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

/** Which day of the challenge `now` is (1-based, capped at 30), or 0 when it has not started. */
export function dayNumber(startISO: string | null, now: Date): number {
  if (!startISO) return 0
  const start = parseISODate(startISO)
  if (!start) return 0
  const diff = Math.round((dayStamp(now) - dayStamp(start)) / 86_400_000)
  if (diff < 0) return 0
  return Math.min(diff + 1, CHALLENGE_DAYS)
}

export function isUnlocked(day: number, startISO: string | null, now: Date): boolean {
  return day >= 1 && day <= dayNumber(startISO, now)
}

export function challengeSavedG(done: readonly number[]): number {
  let total = 0
  for (const day of new Set(done)) total += CHALLENGE_TASKS[day - 1]?.savedG ?? 0
  return total
}

/** Plastic per year if every completed task became a habit. */
export function projectedYearKg(done: readonly number[]): number {
  let total = 0
  for (const day of new Set(done)) {
    const task = CHALLENGE_TASKS[day - 1]
    if (task) total += (task.savedG * task.perYear) / 1000
  }
  return total
}

/** Consecutive completed days ending today (or yesterday, if today is still open). */
export function streak(done: readonly number[], today: number): number {
  if (today < 1) return 0
  const set = new Set(done)
  let day = set.has(today) ? today : today - 1
  let count = 0
  while (day >= 1 && set.has(day)) {
    count += 1
    day -= 1
  }
  return count
}
