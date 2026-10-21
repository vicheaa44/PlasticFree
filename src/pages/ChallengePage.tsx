import { useEffect, useState } from 'react'
import { Btn } from '../components/Btn'
import { Scene } from '../components/illustrations/scenes'
import { PageHeader } from '../components/PageHeader'
import { Wrap } from '../components/SectionTitle'
import { usePlastic } from '../context/plastic'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../i18n/LanguageContext'
import { CHALLENGE_DAYS, CHALLENGE_TASKS, challengeSavedG, dayNumber, isUnlocked, parseISODate, projectedYearKg, streak } from '../utils/challenge'
import { bottleEquivalents } from '../utils/footprint'
import { formatDate, formatNumber, formatWeight } from '../utils/format'

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template)
}

export function ChallengePage() {
  const { t, lang } = useLanguage()
  const { challenge, startChallenge, toggleDay, resetChallenge } = usePlastic()
  const c = t.challenge
  const [now, setNow] = useState(() => new Date())
  const [picked, setPicked] = useState<number | null>(null)

  // A new day unlocks at midnight without needing a reload.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const started = challenge.start !== null
  const today = dayNumber(challenge.start, now)
  const selected = picked ?? Math.max(1, today)
  const doneSet = new Set(challenge.done)
  const savedG = challengeSavedG(challenge.done)
  const savedKg = savedG / 1000
  const shownG = useCountUp(savedG, 700)
  const yearKg = projectedYearKg(challenge.done)
  const run = streak(challenge.done, today)
  const task = CHALLENGE_TASKS[selected - 1]
  const unlocked = isUnlocked(selected, challenge.start, now)
  const startDate = challenge.start ? parseISODate(challenge.start) : null

  function confirmReset() {
    if (window.confirm(c.resetConfirm)) {
      resetChallenge()
      setPicked(null)
    }
  }

  return (
    <div>
      <PageHeader eyebrow={c.eyebrow} title={c.title} sub={c.sub}>
        {!started && (
          <div className="flex flex-wrap items-center gap-4">
            <Btn variant="blue" onClick={startChallenge}>
              {c.start}
            </Btn>
            <p className="max-w-md text-sm text-white/50">{c.notStarted}</p>
          </div>
        )}
        {started && startDate && (
          <p className="font-mono text-xs uppercase tracking-[0.05em] text-white/50">
            {fill(c.startedOn, { date: formatDate(startDate, lang) })} · {fill(c.day, { n: String(Math.max(today, 1)) })}
          </p>
        )}
      </PageHeader>

      <Wrap className="pt-2">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-h-[9rem] bg-brand p-5">
            <p className="eyebrow !text-white/75">{c.savedTitle}</p>
            <p className="mt-4 text-[clamp(2.2rem,4vw,3rem)] leading-none tracking-[-0.05em]">
              {savedG >= 1000 ? formatWeight(savedKg, lang) : `${formatNumber(shownG, lang)} g`}
            </p>
            <p className="mt-2 text-xs text-white/75">{fill(c.bottles, { n: formatNumber(bottleEquivalents(savedKg), lang) })}</p>
          </div>
          <div className="min-h-[9rem] border border-white/10 bg-black p-5">
            <p className="eyebrow">{c.daysDone}</p>
            <p className="mt-4 text-[clamp(2.2rem,4vw,3rem)] leading-none tracking-[-0.05em]">
              {challenge.done.length}
              <span className="text-white/30"> / {CHALLENGE_DAYS}</span>
            </p>
          </div>
          <div className="min-h-[9rem] bg-[#6f7782] p-5">
            <p className="eyebrow !text-white/75">{c.streak}</p>
            <p className="mt-4 text-[clamp(2.2rem,4vw,3rem)] leading-none tracking-[-0.05em]">{run}</p>
          </div>
          <div className="min-h-[9rem] bg-white p-5 text-black">
            <p className="eyebrow !text-black/50">{c.habitTitle}</p>
            <p className="mt-4 text-[clamp(2.2rem,4vw,3rem)] leading-none tracking-[-0.05em]">
              {formatWeight(yearKg, lang)}
              <span className="ml-1 text-sm text-black/45">{c.habitUnit}</span>
            </p>
          </div>
        </div>
      </Wrap>

      <Wrap className="grid gap-3 pt-3 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[4px] bg-card p-4 sm:p-5">
          <ol className="grid grid-cols-5 gap-1.5 sm:grid-cols-6" aria-label={c.gridLabel}>
            {CHALLENGE_TASKS.map((_, index) => {
              const day = index + 1
              const done = doneSet.has(day)
              const open = isUnlocked(day, challenge.start, now)
              const isToday = day === today
              const isSelected = day === selected
              return (
                <li key={day}>
                  <button
                    type="button"
                    onClick={() => setPicked(day)}
                    aria-pressed={isSelected}
                    aria-label={`${fill(c.selected, { n: String(day) })}${done ? ` — ${c.done}` : ''}${open ? '' : ` — ${fill(c.locked, { n: String(day) })}`}`}
                    className={`relative flex aspect-square w-full items-center justify-center rounded-[3px] font-mono text-sm transition-all duration-300 ${
                      done ? 'bg-brand text-white' : open ? 'bg-black text-white hover:bg-slate' : 'bg-black/60 text-white/25'
                    } ${isToday ? 'ring-2 ring-white' : ''} ${isSelected && !isToday ? 'ring-1 ring-white/60' : ''}`}
                  >
                    {done ? (
                      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 8.5l3.2 3.2L13 5" />
                      </svg>
                    ) : (
                      day
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
          {started && (
            <div className="mt-4 flex justify-end">
              <Btn variant="ghost" onClick={confirmReset}>
                {c.resetLabel}
              </Btn>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-[4px] bg-card p-6" aria-live="polite">
          <div>
            <p className="eyebrow">{selected === today && started ? c.today : fill(c.selected, { n: String(selected) })}</p>
            <p className="mt-3 text-[clamp(1.4rem,2.6vw,1.9rem)] leading-[1.15] tracking-[-0.035em]">{c.tasks[selected - 1]}</p>
            <p className="mt-4 text-sm text-white/50">
              {task.savedG > 0 ? fill(c.saves, { g: String(task.savedG) }) : c.noSaving}
            </p>
          </div>
          <div>
            {started && unlocked ? (
              <Btn variant={doneSet.has(selected) ? 'ghost' : 'blue'} onClick={() => toggleDay(selected)} className="w-full">
                {doneSet.has(selected) ? c.undo : c.markDone}
              </Btn>
            ) : started ? (
              <p className="rounded-[4px] bg-black px-4 py-3 text-center text-sm text-white/55">{fill(c.locked, { n: String(selected) })}</p>
            ) : (
              <Btn variant="blue" onClick={startChallenge} className="w-full">
                {c.start}
              </Btn>
            )}
            {challenge.done.length === CHALLENGE_DAYS && <p className="mt-4 text-sm text-brand">{c.finish}</p>}
          </div>
        </div>
      </Wrap>

      <Wrap className="pt-8">
        <div className="grid items-center gap-6 sm:grid-cols-[1fr_12rem]">
          <p className="max-w-2xl text-sm leading-relaxed text-white/45">{c.estimateNote}</p>
          <div className="hidden bg-white sm:block">
            <Scene id="challenge" className="p-2" />
          </div>
        </div>
      </Wrap>
    </div>
  )
}
