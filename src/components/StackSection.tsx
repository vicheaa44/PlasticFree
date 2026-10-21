import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { Btn } from './Btn'
import { Scene, type SceneId } from './illustrations/scenes'
import { PlusCorners } from './PlusCorners'

const SCENES: SceneId[] = ['calc', 'swap', 'ocean', 'challenge', 'map']
const ROUTES = ['/calculator', '/swap', '/ocean', '/challenge', '/map']
const INTERVAL_MS = 5000

/** The split panel: a blue slide on the left, an isometric scene in a white frame on a dotted grid on the right. */
export function StackSection() {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), INTERVAL_MS)
    return () => window.clearTimeout(id)
  }, [index, paused])

  const slide = t.home.slides[index]

  return (
    <section
      className="px-4 sm:px-6"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={t.home.stackEyebrow}
    >
      <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[2px] border border-white/15 md:min-h-[34rem] md:grid-cols-2">
        <div className="relative flex min-h-[26rem] flex-col items-center justify-center bg-brand px-8 py-16 text-center">
          <PlusCorners />
          <p className="absolute inset-x-0 top-5 text-[0.8rem] tracking-[-0.01em] text-white/90">{t.home.stackEyebrow}</p>
          <div key={index} className="rise-in max-w-md" aria-live="polite">
            <h3 className="text-[clamp(2.4rem,5.2vw,4rem)] leading-[1.02] tracking-[-0.04em]">{slide.title}</h3>
            <p className="mx-auto mt-5 text-lg leading-snug tracking-[-0.02em] text-white/85">{slide.body}</p>
            <div className="mt-7">
              <Btn to={ROUTES[index]} variant="white">
                {slide.cta}
              </Btn>
            </div>
          </div>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-[4px] bg-white/15 px-2.5 py-2">
            {SCENES.map((id, i) => (
              <button
                key={id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${t.home.slideCounter} ${i + 1}`}
                aria-current={i === index}
                className="relative h-1.5 overflow-hidden rounded-full bg-white/35 transition-[width] duration-500 ease-[var(--ease-out-expo)]"
                style={{ width: i === index ? 36 : 6 }}
              >
                {i === index && (
                  <span
                    key={`${index}-${paused}`}
                    className="absolute inset-y-0 left-0 bg-white"
                    style={{ width: '100%', animation: paused ? 'none' : `fill ${INTERVAL_MS}ms linear both` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="dot-grid relative flex min-h-[22rem] items-center justify-center bg-black py-10">
          <PlusCorners className="text-white/40" />
          <div className="relative aspect-square w-[min(72%,26rem)] overflow-hidden bg-white">
            {SCENES.map((id, i) => (
              <Scene
                key={id}
                id={id}
                className={`absolute inset-0 p-3 transition-[opacity,transform] duration-700 ease-[var(--ease-in-out-deep)] ${
                  i === index ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes fill { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    </section>
  )
}
