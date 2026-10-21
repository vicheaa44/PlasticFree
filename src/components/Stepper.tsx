interface StepperProps {
  value: number
  min?: number
  max: number
  step?: number
  onChange: (value: number) => void
  label: string
  /** Text shown next to the number, e.g. "per week". Optional. */
  unit?: string
}

/** A range slider with minus / plus buttons and a big number, for quick tweaking on a phone or with a mouse. */
export function Stepper({ value, min = 0, max, step = 1, onChange, label, unit }: StepperProps) {
  const clamp = (n: number) => Math.min(Math.max(n, min), max)
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`${label} −`}
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        className="btn btn-ghost !h-9 !w-9 !p-0 text-lg leading-none"
      >
        −
      </button>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        aria-label={`${label} +`}
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        className="btn btn-ghost !h-9 !w-9 !p-0 text-lg leading-none"
      >
        +
      </button>
      <p className="w-16 shrink-0 text-right text-2xl tracking-[-0.04em]">
        {value}
        {unit && <span className="ml-1 text-xs text-white/40">{unit}</span>}
      </p>
    </div>
  )
}
