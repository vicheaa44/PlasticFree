import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  sub?: string
  children?: ReactNode
}

/** Opening of every inner page: mono eyebrow, a large tight headline and one line of context. */
export function PageHeader({ eyebrow, title, sub, children }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden px-6 pb-10 pt-14 sm:px-10 sm:pt-20 lg:pt-24">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="relative mx-auto max-w-[1200px]">
        <p className="eyebrow rise-in">{eyebrow}</p>
        <h1 className="rise-in mt-4 max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)] leading-[1.02] tracking-[-0.04em] text-balance" style={{ animationDelay: '0.08s' }}>
          {title}
        </h1>
        {sub && (
          <p className="rise-in mt-5 max-w-2xl text-lg leading-snug tracking-[-0.02em] text-white/60 sm:text-xl" style={{ animationDelay: '0.16s' }}>
            {sub}
          </p>
        )}
        {children && (
          <div className="rise-in mt-8" style={{ animationDelay: '0.24s' }}>
            {children}
          </div>
        )}
      </div>
    </header>
  )
}
