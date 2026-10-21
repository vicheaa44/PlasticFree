import { useState } from 'react'
import { Btn } from '../components/Btn'
import { OceanCanvas } from '../components/OceanCanvas'
import { PageHeader } from '../components/PageHeader'
import { PlusCorners } from '../components/PlusCorners'
import { Wrap } from '../components/SectionTitle'
import { usePlastic } from '../context/plastic'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../i18n/LanguageContext'
import { TYPICAL_KG } from '../utils/footprint'
import { formatNumber, formatWeight } from '../utils/format'
import { fishCount, oceanState, plasticCount, pollutionLevel, scaleToTonnes } from '../utils/ocean'

type Scenario = 'usual' | 'mine' | 'zero'
const SCENARIOS: Scenario[] = ['usual', 'mine', 'zero']

export function OceanPage() {
  const { t, lang } = useLanguage()
  const { footprintKg, swapSavedKg, challengeSavedKg } = usePlastic()
  const [scenario, setScenario] = useState<Scenario>('mine')
  const [people, setPeople] = useState(1)
  const o = t.ocean

  const savedKg = swapSavedKg + challengeSavedKg
  const mineLevel = pollutionLevel(footprintKg, savedKg, TYPICAL_KG)
  const level = scenario === 'usual' ? 1 : scenario === 'zero' ? 0 : mineLevel
  const state = oceanState(level)

  const plastic = useCountUp(plasticCount(level), 700)
  const fishes = useCountUp(fishCount(level), 700)

  // How much less plastic than a typical person your choices come to, scaled to a group.
  const reductionKg = Math.max(0, TYPICAL_KG - Math.max(0, footprintKg - savedKg))
  const groupKg = scaleToTonnes(reductionKg, people) * 1000

  return (
    <div>
      <PageHeader eyebrow={o.eyebrow} title={o.title} sub={o.sub} />

      <Wrap className="pt-2">
        <div className="relative overflow-hidden rounded-[2px] border border-white/15 bg-black">
          <div className="aspect-[4/3] min-h-[22rem] w-full sm:aspect-[16/9] lg:max-h-[34rem]">
            <OceanCanvas level={level} label={o.ariaLabel} />
          </div>
          <PlusCorners className="text-white/60" />

          <div className="pointer-events-none absolute left-0 top-0 max-w-[17rem] p-6 sm:p-8">
            <p className="eyebrow !text-white/70">{o.scenarios[scenario]}</p>
            <p className="mt-2 text-[clamp(1.6rem,3.4vw,2.4rem)] leading-none tracking-[-0.04em]" aria-live="polite">
              {o.states[state].title}
            </p>
            <p className="mt-2 text-sm leading-snug text-white/80">{o.states[state].body}</p>
          </div>

          <dl className="pointer-events-none absolute right-0 top-0 flex gap-6 p-6 text-right sm:p-8">
            <div>
              <dt className="eyebrow !text-white/70">{o.plasticLabel}</dt>
              <dd className="mt-1 text-[clamp(1.8rem,3.6vw,2.8rem)] leading-none tracking-[-0.05em]">{Math.round(plastic)}</dd>
            </div>
            <div>
              <dt className="eyebrow !text-white/70">{o.fishLabel}</dt>
              <dd className="mt-1 text-[clamp(1.8rem,3.6vw,2.8rem)] leading-none tracking-[-0.05em]">{Math.round(fishes)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-3 grid gap-1.5 sm:grid-cols-3" role="group" aria-label={o.title}>
          {SCENARIOS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setScenario(id)}
              aria-pressed={scenario === id}
              className={`rounded-[4px] p-4 text-left transition-colors ${scenario === id ? 'bg-brand' : 'bg-card hover:bg-slate'}`}
            >
              <p className="text-lg tracking-[-0.03em]">{o.scenarios[id]}</p>
              <p className={`mt-1 text-sm leading-snug ${scenario === id ? 'text-white/85' : 'text-white/50'}`}>{o.scenarioHint[id]}</p>
            </button>
          ))}
        </div>
      </Wrap>

      <Wrap className="grid gap-3 pt-10 md:grid-cols-2">
        <section className="rounded-[4px] bg-card p-6">
          <h2 className="text-xl tracking-[-0.03em]">{o.levelTitle}</h2>
          <p className="mt-3 font-mono text-[0.78rem] leading-relaxed text-white/80">{o.levelFormula}</p>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
              <dt className="text-white/55">{o.yourFootprint}</dt>
              <dd className="font-mono">{formatWeight(footprintKg, lang)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
              <dt className="text-white/55">{o.swapsSaved}</dt>
              <dd className="font-mono text-brand">−{formatWeight(swapSavedKg, lang)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-2">
              <dt className="text-white/55">{o.challengeSaved}</dt>
              <dd className="font-mono text-brand">−{formatWeight(challengeSavedKg, lang)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/55">{o.levelNow}</dt>
              <dd className="font-mono">{formatNumber(mineLevel, lang, 2)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <Btn to="/calculator" variant="ghost">
              {t.nav.calculator}
            </Btn>
            <Btn to="/swap" variant="ghost">
              {t.nav.swap}
            </Btn>
            <Btn to="/challenge" variant="ghost">
              {t.nav.challenge}
            </Btn>
          </div>
        </section>

        <section className="rounded-[4px] bg-card p-6">
          <h2 className="text-xl tracking-[-0.03em]">{o.scaleTitle}</h2>
          <p className="mt-2 text-sm text-white/55">{o.scaleBody}</p>
          <div className="mt-5 grid grid-cols-3 gap-1.5" role="group" aria-label={o.scaleTitle}>
            {o.scaleOptions.map((option) => (
              <button
                key={option.people}
                type="button"
                onClick={() => setPeople(option.people)}
                aria-pressed={people === option.people}
                className={`rounded-[4px] px-2 py-2.5 text-sm transition-colors ${people === option.people ? 'bg-white text-black' : 'bg-black text-white/70 hover:text-white'}`}
              >
                <span className="block">{option.label}</span>
                <span className="block font-mono text-[0.65rem] opacity-60">×{formatNumber(option.people, lang)}</span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-[clamp(2.2rem,4vw,3rem)] leading-none tracking-[-0.05em] text-brand">{formatWeight(groupKg, lang)}</p>
          <p className="mt-2 text-sm text-white/70">{o.scaleResult}</p>
        </section>
      </Wrap>

      <Wrap className="pt-8">
        <p className="max-w-3xl text-sm leading-relaxed text-white/45">{o.disclaimer}</p>
      </Wrap>
    </div>
  )
}
