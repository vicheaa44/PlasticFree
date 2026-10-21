/** The four small "+" marks in the corners of a panel. */
export function PlusCorners({ className = 'text-white/80' }: { className?: string }) {
  const mark = <span className={`absolute font-mono text-[0.8rem] leading-none ${className}`}>+</span>
  return (
    <>
      <span className="pointer-events-none absolute left-4 top-4" aria-hidden="true">{mark}</span>
      <span className="pointer-events-none absolute right-4 top-4" aria-hidden="true">{mark}</span>
      <span className="pointer-events-none absolute bottom-4 left-4" aria-hidden="true">{mark}</span>
      <span className="pointer-events-none absolute bottom-4 right-4" aria-hidden="true">{mark}</span>
    </>
  )
}
