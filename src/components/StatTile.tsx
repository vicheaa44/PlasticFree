import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'
import { useLanguage } from '../i18n/LanguageContext'
import { formatNumber } from '../utils/format'

type Tone = 'blue' | 'black' | 'slate' | 'white'

const TONES: Record<Tone, string> = {
  blue: 'bg-brand text-white',
  black: 'bg-black text-white border border-white/10',
  slate: 'bg-[#6f7782] text-white',
  white: 'bg-white text-black',
}

interface StatTileProps {
  tone: Tone
  value: number
  suffix?: string
  label: string
  source: string
}

/** One of the four coloured tiles that sit edge to edge: a big counting number, a label, a source. */
export function StatTile({ tone, value, suffix = '', label, source }: StatTileProps) {
  const { lang } = useLanguage()
  const { ref, seen } = useInView<HTMLDivElement>(0.4)
  const shown = useCountUp(seen ? value : 0, 1400)
  const text = value >= 1000 && suffix === '' ? String(Math.round(shown)) : formatNumber(shown, lang, 0)

  return (
    <div ref={ref} className={`relative flex min-h-[15rem] flex-col justify-between p-6 sm:p-7 ${TONES[tone]}`}>
      <span className="absolute right-4 top-4 h-1.5 w-1.5 bg-current" aria-hidden="true" />
      <p className="text-[clamp(2.6rem,5vw,4rem)] leading-none tracking-[-0.05em]">
        {text}
        {suffix}
      </p>
      <div>
        <p className="text-[0.95rem] leading-snug tracking-[-0.02em]">{label}</p>
        <p className={`mt-3 font-mono text-[0.65rem] uppercase tracking-[0.06em] ${tone === 'white' ? 'text-black/50' : 'text-white/55'}`}>{source}</p>
      </div>
    </div>
  )
}
