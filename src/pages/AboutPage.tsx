import { PageHeader } from '../components/PageHeader'
import { Reveal } from '../components/Reveal'
import { SectionTitle, Wrap } from '../components/SectionTitle'
import { useLanguage } from '../i18n/LanguageContext'

export function AboutPage() {
  const { t } = useLanguage()
  const a = t.about

  return (
    <div>
      <PageHeader eyebrow={a.eyebrow} title={a.title} sub={a.sub} />

      <Wrap className="grid gap-3 pt-4 md:grid-cols-2">
        <Reveal>
          <section className="h-full rounded-[4px] bg-brand p-7">
            <h2 className="text-2xl tracking-[-0.035em]">{a.problemTitle}</h2>
            <p className="mt-4 leading-snug tracking-[-0.02em] text-white/90">{a.problemBody}</p>
          </section>
        </Reveal>
        <Reveal delay={100}>
          <section className="h-full rounded-[4px] bg-card p-7">
            <h2 className="text-2xl tracking-[-0.035em]">{a.peopleTitle}</h2>
            <p className="mt-4 leading-snug tracking-[-0.02em] text-white/65">{a.peopleBody}</p>
          </section>
        </Reveal>
      </Wrap>

      <Wrap className="pt-24 sm:pt-32">
        <Reveal>
          <SectionTitle title={a.stackTitle} />
        </Reveal>
        <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {a.stack.map(([name, value]) => (
            <div key={name} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <dt className="eyebrow">{name}</dt>
              <dd className="leading-snug tracking-[-0.02em] text-white/80">{value}</dd>
            </div>
          ))}
        </dl>
      </Wrap>

      <Wrap className="grid gap-10 pt-24 md:grid-cols-[1fr_1.3fr] sm:pt-32">
        <Reveal>
          <SectionTitle title={a.honestTitle} />
        </Reveal>
        <ul className="space-y-1.5">
          {a.honest.map((line) => (
            <li key={line} className="row-panel flex gap-3 bg-card leading-snug tracking-[-0.02em]">
              <span className="mt-[0.45rem] h-2 w-2 shrink-0 bg-brand" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Wrap>

      <Wrap className="pt-24 sm:pt-32">
        <Reveal>
          <div className="grid gap-6 rounded-[4px] bg-card p-7 sm:p-10 md:grid-cols-[1fr_1.4fr]">
            <h2 className="text-[clamp(1.8rem,3.4vw,2.5rem)] leading-[1.05] tracking-[-0.04em]">{a.aiTitle}</h2>
            <p className="leading-snug tracking-[-0.02em] text-white/65">{a.aiBody}</p>
          </div>
        </Reveal>
      </Wrap>

      <Wrap className="pt-24 sm:pt-32">
        <Reveal>
          <SectionTitle title={a.sourcesTitle} />
        </Reveal>
        <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {a.sources.map(([label, href]) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noreferrer noopener" className="group flex items-center justify-between gap-4 py-4 tracking-[-0.02em] transition-colors hover:text-brand">
                <span>{label}</span>
                <span className="font-mono text-brand transition-transform group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-10 rounded-[4px] bg-card p-6">
          <h3 className="text-lg tracking-[-0.03em]">{a.licenceTitle}</h3>
          <p className="mt-2 text-sm text-white/55">{a.licenceBody}</p>
        </div>
      </Wrap>
    </div>
  )
}
