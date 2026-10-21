import { WideLink } from './Btn'
import { Scene, type SceneId } from './illustrations/scenes'

interface InfoCardProps {
  title: string
  bullets: string[]
  cta: string
  to: string
  scene: SceneId
}

/** The dark "Builders / Traders" card: a big title, an isometric scene, three bullet rows and a wide blue link. */
export function InfoCard({ title, bullets, cta, to, scene }: InfoCardProps) {
  return (
    <article className="flex flex-col rounded-[4px] bg-card p-3 sm:p-4">
      <div className="relative flex min-h-[15rem] items-start justify-between px-2 pt-2">
        <h3 className="text-[clamp(2rem,3.6vw,2.8rem)] leading-none tracking-[-0.04em]">{title}</h3>
        <Scene id={scene} className="absolute -top-2 right-0 w-[min(58%,17rem)]" />
      </div>
      <ul className="space-y-1.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="row-panel flex gap-3 text-[0.95rem] leading-snug tracking-[-0.02em]">
            <span className="mt-[0.45rem] h-2 w-2 shrink-0 bg-brand" aria-hidden="true" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <div className="mt-1.5">
        <WideLink to={to}>{cta}</WideLink>
      </div>
    </article>
  )
}
