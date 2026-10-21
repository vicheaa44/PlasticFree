import { Btn } from '../components/Btn'
import { PageHeader } from '../components/PageHeader'
import { Stepper } from '../components/Stepper'
import { Wrap } from '../components/SectionTitle'
import { usePlastic } from '../context/plastic'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../i18n/LanguageContext'
import { bottleEquivalents, calcFootprint, CATEGORIES, EU_PACKAGING_PER_PERSON_KG, TYPICAL_KG, type CategoryId } from '../utils/footprint'
import { formatNumber, formatWeight } from '../utils/format'

/** Bar segment colours, from white to blue, readable on the blue result panel. */
const SEGMENTS: Record<CategoryId, string> = {
  bottles: '#ffffff',
  bags: '#d9e6ff',
  food: '#000000',
  takeaway: '#0b3a8f',
  care: '#7aa9ff',
}

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template)
}

export function CalculatorPage() {
  const { t, lang } = useLanguage()
  const { answers, setAnswer, resetAnswers } = usePlastic()
  const c = t.calc

  const footprint = calcFootprint(answers)
  const shown = useCountUp(footprint.totalKg, 500)
  const diff = TYPICAL_KG > 0 ? ((footprint.totalKg - TYPICAL_KG) / TYPICAL_KG) * 100 : 0
  const pct = Math.round(Math.abs(diff))
  const euPct = Math.round((footprint.totalKg / EU_PACKAGING_PER_PERSON_KG) * 100)

  const ranked = CATEGORIES.map((category) => ({ id: category.id, kg: footprint.perCategory[category.id] })).sort((a, b) => b.kg - a.kg)
  const biggest = ranked[0].kg > 0 ? c.questions[ranked[0].id].label.toLowerCase() : null

  const typicalText =
    pct < 3
      ? fill(c.vsSame, { kg: formatWeight(TYPICAL_KG, lang) })
      : fill(c.vsTypical, { kg: formatWeight(TYPICAL_KG, lang), pct: String(pct), dir: diff < 0 ? c.less : c.more })

  return (
    <div>
      <PageHeader eyebrow={c.eyebrow} title={c.title} sub={c.sub} />

      <Wrap className="grid gap-4 pt-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-1.5">
          {CATEGORIES.map((category, i) => {
            const q = c.questions[category.id]
            return (
              <div key={category.id} className="rounded-[4px] bg-card p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-lg tracking-[-0.03em]">
                    <span className="mr-3 font-mono text-xs text-brand">{String(i + 1).padStart(2, '0')}</span>
                    {q.label}
                  </p>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">{formatWeight(footprint.perCategory[category.id], lang)}</p>
                </div>
                <p className="mb-4 mt-1 text-sm text-white/50">{q.unit}</p>
                <Stepper value={answers[category.id]} max={category.max} onChange={(value) => setAnswer(category.id, value)} label={q.label} />
              </div>
            )
          })}
          <div className="pt-2">
            <Btn variant="ghost" onClick={resetAnswers}>
              {c.resetTypical}
            </Btn>
          </div>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-[4px] bg-brand p-6 sm:p-7" aria-live="polite">
            <p className="eyebrow !text-white/70">{c.resultLabel}</p>
            <p className="mt-3 text-[clamp(3.4rem,7vw,5.2rem)] leading-none tracking-[-0.055em]">
              {formatNumber(shown, lang, 1)}
              <span className="ml-2 text-xl tracking-[-0.03em] text-white/80">kg</span>
            </p>
            <p className="mt-1 text-sm text-white/80">{c.perYear}</p>

            <p className="mt-5 text-lg leading-snug tracking-[-0.02em]">
              {fill(c.equals, { n: formatNumber(bottleEquivalents(footprint.totalKg), lang) })}
            </p>
            <p className="text-sm text-white/75">{fill(c.items, { n: formatNumber(footprint.itemsPerYear, lang) })}</p>

            <div className="mt-6">
              <p className="eyebrow mb-2 !text-white/70">{c.breakdown}</p>
              <div className="flex h-3 w-full overflow-hidden bg-black/30" role="img" aria-label={c.breakdown}>
                {ranked.map((row) =>
                  row.kg > 0 ? <span key={row.id} style={{ width: `${(row.kg / footprint.totalKg) * 100}%`, background: SEGMENTS[row.id] }} className="transition-[width] duration-500" /> : null,
                )}
              </div>
              <ul className="mt-3 space-y-1.5">
                {ranked.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2" style={{ background: SEGMENTS[row.id] }} />
                      {c.questions[row.id].label}
                    </span>
                    <span className="font-mono text-xs text-white/75">
                      {formatWeight(row.kg, lang)} · {footprint.totalKg > 0 ? Math.round((row.kg / footprint.totalKg) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-2 border-t border-white/25 pt-5 text-sm leading-snug text-white/90">
              <p>{typicalText}</p>
              <p>
                {fill(c.vsEu, { pct: String(euPct), kg: formatWeight(EU_PACKAGING_PER_PERSON_KG, lang) })}{' '}
                <span className="text-white/60">({c.euSource})</span>
              </p>
              {biggest && <p className="text-white">{fill(c.biggest, { name: biggest })}</p>}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Btn to="/swap" variant="white">
                {c.nextSwap}
              </Btn>
              <Btn to="/ocean" variant="ghost" className="!bg-black/25 hover:!bg-black/40">
                {c.nextOcean}
              </Btn>
            </div>
          </div>
        </aside>
      </Wrap>

      <Wrap className="pt-16">
        <details className="group rounded-[4px] bg-card p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-lg tracking-[-0.03em]">
            {c.howTitle}
            <span className="font-mono text-brand transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/60">
            <p className="font-mono text-[0.78rem] text-white/80">{c.howFormula}</p>
            <p>{c.howWeights}</p>
            <p>{c.howNote}</p>
          </div>
        </details>
      </Wrap>
    </div>
  )
}
