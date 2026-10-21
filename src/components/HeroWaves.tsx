import { useEffect, useRef } from 'react'

const STEP_X = 15
const STEP_Y = 24

function isBlue(gx: number, gy: number): boolean {
  return ((gx * 73856093) ^ (gy * 19349663)) % 47 === 0
}

/**
 * Concentric ripples built from vertical dashes, like the DeepBook hero but rising from the
 * waterline. The pointer drops a ripple of its own. Frozen on a single frame when the user prefers reduced motion.
 */
export function HeroWaves({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let frameId = 0
    let visible = true
    const ripple = { x: 0, y: 0, t: -1e9 }
    let lastRipple = 0

    function resize() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw(now: number) {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      const t = reduced ? 0 : now / 1000
      const cx = width * 0.5
      const cy = height * 1.12
      let gy = 0
      for (let y = 10; y < height; y += STEP_Y) {
        let gx = 0
        for (let x = 8; x < width; x += STEP_X) {
          const d = Math.hypot(x - cx, (y - cy) * 1.7)
          let wave = Math.sin(d / 46 - t * 1.1)
          const age = t - ripple.t
          if (age >= 0 && age < 2.2) {
            const rd = Math.hypot(x - ripple.x, (y - ripple.y) * 1.3)
            wave += Math.max(0, 1 - Math.abs(rd - age * 280) / 46) * (1 - age / 2.2) * 1.5
          }
          const k = Math.pow(Math.max(0, (wave + 1) / 2), 3)
          const len = 5 + k * 14
          const alpha = 0.09 + k * 0.86
          ctx.fillStyle = isBlue(gx, gy) && k > 0.5 ? `rgba(30,110,243,${Math.min(1, alpha + 0.15)})` : `rgba(255,255,255,${alpha})`
          ctx.fillRect(x, y - len / 2, 1.5, len)
          gx += 1
        }
        gy += 1
      }
    }

    function loop(now: number) {
      if (visible && !document.hidden) draw(now)
      frameId = requestAnimationFrame(loop)
    }

    function onMove(event: PointerEvent) {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return
      const now = performance.now()
      if (now - lastRipple < 420) return
      lastRipple = now
      ripple.x = x
      ripple.y = y
      ripple.t = now / 1000
    }

    // Resizing a canvas clears it; with reduced motion nothing redraws it on its own, so do it here.
    function onResize() {
      resize()
      if (reduced) draw(0)
    }

    resize()
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(canvas)
    window.addEventListener('resize', onResize)

    if (reduced) {
      draw(0)
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      frameId = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} aria-hidden="true" />
}
