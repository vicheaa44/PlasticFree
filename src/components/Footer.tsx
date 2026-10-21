import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

/** Full-bleed blue footer with the oversized wordmark cropped at the bottom edge. */
export function Footer() {
  const { t } = useLanguage()

  const tools = [
    { to: '/calculator', label: t.nav.calculator },
    { to: '/swap', label: t.nav.swap },
    { to: '/ocean', label: t.nav.ocean },
    { to: '/challenge', label: t.nav.challenge },
    { to: '/map', label: t.nav.map },
  ]
  const learn = [
    { to: '/problem', label: t.nav.problem },
    { to: '/solution', label: t.nav.solution },
    { to: '/about', label: t.nav.about },
  ]
  const sources = [
    { href: 'https://www.unep.org/interactives/beat-plastic-pollution/', label: 'UNEP' },
    { href: 'https://ourworldindata.org/plastic-pollution', label: 'Our World in Data' },
    { href: 'https://www.openstreetmap.org/copyright', label: 'OpenStreetMap' },
    { href: 'https://sdgs.un.org/goals/goal14', label: 'SDG 14' },
  ]

  const linkClass = 'block py-0.5 text-[0.95rem] tracking-[-0.02em] text-white transition-opacity hover:opacity-70'

  return (
    <footer className="relative mt-24 overflow-hidden bg-brand text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 pb-10 pt-16 sm:grid-cols-[1.2fr_1fr_1fr_1fr] sm:px-10">
        <div>
          <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
            <rect width="48" height="48" rx="9" fill="#fff" />
            <path d="M8 22c4-5 8-5 12 0s8 5 12 0 6-4 8-3v5c-2-1-4 0-8 3-4 5-8 5-12 0s-8-5-12 0z" fill="#1e6ef3" />
            <path d="M8 32c4-5 8-5 12 0s8 5 12 0 6-4 8-3v4c-2-1-4 0-8 3-4 5-8 5-12 0s-8-5-12 0z" fill="#1e6ef3" opacity=".55" />
          </svg>
          <p className="mt-5 max-w-[15rem] text-[0.95rem] leading-snug tracking-[-0.02em] text-white/85">{t.footer.line}</p>
        </div>
        <div>
          <p className="eyebrow !text-white/60">{t.footer.tools}</p>
          <ul className="mt-3">
            {tools.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-white/60">{t.footer.learn}</p>
          <ul className="mt-3">
            {learn.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-white/60">{t.footer.sources}</p>
          <ul className="mt-3">
            {sources.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer noopener" className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-6 pb-4 font-mono text-[0.7rem] uppercase tracking-[0.06em] text-white/60 sm:px-10">
        <span>© 2026 PlasticFree</span>
        <span>
          {t.footer.licence} · {t.footer.open}
        </span>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none select-none whitespace-nowrap text-center font-medium leading-[0.8] tracking-[-0.06em] text-white"
        style={{ fontSize: 'clamp(4rem, 17.5vw, 17rem)', marginBottom: '-0.2em' }}
      >
        PlasticFree
      </p>
    </footer>
  )
}
