import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

const KEY = 'plasticfree-banner-dismissed'

function wasDismissed(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** The blue announcement strip at the top of the page, scrolling its message. */
export function Ticker() {
  const { t } = useLanguage()
  const [hidden, setHidden] = useState(wasDismissed)
  if (hidden) return null

  const item = (
    <Link to="/challenge" className="flex items-center gap-2 whitespace-nowrap px-6">
      <span>{t.banner.text}</span>
      <span aria-hidden="true">→</span>
      <span className="sr-only">{t.banner.cta}</span>
    </Link>
  )

  function dismiss() {
    setHidden(true)
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      // ignore — the banner simply reappears next visit
    }
  }

  return (
    <div className="relative flex h-9 items-center overflow-hidden bg-brand text-[0.78rem] tracking-[-0.01em] text-white">
      <div className="marquee-track flex w-max items-center">
        {item}
        {item}
        {item}
        {item}
        {item}
        {item}
        {item}
        {item}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.banner.dismiss}
        className="absolute right-0 top-0 flex h-9 w-10 items-center justify-center bg-brand/95 hover:bg-brand-deep"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" />
        </svg>
      </button>
    </div>
  )
}
