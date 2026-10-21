/** Blue tile with two waves, like the DeepBook mark but for water. */
export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="9" fill="#1e6ef3" />
      <path d="M8 22c4-5 8-5 12 0s8 5 12 0 6-4 8-3v5c-2-1-4 0-8 3-4 5-8 5-12 0s-8-5-12 0z" fill="#fff" />
      <path d="M8 32c4-5 8-5 12 0s8 5 12 0 6-4 8-3v4c-2-1-4 0-8 3-4 5-8 5-12 0s-8-5-12 0z" fill="#fff" opacity=".55" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-[1.15rem] font-medium tracking-[-0.04em] text-white">PlasticFree</span>
    </span>
  )
}
