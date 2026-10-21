import type { ReactNode } from 'react'
import { COS_ISO as COS, LINE, pt, SIN_ISO as SIN, TONES, UNIT, type Tone } from './tones'

/** Tiny isometric toolkit: boxes, cylinders and flat shapes drawn as flat-shaded SVG, in the DeepBook manner. */

function join(points: [number, number][]): string {
  return points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')
}

interface BoxProps {
  x: number
  y: number
  z?: number
  w: number
  d: number
  h: number
  tone: Tone
}

export function Box({ x, y, z = 0, w, d, h, tone }: BoxProps) {
  const top = join([pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x, y + d, z + h)])
  const left = join([pt(x, y + d, z + h), pt(x + w, y + d, z + h), pt(x + w, y + d, z), pt(x, y + d, z)])
  const right = join([pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x + w, y + d, z), pt(x + w, y, z)])
  return (
    <g stroke={LINE} strokeWidth={1} strokeLinejoin="round">
      <polygon points={left} fill={tone.left} />
      <polygon points={right} fill={tone.right} />
      <polygon points={top} fill={tone.top} />
    </g>
  )
}

interface CylProps {
  x: number
  y: number
  z?: number
  r: number
  h: number
  tone: Tone
}

export function Cyl({ x, y, z = 0, r, h, tone }: CylProps) {
  const [cx, yTop] = pt(x, y, z + h)
  const [, yBot] = pt(x, y, z)
  const rx = r * UNIT * Math.SQRT2 * COS
  const ry = r * UNIT * Math.SQRT2 * SIN
  const body = `M ${cx - rx} ${yTop} L ${cx - rx} ${yBot} A ${rx} ${ry} 0 0 0 ${cx + rx} ${yBot} L ${cx + rx} ${yTop} Z`
  return (
    <g stroke={LINE} strokeWidth={1} strokeLinejoin="round">
      <path d={body} fill={`url(#iso-${tone.id})`} />
      <ellipse cx={cx} cy={yTop} rx={rx} ry={ry} fill={tone.top} />
    </g>
  )
}

interface FlatProps {
  points: [number, number, number][]
  fill: string
}

/** A flat polygon lying on the ground plane (or at a height), used for arrows and roads. */
export function Flat({ points, fill }: FlatProps) {
  return <polygon points={join(points.map(([x, y, z]) => pt(x, y, z)))} fill={fill} stroke={LINE} strokeWidth={1} strokeLinejoin="round" />
}

interface BottleProps {
  x: number
  y: number
  z?: number
  r?: number
  h?: number
  tone: Tone
  cap?: Tone
}

/** A bottle: body, shoulder neck and cap. */
export function Bottle({ x, y, z = 0, r = 0.6, h = 2.4, tone, cap = TONES.blue }: BottleProps) {
  const neckH = h * 0.3
  return (
    <g>
      <Cyl x={x} y={y} z={z} r={r} h={h} tone={tone} />
      <Cyl x={x} y={y} z={z + h} r={r * 0.45} h={neckH} tone={tone} />
      <Cyl x={x} y={y} z={z + h + neckH} r={r * 0.52} h={0.22} tone={cap} />
    </g>
  )
}

/** Gradient definitions shared by every cylinder: left half light, right half dark, like a flat-shaded cut. */
export function IsoDefs() {
  return (
    <defs>
      {Object.values(TONES).map((tone) => (
        <linearGradient key={tone.id} id={`iso-${tone.id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={tone.left} />
          <stop offset="0.5" stopColor={tone.left} />
          <stop offset="0.5" stopColor={tone.right} />
          <stop offset="1" stopColor={tone.right} />
        </linearGradient>
      ))}
    </defs>
  )
}

interface IsoSvgProps {
  children: ReactNode
  className?: string
  label?: string
}

export function IsoSvg({ children, className = '', label }: IsoSvgProps) {
  return (
    <svg viewBox="-200 -190 400 380" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <IsoDefs />
      <g transform="translate(0,-70)">{children}</g>
    </svg>
  )
}

/** The base plate every scene stands on. */
export function Slab({ tone = TONES.blue, size = 8 }: { tone?: Tone; size?: number }) {
  return <Box x={0} y={0} w={size} d={size} h={0.7} tone={tone} />
}
