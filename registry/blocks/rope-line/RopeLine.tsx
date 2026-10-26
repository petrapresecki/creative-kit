import { useEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from '@kit/lib/gsap'

export interface RopeLineProps {
  /** Where the thread is pinned, as fractions of the box (x, y) */
  anchor?: [number, number]
  /** Thread length as a multiple of the box height. Above 1 it has slack to loop around */
  length?: number
  /** Number of segments. More = smoother curves */
  segments?: number
  /** Downward pull per frame, in px */
  gravity?: number
  /** 0–1: how quickly the held end catches the pointer */
  follow?: number
  /** Stroke width in px */
  width?: number
  children?: ReactNode
  className?: string
}

interface Point {
  x: number
  y: number
  px: number
  py: number
}

/**
 * From dieleerezwischendenzeilen.xyz: a loose hairline hangs over the content and the
 * pointer drags its free end around, so it loops between the words and settles slowly
 * when you stop. A small verlet simulation drawn as one SVG polyline. Colour comes from
 * the text colour (`text-ink`, `text-muted`…).
 */
export default function RopeLine({
  anchor = [0.3, 0],
  length = 1.6,
  segments = 48,
  gravity = 0.35,
  follow = 0.35,
  width = 1,
  children,
  className = '',
}: RopeLineProps) {
  const root = useRef<HTMLDivElement>(null)
  const line = useRef<SVGPolylineElement>(null)
  const [ax, ay] = anchor

  useEffect(() => {
    const el = root.current!
    const pts: Point[] = []
    let seg = 0
    let held: { x: number; y: number } | null = null
    const hand = { x: 0, y: 0 }
    let raf = 0
    let still = 0

    const reset = () => {
      const { clientWidth: w, clientHeight: h } = el
      seg = (h * length) / segments
      pts.length = 0
      for (let i = 0; i <= segments; i++) {
        const x = ax * w
        const y = ay * h + Math.min(i * seg, h)
        pts.push({ x, y, px: x, py: y })
      }
    }

    const step = () => {
      const { clientWidth: w, clientHeight: h } = el
      const end = pts[segments]
      let energy = 0
      for (let i = 1; i <= segments; i++) {
        const p = pts[i]
        const vx = (p.x - p.px) * 0.97
        const vy = (p.y - p.py) * 0.97
        p.px = p.x
        p.py = p.y
        p.x += vx
        p.y += vy + gravity
        energy += vx * vx + vy * vy
      }
      if (held) {
        hand.x += (held.x - hand.x) * follow
        hand.y += (held.y - hand.y) * follow
      }
      for (let k = 0; k < 24; k++) {
        pts[0].x = ax * w
        pts[0].y = ay * h
        if (held) {
          end.x = hand.x
          end.y = hand.y
        }
        for (let i = 0; i < segments; i++) {
          const a = pts[i]
          const b = pts[i + 1]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.hypot(dx, dy) || 0.001
          const diff = (d - seg) / d / 2
          if (i > 0) {
            a.x += dx * diff
            a.y += dy * diff
          }
          b.x -= dx * diff
          b.y -= dy * diff
        }
        // Keep it inside the box, resting on the bottom edge
        for (const p of pts) {
          p.x = Math.min(Math.max(p.x, 0), w)
          p.y = Math.min(Math.max(p.y, 0), h)
        }
      }
      line.current!.setAttribute('points', pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))
      return energy
    }
    const loop = () => {
      // Sleep once it has settled and nobody is holding it
      const energy = step()
      still = !held && energy < 0.02 * segments ? still + 1 : 0
      raf = still > 30 ? 0 : requestAnimationFrame(loop)
    }
    const wake = () => {
      still = 0
      if (!raf) raf = requestAnimationFrame(loop)
    }

    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const move = (e: PointerEvent) => {
      const p = local(e)
      if (!held) Object.assign(hand, pts[segments] ? { x: pts[segments].x, y: pts[segments].y } : p)
      held = p
      wake()
    }
    const leave = () => {
      held = null
      wake()
    }

    reset()
    if (prefersReducedMotion()) {
      // Let it fall into place once, then leave it still
      for (let i = 0; i < 300; i++) step()
      return
    }
    wake()
    const ro = new ResizeObserver(() => {
      reset()
      wake()
    })
    ro.observe(el)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [ax, ay, length, segments, gravity, follow])

  return (
    <div ref={root} className={`relative ${className}`}>
      {children}
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
        <polyline ref={line} fill="none" stroke="currentColor" strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}
