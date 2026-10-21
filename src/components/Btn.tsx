import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'blue' | 'white' | 'ghost'

interface BtnProps {
  variant?: Variant
  to?: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  children: ReactNode
  ariaLabel?: string
}

/** Link or button in the reference's flat 4px style. */
export function Btn({ variant = 'blue', to, href, onClick, disabled, type = 'button', className = '', children, ariaLabel }: BtnProps) {
  const classes = `btn btn-${variant} ${className}`
  if (to) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer noopener" aria-label={ariaLabel}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  )
}

export function Arrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

interface WideLinkProps {
  to?: string
  href?: string
  children: ReactNode
}

/** The wide blue bar with a square arrow button that closes each DeepBook card. */
export function WideLink({ to, href, children }: WideLinkProps) {
  const inner = (
    <>
      <span className="btn btn-blue flex-1 justify-end !rounded-r-none sm:!rounded-r-[4px] !py-3.5">{children}</span>
      <span className="btn btn-blue !px-4 !py-3.5">
        <Arrow />
      </span>
    </>
  )
  const classes = 'group flex gap-1.5'
  if (to) {
    return (
      <Link to={to} className={classes}>
        {inner}
      </Link>
    )
  }
  return (
    <a href={href} className={classes} target="_blank" rel="noreferrer noopener">
      {inner}
    </a>
  )
}
