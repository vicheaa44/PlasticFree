import { Btn } from '../components/Btn'
import { PageHeader } from '../components/PageHeader'
import { Wrap } from '../components/SectionTitle'
import { Stepper } from '../components/Stepper'
import { usePlastic } from '../context/plastic'
import { useLanguage } from '../i18n/LanguageContext'
import { TYPICAL_KG } from '../utils/footprint'
import { formatMoney, formatNumber, formatWeight } from '../utils/format'
import { defaultPerYear, SWAP_ITEMS, swapMoney, swapSavingKg, type SwapItem } from '../utils/swaps'

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template)
}

function sliderStep(max: number): number {
  if (max >= 400) return 10
  if (max >= 100) return 5
  return 1
}

export function SwapPage() {
  const { t, lang } = useLanguage()
  const { answers, swaps, swapQty, toggleSwap, setSwapQty, swapSavedKg } = usePlastic()
  const s = t.swap
  const sharePct = TYPICAL_KG > 0 ? Math.round((swapSavedKg / TYPICAL_KG) * 100) : 0

  function quantityOf(item: SwapItem): number {
    return swapQty[item.id] ?? defaultPerYear(item, answers)
  }

  return (
    <div>
      <PageHeader eyebrow={s.eyebrow} title={s.title} sub={s.sub} />

      <Wrap className="pt-2">
        <div className="sticky top-3 z-30 flex flex-wrap items-center justify-between gap-4 rounded-[4px] bg-brand p-4 sm:px-6" aria-live="polite">
          <div>
            <p className="eyebrow !text-white/70">{s.planTitle}</p>
            {swaps.length === 0 ? (
              <p className="mt-1 text-lg tracking-[-0.02em]">{s.planEmpty}</p>
            ) : (
              <>
                <p className="mt-1 text-lg tracking-[-0.02em]">{fill(s.planSummary, { n: String(swaps.length), kg: formatWeight(swapSavedKg, lang) })}</p>
                <p className="text-sm text-white/75">{fill(s.planShare, { pct: String(sharePct) })}</p>
              </>
            )}
          </div>
          <Btn to="/ocean" variant="white" disabled={swaps.length === 0}>
            {s.planCta}
          </Btn>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SWAP_ITEMS.map((item, i) => {
            const copy = s.items[item.id as keyof typeof s.items]
            const chosen = swaps.includes(item.id)
            const qty = quantityOf(item)
            const saved = swapSavingKg(item, qty)
            const money = swapMoney(item, qty)
            const sliderMax = Math.min(item.max, Math.max(Math.ceil((defaultPerYear(item, answers) * 3) / sliderStep(item.max)) * sliderStep(item.max), item.perYear * 3))
            const keeps = money.firstYearNet >= 0

            return (
              <article key={item.id} className={`flex flex-col gap-4 rounded-[4px] p-5 transition-colors ${chosen ? 'bg-slate ring-1 ring-brand' : 'bg-card'}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-xs text-brand">{String(i + 1).padStart(2, '0')}</p>
                  {chosen && <span className="rounded-[2px] bg-brand px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.05em]">{s.added}</span>}
                </div>

                <h3 className="text-[1.35rem] leading-tight tracking-[-0.035em]">{copy.name}</h3>

                <div className="row-panel">
                  <p className="eyebrow !text-[0.62rem]">{s.instead}</p>
                  <p className="mt-1 leading-snug tracking-[-0.02em]">{copy.alt}</p>
                </div>
                <p className="text-sm leading-snug text-white/50">{copy.note}</p>

                <dl className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                  <div>
                    <dt className="eyebrow !text-[0.62rem]">{s.saves}</dt>
                    <dd className="mt-1 text-2xl tracking-[-0.04em] text-brand">
                      {formatWeight(saved, lang)}
                      <span className="ml-1 text-xs text-white/40">{s.perYear}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow !text-[0.62rem]">{s.firstYear}</dt>
                    <dd className="mt-1 text-sm leading-snug tracking-[-0.02em]">
                      {keeps
                        ? fill(s.keeps, { amount: formatMoney(money.firstYearNet, lang) })
                        : fill(s.costs, { amount: formatMoney(-money.firstYearNet, lang) })}
                      <span className="mt-1 block text-xs text-white/45">
                        {money.paybackMonths !== null && money.paybackMonths <= 12
                          ? fill(s.payback, { n: formatNumber(Math.max(1, Math.round(money.paybackMonths)), lang) })
                          : s.paybackLater}
                      </span>
                    </dd>
                  </div>
                </dl>

                <div>
                  <p className="mb-2 text-xs text-white/45">{s.usesLabel}</p>
                  <Stepper value={qty} max={sliderMax} step={sliderStep(item.max)} onChange={(value) => setSwapQty(item.id, value)} label={copy.name} />
                </div>

                <Btn variant={chosen ? 'ghost' : 'blue'} onClick={() => toggleSwap(item.id)} className="mt-auto w-full">
                  {chosen ? s.remove : s.add}
                </Btn>
              </article>
            )
          })}
        </div>
        <p className="mt-6 text-sm text-white/45">{s.priceNote}</p>
      </Wrap>
    </div>
  )
}
