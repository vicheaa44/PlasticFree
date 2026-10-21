import { HeroWaves } from '../components/HeroWaves'
import { Btn } from '../components/Btn'
import { InfoCard } from '../components/InfoCard'
import { Scene } from '../components/illustrations/scenes'
import { Reveal } from '../components/Reveal'
import { StackSection } from '../components/StackSection'
import { StatTile } from '../components/StatTile'
import { useLanguage } from '../i18n/LanguageContext'

export function HomePage() {
  const { t } = useLanguage()
  const h = t.home
  const tones = ['blue', 'black', 'slate', 'white'] as const

  return (
    <div>
      <section className="relative flex min-h-[calc(100svh-2.25rem)] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <HeroWaves />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(#000,transparent_25%,transparent_65%,#000_96%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-[radial-gradient(ellipse_70%_75%_at_50%_100%,rgba(0,0,0,0.88),rgba(0,0,0,0.55)_55%,transparent_100%)]" />
        <div className="relative px-6 pb-16 text-center sm:pb-20">
          <h1 className="rise-in mx-auto max-w-5xl text-[clamp(2.8rem,8.2vw,6.4rem)] leading-[0.98] tracking-[-0.045em] text-balance">{h.heroTitle}</h1>
          <p className="rise-in mx-auto mt-5 max-w-xl text-lg tracking-[-0.02em] text-white/85 sm:text-xl" style={{ animationDelay: '0.1s' }}>
            {h.heroSub}
          </p>
          <div className="rise-in mt-8 flex flex-wrap justify-center gap-2" style={{ animationDelay: '0.2s' }}>
            <Btn to="/challenge" variant="blue">
              {h.ctaPrimary}
            </Btn>
            <Btn to="/calculator" variant="white">
              {h.ctaSecondary}
            </Btn>
          </div>
        </div>
      </section>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-px flex items-center justify-between px-[max(1rem,calc((100%-1240px)/2))]" aria-hidden="true">
          <span className="h-1.5 w-1.5 bg-brand" />
          <span className="h-1.5 w-1.5 bg-brand" />
        </div>
      </div>

      <Reveal className="pt-20 sm:pt-28">
        <StackSection />
      </Reveal>

      <section className="px-4 pt-6 sm:px-6">
        <div className="mx-auto grid max-w-[1240px] gap-3 md:grid-cols-2">
          <Reveal>
            <InfoCard title={h.problemCard.title} bullets={h.problemCard.bullets} cta={h.problemCard.cta} to="/problem" scene="pile" />
          </Reveal>
          <Reveal delay={120}>
            <InfoCard title={h.solutionCard.title} bullets={h.solutionCard.bullets} cta={h.solutionCard.cta} to="/solution" scene="swap" />
          </Reveal>
        </div>
      </section>

      <section className="pt-24 sm:pt-32">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <p className="eyebrow mb-4">{h.statsEyebrow}</p>
        </div>
        <div className="mx-auto grid max-w-[1440px] sm:grid-cols-2 lg:grid-cols-4">
          {h.stats.map((stat, i) => (
            <StatTile key={stat.label} tone={tones[i]} value={stat.value} suffix={stat.suffix} label={stat.label} source={stat.source} />
          ))}
        </div>
      </section>

      <section className="px-4 pt-28 sm:px-6 sm:pt-40">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 md:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto w-full max-w-md">
              <Scene id="blocks" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.02] tracking-[-0.04em] text-balance">{h.openTitle}</h2>
            <p className="mt-5 max-w-lg text-lg leading-snug tracking-[-0.02em] text-white/60">{h.openBody}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {h.openChips.map((chip) => (
                <li key={chip} className="rounded-[4px] bg-card px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.05em] text-white/80">
                  {chip}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="mt-28 bg-white text-black sm:mt-40">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-6 py-20 sm:px-10 md:grid-cols-[1.2fr_1fr] sm:py-28">
          <Reveal>
            <h2 className="text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.045em] text-balance">{h.trustTitle}</h2>
            <p className="mt-6 max-w-lg text-lg leading-snug tracking-[-0.02em] text-black/55">{h.trustBody}</p>
            <div className="mt-8">
              <Btn to="/about" variant="blue">
                {h.trustCta}
              </Btn>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Scene id="calc" className="mx-auto w-full max-w-sm" />
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-4 pt-28 text-center sm:pt-40">
        <Reveal>
          <h2 className="mx-auto max-w-4xl text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.98] tracking-[-0.045em] text-balance">{h.ctaTitle}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Btn to="/challenge" variant="blue">
              {h.ctaPrimary}
            </Btn>
            <Btn to="/calculator" variant="white">
              {h.ctaSecondary}
            </Btn>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
