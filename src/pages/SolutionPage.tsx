import { Link } from 'react-router-dom'
import { Btn } from '../components/Btn'
import { Scene, type SceneId } from '../components/illustrations/scenes'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { SectionTitle, Wrap } from '../components/SectionTitle'
import { useLanguage } from '../i18n/LanguageContext'
import { TYPICAL_ANSWERS } from '../utils/footprint'
import { formatWeight } from '../utils/format'
import { SWAP_ITEMS, totalSwapSavingKg } from '../utils/swaps'

const TOOLS: { to: string; scene: SceneId }[] = [
  { to: '/calculator', scene: 'calc' },
  { to: '/swap', scene: 'swap' },
  { to: '/ocean', scene: 'ocean' },
  { to: '/challenge', scene: 'challenge' },
  { to: '/map', scene: 'map' },
]

const ORG_LINKS = ['https://www.unep.org/interactives/beat-plastic-pollution/', 'https://theoceancleanup.com', 'https://www.ellenmacarthurfoundation.org/']

export function SolutionPage() {
  const { t, lang } = useLanguage()
  const s = t.solution
  const allSwapsKg = totalSwapSavingKg(
    SWAP_ITEMS.map((item) => item.id),
    {},
    TYPICAL_ANSWERS,
  )

  return (
    <div>
      <PageHeader eyebrow={s.eyebrow} title={s.title} sub={s.sub} />

      <Wrap className="pt-6">
        <p className="eyebrow mb-4">{s.stepsEyebrow}</p>
        <ol className="grid border border-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {s.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 90}>
              <li className="relative h-full min-h-[15rem] border-white/15 p-6 sm:border-r sm:[&:nth-child(even)]:border-r-0 lg:[&:nth-child(even)]:border-r lg:last:border-r-0">
                <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-10 text-[clamp(1.6rem,2.6vw,2.1rem)] leading-none tracking-[-0.04em]">{step.title}</h3>
                <p className="mt-3 leading-snug tracking-[-0.02em] text-white/60">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Wrap>

      <Wrap className="pt-24 sm:pt-32">
        <Reveal>
          <SectionTitle eyebrow={s.toolkitEyebrow} title={s.toolkitTitle} />
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.to} delay={i * 70}>
              <Link to={tool.to} className="group flex h-full flex-col rounded-[4px] bg-card p-3 transition-colors hover:bg-slate">
                <div className="overflow-hidden bg-white">
                  <Scene id={tool.scene} className="p-2 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </div>
                <p className="mt-4 font-mono text-[0.65rem] text-brand">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-1 text-lg leading-tight tracking-[-0.03em]">{s.toolkit[i].title}</p>
                <p className="mt-1 text-sm text-white/50">{s.toolkit[i].body}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Wrap>

      <Wrap className="pt-24 sm:pt-32">
        <Reveal>
          <div className="grid gap-6 rounded-[4px] bg-brand p-7 sm:p-10 md:grid-cols-[1fr_1.4fr]">
            <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.05] tracking-[-0.04em]">{s.payTitle}</h2>
            <div>
              <p className="text-lg leading-snug tracking-[-0.02em] text-white/90">{s.payBody.replace('{kg}', formatWeight(allSwapsKg, lang))}</p>
              <div className="mt-6">
                <Btn to="/swap" variant="white">
                  {t.nav.swap}
                </Btn>
              </div>
            </div>
          </div>
        </Reveal>
      </Wrap>

      <Wrap className="pt-24 sm:pt-32">
        <Reveal>
          <SectionTitle eyebrow={s.orgsEyebrow} title="#BeatPlasticPollution" />
        </Reveal>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {s.orgs.map((org, i) => (
            <Reveal key={org.name} delay={i * 90}>
              <div className="flex h-full flex-col justify-between rounded-[4px] bg-card p-6">
                <div>
                  <h3 className="text-xl leading-tight tracking-[-0.03em]">{org.name}</h3>
                  <p className="mt-3 leading-snug text-white/60">{org.body}</p>
                </div>
                <div className="mt-8">
                  <Btn href={ORG_LINKS[i]} variant="ghost">
                    {org.cta}
                  </Btn>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>

      <Wrap className="grid gap-10 pt-24 md:grid-cols-[1fr_1.3fr] sm:pt-32">
        <Reveal>
          <SectionTitle title={s.tipsTitle} />
        </Reveal>
        <div>
          <ul className="space-y-1.5">
            {s.tips.map((tip, i) => (
              <Reveal key={tip} delay={i * 60}>
                <li className="row-panel flex gap-3 bg-card leading-snug tracking-[-0.02em]">
                  <span className="mt-[0.45rem] h-2 w-2 shrink-0 bg-brand" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              </Reveal>
            ))}
          </ul>
          <p className="mt-5 text-sm text-white/45">{s.tipsNote}</p>
        </div>
      </Wrap>
    </div>
  )
}
