interface SectionTitleProps {
  eyebrow?: string
  title: string
  dark?: boolean
  className?: string
}

export function SectionTitle({ eyebrow, title, dark = false, className = '' }: SectionTitleProps) {
  return (
    <div className={className}>
      {eyebrow && <p className={`eyebrow mb-3 ${dark ? '!text-black/50' : ''}`}>{eyebrow}</p>}
      <h2 className="max-w-3xl text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] tracking-[-0.04em] text-balance">{title}</h2>
    </div>
  )
}

/** Content column shared by every page. */
export function Wrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 sm:px-10 ${className}`}>{children}</div>
}
