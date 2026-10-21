import { Btn } from '../components/Btn'
import { OwidEmbed, YoutubeEmbed } from '../components/Embeds'
import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { SectionTitle, Wrap } from '../components/SectionTitle'
import { useLanguage } from '../i18n/LanguageContext'

export function ProblemPage() {
  const { t } = useLanguage()
  const p = t.problem

  return (
    <div>
      <PageHeader eyebrow={p.eyebrow} title={p.title} sub={p.sub} />

      <Wrap className="pt-6">
        <p className="eyebrow mb-4">{p.statsEyebrow}</p>
        <div className="grid gap-3 md:grid-cols-3">
          {p.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100}>
              <div className="relative flex h-full min-h-[14rem] flex-col justify-between rounded-[4px] bg-card p-6">
                <span className="absolute right-4 top-4 h-1.5 w-1.5 bg-brand" aria-hidden="true" />
                <p className="text-[clamp(2.6rem,5vw,3.8rem)] leading-none tracking-[-0.05em]">{stat.value}</p>
                <div>
                  <p className="leading-snug tracking-[-0.02em]">{stat.label}</p>
                  <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.06em] text-white/45">{stat.source}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>

      <Wrap className="grid gap-10 pt-24 md:grid-cols-[1fr_1.3fr] sm:pt-32">
        <Reveal>
          <SectionTitle title={p.whyTitle} />
        </Reveal>
        <ul className="space-y-1.5">
          {p.why.map((line, i) => (
            <Reveal key={line} delay={i * 80}>
              <li className="row-panel flex gap-4 bg-card !p-5 leading-snug tracking-[-0.02em]">
                <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, '0')}</span>
                <span>{line}</span>
              </li>
            </Reveal>
          ))}
        </ul>
      </Wrap>

      <Wrap className="pt-24 sm:pt-32">
        <Reveal>
          <div className="grid gap-6 rounded-[4px] bg-brand p-7 sm:p-10 md:grid-cols-[1fr_1.3fr]">
            <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.05] tracking-[-0.04em] text-balance">{p.differTitle}</h2>
            <div>
              <p className="text-lg leading-snug tracking-[-0.02em] text-white/90">{p.differBody}</p>
              <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.06em] text-white/65">{p.differSources}</p>
            </div>
          </div>
        </Reveal>
      </Wrap>

      <Wrap className="pt-24 sm:pt-32">
        <Reveal>
          <SectionTitle eyebrow={p.chartEyebrow} title={p.chartTitle} />
          <div className="mt-8">
            <OwidEmbed slug="plastic-waste-emitted-to-the-ocean" title={p.chartTitle} source={p.chartSource} />
          </div>
        </Reveal>
      </Wrap>

      <Wrap className="grid gap-6 pt-24 md:grid-cols-2 sm:pt-32">
        <Reveal>
          <SectionTitle eyebrow={p.videoEyebrow} title={p.videoTitle} className="mb-6" />
          <YoutubeEmbed videoId="ROW9F-c0kIQ" title={p.videoTitle} credit={p.videoCredit} />
        </Reveal>
        <Reveal delay={120}>
          <div className="flex h-full flex-col justify-between rounded-[4px] bg-card p-7 sm:p-9">
            <div>
              <h2 className="text-[clamp(1.8rem,3.2vw,2.5rem)] leading-[1.05] tracking-[-0.04em] text-balance">{p.fishTitle}</h2>
              <p className="mt-5 leading-snug tracking-[-0.02em] text-white/65">{p.fishBody}</p>
            </div>
            <p className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.06em] text-white/45">{p.fishSource}</p>
          </div>
        </Reveal>
      </Wrap>

      <section className="mt-24 bg-white text-black sm:mt-32">
        <Wrap className="grid gap-8 py-16 sm:py-24 md:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <p className="eyebrow mb-3 !text-black/50">SDG 14</p>
            <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] leading-[1] tracking-[-0.045em] text-balance">{p.sdgTitle}</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-lg leading-snug tracking-[-0.02em] text-black/60">{p.sdgBody}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Btn href="https://sdgs.un.org/goals/goal14" variant="blue">
                {p.sdgCta}
              </Btn>
              <Btn to="/solution" variant="ghost" className="!text-black !shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] hover:!bg-black/5">
                {p.next}
              </Btn>
            </div>
          </Reveal>
        </Wrap>
      </section>
    </div>
  )
}
