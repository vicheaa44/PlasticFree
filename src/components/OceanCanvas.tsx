import { useEffect, useRef } from 'react'
import { clamp, fishCount, plasticCount } from '../utils/ocean'

type PieceKind = 'bottle' | 'bag' | 'bit' | 'ring'

interface Piece {
  kind: PieceKind
  x: number
  /** 0 = on the surface, 1 = near the bottom. */
  depth: number
  vx: number
  size: number
  rot: number
  rotV: number
  phase: number
  alpha: number
  leaving: boolean
  grey: boolean
}

interface Fish {
  x: number
  y: number
  vx: number
  size: number
  phase: number
  alpha: number
  leaving: boolean
}

interface Ping {
  x: number
  y: number
  age: number
}

const KINDS: PieceKind[] = ['bottle', 'bottle', 'bottle', 'bag', 'bag', 'bit', 'bit', 'bit', 'bit', 'ring']

function mix(a: number, b: number, k: number): number {
  return a + (b - a) * k
}

function rgb(r: number, g: number, b: number, a = 1): string {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`
}

interface OceanCanvasProps {
  /** Target pollution level, 0 (clean) to 1.5. The scene eases toward it and adds or clears plastic as it moves. */
  level: number
  label: string
}

/**
 * The ocean: layered waves, plastic that drifts in and gets swept away, and fish that come and go.
 * Everything is drawn on a 2D canvas; with reduced motion it settles on a still frame instead of animating.
 */
export function OceanCanvas({ level, label }: OceanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const levelRef = useRef(level)
  const syncRef = useRef<() => void>(() => {})

  useEffect(() => {
    levelRef.current = level
    syncRef.current()
  }, [level])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let scale = 1
    let frameId = 0
    let last = performance.now()
    let visible = true
    let shown = levelRef.current
    const pieces: Piece[] = []
    const fish: Fish[] = []
    const pings: Ping[] = []

    const surfaceY = () => height * 0.26

    function resize() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      scale = Math.max(0.55, width / 900)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function waveAt(x: number, t: number): number {
      return Math.sin(x * 0.012 + t * 1.4) * 6 * scale + Math.sin(x * 0.027 - t * 0.9) * 3.5 * scale
    }

    function spawnPiece(instant: boolean) {
      const surface = Math.random() < 0.4
      pieces.push({
        kind: KINDS[Math.floor(Math.random() * KINDS.length)],
        x: Math.random() * width,
        depth: surface ? Math.random() * 0.05 : 0.06 + Math.pow(Math.random(), 1.4) * 0.8,
        vx: (Math.random() - 0.35) * 14,
        size: (0.8 + Math.random() * 0.7) * scale,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * 6.28,
        alpha: instant ? 1 : 0,
        leaving: false,
        grey: Math.random() < 0.4,
      })
    }

    function spawnFish(instant: boolean) {
      const dir = Math.random() < 0.5 ? -1 : 1
      fish.push({
        x: Math.random() * width,
        y: surfaceY() + (0.15 + Math.random() * 0.7) * (height - surfaceY()),
        vx: dir * (18 + Math.random() * 26),
        size: (0.8 + Math.random() * 0.8) * scale,
        phase: Math.random() * 6.28,
        alpha: instant ? 1 : 0,
        leaving: false,
      })
    }

    /** Move the number of pieces and fish toward what the level asks for. */
    function reconcile(instant: boolean) {
      const wantPlastic = plasticCount(levelRef.current)
      const wantFish = fishCount(levelRef.current)
      const livePieces = pieces.filter((p) => !p.leaving)
      const liveFish = fish.filter((f) => !f.leaving)

      if (livePieces.length < wantPlastic) {
        const n = instant ? wantPlastic - livePieces.length : Math.min(2, wantPlastic - livePieces.length)
        for (let i = 0; i < n; i += 1) spawnPiece(instant)
      } else if (livePieces.length > wantPlastic) {
        const n = instant ? livePieces.length - wantPlastic : Math.min(3, livePieces.length - wantPlastic)
        for (let i = 0; i < n; i += 1) {
          const victim = livePieces.splice(Math.floor(Math.random() * livePieces.length), 1)[0]
          if (instant) {
            pieces.splice(pieces.indexOf(victim), 1)
          } else {
            victim.leaving = true
            pings.push({ x: victim.x, y: surfaceY() + victim.depth * (height - surfaceY()), age: 0 })
          }
        }
      }

      if (liveFish.length < wantFish) {
        const n = instant ? wantFish - liveFish.length : 1
        for (let i = 0; i < n; i += 1) spawnFish(instant)
      } else if (liveFish.length > wantFish) {
        const n = instant ? liveFish.length - wantFish : 1
        for (let i = 0; i < n; i += 1) {
          const victim = liveFish.splice(Math.floor(Math.random() * liveFish.length), 1)[0]
          if (instant) fish.splice(fish.indexOf(victim), 1)
          else victim.leaving = true
        }
      }
    }

    function drawPiece(p: Piece, y: number, t: number) {
      if (!ctx) return
      const s = p.size
      ctx.save()
      ctx.translate(p.x, y)
      ctx.rotate(p.rot + Math.sin(t * 0.8 + p.phase) * 0.15)
      ctx.globalAlpha = p.alpha * (0.55 + (1 - p.depth) * 0.45)
      ctx.fillStyle = p.grey ? '#c3c8ce' : '#ffffff'
      ctx.strokeStyle = ctx.fillStyle
      if (p.kind === 'bottle') {
        ctx.fillRect(-5 * s, -11 * s, 10 * s, 18 * s)
        ctx.fillRect(-2.5 * s, -16 * s, 5 * s, 5 * s)
        ctx.fillStyle = '#1e6ef3'
        ctx.fillRect(-3 * s, -19 * s, 6 * s, 3 * s)
      } else if (p.kind === 'bag') {
        ctx.beginPath()
        ctx.moveTo(-9 * s, -4 * s)
        ctx.quadraticCurveTo(-11 * s, 9 * s, -3 * s, 11 * s)
        ctx.quadraticCurveTo(7 * s, 12 * s, 10 * s, 2 * s)
        ctx.quadraticCurveTo(4 * s, -9 * s, -9 * s, -4 * s)
        ctx.closePath()
        ctx.fill()
      } else if (p.kind === 'ring') {
        ctx.lineWidth = 2 * s
        ctx.beginPath()
        ctx.arc(0, 0, 6 * s, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        ctx.fillRect(-3.5 * s, -2 * s, 7 * s, 4 * s)
      }
      ctx.restore()
    }

    function drawFish(f: Fish, t: number) {
      if (!ctx) return
      const wiggle = Math.sin(t * 6 + f.phase) * 0.35
      const dir = f.vx >= 0 ? 1 : -1
      const s = f.size
      ctx.save()
      ctx.translate(f.x, f.y + Math.sin(t * 1.1 + f.phase) * 4 * scale)
      ctx.scale(dir, 1)
      ctx.globalAlpha = f.alpha * 0.9
      ctx.fillStyle = '#dce8ff'
      ctx.beginPath()
      ctx.ellipse(0, 0, 11 * s, 5 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-9 * s, 0)
      ctx.lineTo(-17 * s, (-5 + wiggle * 6) * s)
      ctx.lineTo(-17 * s, (5 + wiggle * 6) * s)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#000'
      ctx.globalAlpha = f.alpha * 0.8
      ctx.beginPath()
      ctx.arc(6 * s, -1 * s, 0.9 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function draw(now: number, dt: number) {
      if (!ctx) return
      const t = reduced ? 0 : now / 1000
      shown += (levelRef.current - shown) * Math.min(1, dt * 1.6)
      const murk = clamp(shown / 1.2, 0, 1)
      const sy = surfaceY()

      ctx.clearRect(0, 0, width, height)

      // Water body: bright blue and clear at the top, going grey-brown and dark as the level rises.
      const top = [mix(38, 74, murk), mix(124, 86, murk), mix(255, 78, murk)]
      const bottom = [mix(5, 14, murk), mix(36, 18, murk), mix(94, 20, murk)]
      const gradient = ctx.createLinearGradient(0, sy, 0, height)
      gradient.addColorStop(0, rgb(top[0], top[1], top[2]))
      gradient.addColorStop(1, rgb(bottom[0], bottom[1], bottom[2]))

      // Back wave, a little lighter, then the main surface.
      ctx.fillStyle = rgb(top[0], top[1], top[2], 0.45)
      ctx.beginPath()
      ctx.moveTo(0, height)
      for (let x = 0; x <= width; x += 8) ctx.lineTo(x, sy - 10 * scale + waveAt(x + 120, t + 1.3) * 0.9)
      ctx.lineTo(width, height)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(0, height)
      for (let x = 0; x <= width; x += 8) ctx.lineTo(x, sy + waveAt(x, t))
      ctx.lineTo(width, height)
      ctx.closePath()
      ctx.fill()

      // Fine white crest along the surface.
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let x = 0; x <= width; x += 8) {
        const y = sy + waveAt(x, t)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Fish swim behind the plastic.
      for (const f of fish) drawFish(f, t)

      for (const p of pieces) {
        const surfaceBob = p.depth < 0.06 ? waveAt(p.x, t) : Math.sin(t * 0.9 + p.phase) * 5 * scale
        const y = sy + 8 * scale + p.depth * (height - sy - 24 * scale) + surfaceBob - (p.leaving ? (1 - p.alpha) * 40 : 0)
        drawPiece(p, y, t)
      }

      // Rings where the clean-up sweeps a piece away.
      for (const ping of pings) {
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.7 - ping.age * 1.1)})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(ping.x, ping.y, 6 + ping.age * 46, 0, Math.PI * 2)
        ctx.stroke()
      }

      // A murky haze when it is bad.
      if (murk > 0.05) {
        ctx.fillStyle = `rgba(30,26,20,${murk * 0.28})`
        ctx.fillRect(0, sy - 12 * scale, width, height - sy + 12 * scale)
      }
    }

    function step(dt: number) {
      for (const p of pieces) {
        p.x += p.vx * dt * scale
        p.rot += p.rotV * dt
        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20
        if (p.leaving) p.alpha -= dt * 1.1
        else if (p.alpha < 1) p.alpha = Math.min(1, p.alpha + dt * 1.2)
      }
      for (let i = pieces.length - 1; i >= 0; i -= 1) if (pieces[i].alpha <= 0) pieces.splice(i, 1)

      for (const f of fish) {
        f.x += f.vx * dt * scale
        if (f.x < -30) f.x = width + 30
        if (f.x > width + 30) f.x = -30
        if (f.leaving) f.alpha -= dt * 0.8
        else if (f.alpha < 1) f.alpha = Math.min(1, f.alpha + dt * 0.8)
      }
      for (let i = fish.length - 1; i >= 0; i -= 1) if (fish[i].alpha <= 0) fish.splice(i, 1)

      for (const ping of pings) ping.age += dt
      for (let i = pings.length - 1; i >= 0; i -= 1) if (pings[i].age > 0.7) pings.splice(i, 1)
    }

    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (visible && !document.hidden) {
        reconcile(false)
        step(dt)
        draw(now, dt)
      }
      frameId = requestAnimationFrame(loop)
    }

    // Resizing a canvas clears it; with reduced motion nothing redraws it on its own, so do it here.
    function onResize() {
      resize()
      if (reduced) draw(0, 1)
    }

    resize()
    reconcile(true)

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(canvas)
    window.addEventListener('resize', onResize)

    if (reduced) {
      shown = levelRef.current
      draw(0, 1)
      syncRef.current = () => {
        reconcile(true)
        shown = levelRef.current
        draw(0, 1)
      }
    } else {
      frameId = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      syncRef.current = () => {}
    }
  }, [])

  return <canvas ref={canvasRef} className="block h-full w-full" role="img" aria-label={label} />
}
