import { Bottle, Box, Cyl, Flat, IsoSvg, Slab } from './iso'
import { TONES } from './tones'

const Z = 0.7 // top of the slab

export type SceneId = 'calc' | 'swap' | 'ocean' | 'challenge' | 'map' | 'pile' | 'blocks'

/** Five bars that grow left to right, the last one blue: the footprint calculator. */
function ScCalc() {
  const bars = [
    { x: 1.2, h: 1.4, tone: TONES.white },
    { x: 2.6, h: 2.4, tone: TONES.gray },
    { x: 4.0, h: 1.9, tone: TONES.white },
    { x: 5.4, h: 3.3, tone: TONES.gray },
    { x: 6.8, h: 4.6, tone: TONES.blue },
  ]
  return (
    <IsoSvg label="Isometric bar chart of plastic">
      <Slab />
      {bars.map((bar) => (
        <Cyl key={bar.x} x={bar.x} y={4} z={Z} r={0.5} h={bar.h} tone={bar.tone} />
      ))}
    </IsoSvg>
  )
}

/** A grey plastic bottle, an arrow, a blue reusable bottle: the swap tool. */
function ScSwap() {
  return (
    <IsoSvg label="A plastic bottle swapped for a reusable one">
      <Slab />
      <Bottle x={1.9} y={4} z={Z} r={0.7} h={2.3} tone={TONES.gray} cap={TONES.white} />
      <Flat
        fill="#ffffff"
        points={[
          [3.3, 3.75, Z + 0.02],
          [4.15, 3.75, Z + 0.02],
          [4.15, 3.3, Z + 0.02],
          [5.0, 4, Z + 0.02],
          [4.15, 4.7, Z + 0.02],
          [4.15, 4.25, Z + 0.02],
          [3.3, 4.25, Z + 0.02],
        ]}
      />
      <Bottle x={6.1} y={4} z={Z} r={0.8} h={3.4} tone={TONES.blue} cap={TONES.black} />
    </IsoSvg>
  )
}

/** A block of water with plastic bits on top: the ocean simulation. */
function ScOcean() {
  const bits = [
    { x: 1.6, y: 2.0, tone: TONES.white },
    { x: 3.4, y: 5.1, tone: TONES.gray },
    { x: 5.2, y: 2.7, tone: TONES.white },
    { x: 5.9, y: 5.4, tone: TONES.black },
    { x: 2.3, y: 4.0, tone: TONES.black },
  ]
  return (
    <IsoSvg label="Isometric block of ocean with plastic pieces">
      <Slab tone={TONES.black} />
      <Box x={0.5} y={0.5} z={Z} w={7} d={7} h={1.9} tone={TONES.blue} />
      {bits.map((bit) => (
        <Box key={`${bit.x}-${bit.y}`} x={bit.x} y={bit.y} z={Z + 1.9} w={0.9} d={0.6} h={0.28} tone={bit.tone} />
      ))}
      <Bottle x={4.1} y={3.6} z={Z + 1.9} r={0.32} h={0.9} tone={TONES.white} cap={TONES.gray} />
    </IsoSvg>
  )
}

/** A 6 x 5 calendar of tiles, the first twelve filled in blue: the 30-day challenge. */
function ScChallenge() {
  const tiles = []
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const n = row * 6 + col
      const tone = n < 12 ? TONES.blue : n === 12 ? TONES.white : TONES.black
      tiles.push(
        <Box key={n} x={0.55 + col * 1.2} y={0.9 + row * 1.2} z={Z} w={1} d={1} h={n < 12 ? 0.55 : 0.25} tone={tone} />,
      )
    }
  }
  return (
    <IsoSvg label="Isometric 30-day calendar, tiles filling in">
      <Slab tone={TONES.gray} />
      {tiles}
    </IsoSvg>
  )
}

/** Roads and three pins: the map. */
function ScMap() {
  const pins = [
    { x: 2.2, y: 2.3, tone: TONES.blue },
    { x: 5.6, y: 3.0, tone: TONES.white },
    { x: 3.6, y: 5.8, tone: TONES.black },
  ]
  return (
    <IsoSvg label="Isometric map with three pins">
      <Slab tone={TONES.black} />
      <Flat
        fill="#2a2f34"
        points={[
          [0.4, 3.7, Z + 0.02],
          [7.6, 3.7, Z + 0.02],
          [7.6, 4.3, Z + 0.02],
          [0.4, 4.3, Z + 0.02],
        ]}
      />
      <Flat
        fill="#2a2f34"
        points={[
          [3.7, 0.4, Z + 0.02],
          [4.3, 0.4, Z + 0.02],
          [4.3, 7.6, Z + 0.02],
          [3.7, 7.6, Z + 0.02],
        ]}
      />
      <Box x={0.9} y={0.9} z={Z} w={2} d={2} h={0.5} tone={TONES.gray} />
      <Box x={5.1} y={4.9} z={Z} w={2} d={2} h={0.9} tone={TONES.gray} />
      {pins.map((pin) => (
        <g key={`${pin.x}-${pin.y}`}>
          <Cyl x={pin.x} y={pin.y} z={Z} r={0.12} h={1.8} tone={TONES.white} />
          <Box x={pin.x - 0.45} y={pin.y - 0.45} z={Z + 1.8} w={0.9} d={0.9} h={0.9} tone={pin.tone} />
        </g>
      ))}
    </IsoSvg>
  )
}

/** A crowd of grey and white bottles on a dark plate: the problem. */
function ScPile() {
  const bottles = [
    { x: 1.4, y: 1.4, h: 2.2, tone: TONES.gray },
    { x: 3.0, y: 1.2, h: 1.6, tone: TONES.white },
    { x: 4.6, y: 1.6, h: 2.6, tone: TONES.white },
    { x: 6.2, y: 1.3, h: 1.8, tone: TONES.gray },
    { x: 1.8, y: 3.3, h: 1.7, tone: TONES.white },
    { x: 3.5, y: 3.4, h: 2.8, tone: TONES.gray },
    { x: 5.3, y: 3.5, h: 2.0, tone: TONES.gray },
    { x: 6.7, y: 3.2, h: 2.5, tone: TONES.white },
    { x: 1.5, y: 5.3, h: 2.4, tone: TONES.gray },
    { x: 3.2, y: 5.5, h: 1.8, tone: TONES.white },
    { x: 5.0, y: 5.4, h: 3.0, tone: TONES.white },
    { x: 6.5, y: 5.6, h: 1.9, tone: TONES.gray },
  ]
  return (
    <IsoSvg label="A crowd of plastic bottles">
      <Slab tone={TONES.black} />
      {bottles.map((b) => (
        <Bottle key={`${b.x}-${b.y}`} x={b.x} y={b.y} z={Z} r={0.55} h={b.h} tone={b.tone} cap={b.x > 4.5 && b.y > 5 ? TONES.blue : TONES.black} />
      ))}
    </IsoSvg>
  )
}

/** Stacked blocks with studs, blue among grey and black: built on open data. */
function ScBlocks() {
  const studs = (x: number, y: number, cols: number, rows: number, z: number, tone: typeof TONES.blue) => {
    const out = []
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        out.push(<Cyl key={`${x}-${y}-${r}-${c}`} x={x + 0.5 + c} y={y + 0.5 + r} z={z} r={0.28} h={0.22} tone={tone} />)
      }
    }
    return out
  }
  return (
    <IsoSvg label="Isometric blocks">
      <Box x={0.3} y={0.3} w={4} d={4} h={0.9} tone={TONES.gray} />
      {studs(0.3, 0.3, 4, 4, 0.9, TONES.gray)}
      <Box x={4.3} y={0.3} w={3.4} d={4} h={0.9} tone={TONES.blue} />
      {studs(4.3, 0.3, 3, 4, 0.9, TONES.blue)}
      <Box x={2.3} y={4.3} w={4} d={3.4} h={0.9} tone={TONES.black} />
      {studs(2.3, 4.3, 4, 3, 0.9, TONES.black)}
    </IsoSvg>
  )
}

const SCENES: Record<SceneId, () => React.JSX.Element> = {
  calc: ScCalc,
  swap: ScSwap,
  ocean: ScOcean,
  challenge: ScChallenge,
  map: ScMap,
  pile: ScPile,
  blocks: ScBlocks,
}

export function Scene({ id, className }: { id: SceneId; className?: string }) {
  const Component = SCENES[id]
  return (
    <div className={className}>
      <Component />
    </div>
  )
}
