import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { usePlastic } from '../context/plastic'
import { useLanguage } from '../i18n/LanguageContext'
import { formatWeight } from '../utils/format'
import { Btn } from './Btn'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'

interface NavItem {
  to: string
  label: string
  index?: string
  end?: boolean
}

function NavGroup({ title, items, onNavigate }: { title?: string; items: NavItem[]; onNavigate?: () => void }) {
  return (
    <div>
      {title ? <p className="eyebrow px-3 pb-2 pt-4 !text-white/35">{title}</p> : <div className="h-3" />}
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-[4px] px-3 py-2 text-[0.95rem] tracking-[-0.02em] transition-colors ${
                  isActive ? 'bg-white/[0.07] text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`h-1.5 w-1.5 shrink-0 transition-colors ${isActive ? 'bg-brand' : 'bg-white/20 group-hover:bg-white/50'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.index && <span className="font-mono text-[0.65rem] text-white/30">{item.index}</span>}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { t, lang } = useLanguage()
  const { challengeSavedKg, swapSavedKg } = usePlastic()

  const learn: NavItem[] = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/problem', label: t.nav.problem },
    { to: '/solution', label: t.nav.solution },
  ]
  const tools: NavItem[] = [
    { to: '/calculator', label: t.nav.calculator, index: '01' },
    { to: '/swap', label: t.nav.swap, index: '02' },
    { to: '/ocean', label: t.nav.ocean, index: '03' },
    { to: '/challenge', label: t.nav.challenge, index: '04' },
    { to: '/map', label: t.nav.map, index: '05' },
  ]
  const other: NavItem[] = [{ to: '/about', label: t.nav.about }]

  return (
    <div className="flex h-full flex-col">
      <NavLink to="/" onClick={onNavigate} className="px-3 pb-2 pt-3" aria-label="PlasticFree">
        <Logo />
      </NavLink>

      <nav className="flex-1 overflow-y-auto pb-2" aria-label="Primary">
        <NavGroup title={t.nav.groupLearn} items={learn} onNavigate={onNavigate} />
        <NavGroup title={t.nav.groupTools} items={tools} onNavigate={onNavigate} />
        <NavGroup items={other} onNavigate={onNavigate} />
      </nav>

      <div className="space-y-3 pt-2">
        <div className="rounded-[4px] bg-black px-3 py-3">
          <p className="eyebrow !text-[0.62rem] !text-white/40">{t.nav.savedLabel}</p>
          <p className="mt-1 text-2xl tracking-[-0.04em] text-white">{formatWeight(challengeSavedKg, lang)}</p>
          <p className="eyebrow mt-2 !text-[0.62rem] !text-white/40">{t.nav.plannedLabel}</p>
          <p className="text-sm text-brand">
            −{formatWeight(swapSavedKg, lang)} <span className="text-white/40">{t.nav.perYear}</span>
          </p>
        </div>
        <LanguageSwitcher />
        <Btn to="/challenge" variant="blue" className="w-full">
          {t.nav.cta}
        </Btn>
      </div>
    </div>
  )
}

/** Fixed left navigation on large screens; a top bar with a slide-in drawer on small ones. */
export function Sidebar() {
  const { t } = useLanguage()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [drawerPath, setDrawerPath] = useState(location.pathname)

  // Close the drawer whenever the route changes (adjusting state during render, not in an effect).
  if (drawerPath !== location.pathname) {
    setDrawerPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <aside className="fixed bottom-3 left-3 top-3 z-40 hidden w-60 rounded-lg bg-card p-2 lg:block">
        <SidebarBody />
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-black/85 px-4 backdrop-blur lg:hidden">
        <NavLinkLogo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.nav.menu}
          aria-expanded={open}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-[4px] bg-card"
        >
          <span className="h-px w-5 bg-white" />
          <span className="h-px w-5 bg-white" />
          <span className="h-px w-3 self-end bg-white" style={{ marginRight: 10 }} />
        </button>
      </header>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={t.nav.menu}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t.nav.close}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute bottom-2 left-2 top-2 w-[min(19rem,calc(100vw-1rem))] rounded-lg bg-card p-2 transition-transform duration-500 ease-[var(--ease-out-expo)] ${
            open ? 'translate-x-0' : '-translate-x-[110%]'
          }`}
        >
          <SidebarBody onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </>
  )
}

function NavLinkLogo() {
  return (
    <NavLink to="/" aria-label="PlasticFree">
      <Logo />
    </NavLink>
  )
}
