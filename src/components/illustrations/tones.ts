/** Projection and palette for the isometric scenes. */

const COS = Math.cos(Math.PI / 6)
const SIN = 0.5
export const UNIT = 26
export const LINE = '#0b0b0b'

export interface Tone {
  top: string
  left: string
  right: string
  id: string
}

export const TONES = {
  blue: { top: '#3b86ff', left: '#1e6ef3', right: '#1352b8', id: 'blue' },
  white: { top: '#ffffff', left: '#ececec', right: '#c4c4c4', id: 'white' },
  black: { top: '#3a3a3a', left: '#1c1c1c', right: '#0d0d0d', id: 'black' },
  gray: { top: '#aab0b6', left: '#868c93', right: '#636970', id: 'gray' },
} satisfies Record<string, Tone>

export function pt(x: number, y: number, z: number): [number, number] {
  return [(x - y) * COS * UNIT, (x + y) * SIN * UNIT - z * UNIT]
}

export const COS_ISO = COS
export const SIN_ISO = SIN
