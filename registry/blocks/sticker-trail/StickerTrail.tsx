import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '@kit/lib/gsap'
import orange from './orange.svg'
import cherries from './cherries.svg'
import star from './star.svg'

export interface StickerTrailProps {
  /** Cut-out images (transparent PNG or SVG). One is picked at random on mount */
  images?: string[]
  /** How many copies make up the trail */
  count?: number
  /** Sticker width in px */
  size?: number
  /** 0–1: how quickly each copy catches the one in front of it. Lower = longer trail */
  follow?: number
  /** Opacity of the last copy */
  fade?: number
  /** Clicking switches to the next image */
  cycleOnClick?: boolean
  children?: ReactNode
  className?: string
}

const DEFAULT_IMAGES = [orange, cherries, star]

/**
 * A cut-out sticker follows the pointer and leaves a chain of copies behind it.
 * Each copy eases toward the one in front, so a fast move fans them out and they
 * collapse into one when the pointer stops. Covers its children; wrap the page for
 * a site-wide trail. Mouse only; touch screens just get the children.
 */
export default function StickerTrail({
  images = DEFAULT_IMAGES,
  count = 24,
  size = 88,
  follow = 0.35,
  fade = 0.25,
  cycleOnClick = true,
  children,
  className = '',
}: StickerTrailProps) {
  const root = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(() => Math.floor(Math.random() * images.length))
  const [enabled] = useState(() => typeof window !== 'undefined' && matchMedia('(pointer: fine)').matches)
  // Reduced motion: one sticker, no chain
  const copies = enabled && prefersReducedMotion() ? 1 : count

  useEffect(() => {
    if (!enabled) return
    const el = root.current!
    const imgs = [...layer.current!.children] as HTMLElement[]
    const pos = imgs.map(() => ({ x: 0, y: 0 }))
    const target = { x: 0, y: 0 }
    let active = false

    const place = () => {
      imgs.forEach((img, i) => (img.style.transform = `translate3d(${pos[i].x}px, ${pos[i].y}px, 0) translate(-50%, -50%)`))
    }
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.x = e.clientX - r.left
      target.y = e.clientY - r.top
    }
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      local(e)
      pos.forEach(p => Object.assign(p, target))
      place()
      active = true
      gsap.to(layer.current, { opacity: 1, duration: 0.2, overwrite: true })
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!active) return enter(e)
      local(e)
    }
    const leave = () => {
      active = false
      gsap.to(layer.current, { opacity: 0, duration: 0.3, overwrite: true })
    }

    const tick = (_t: number, dt: number) => {
      if (!active) return
      // Frame-rate independent easing
      const k = 1 - Math.pow(1 - follow, dt / (1000 / 60))
      pos.forEach((p, i) => {
        const ahead = i === 0 ? target : pos[i - 1]
        p.x += (ahead.x - p.x) * k
        p.y += (ahead.y - p.y) * k
      })
      place()
    }

    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    gsap.ticker.add(tick)
    return () => {
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.ticker.remove(tick)
    }
  }, [enabled, follow, copies])

  const src = images[index % images.length]
  return (
    <div
      ref={root}
      className={`relative overflow-clip ${className}`}
      onClick={cycleOnClick && enabled ? () => setIndex(i => (i + 1) % images.length) : undefined}
    >
      {children}
      {enabled && (
        <div ref={layer} aria-hidden className="pointer-events-none absolute inset-0 z-30 opacity-0">
          {Array.from({ length: copies }, (_, i) => (
            <img
              key={i}
              src={src}
              alt=""
              draggable={false}
              width={size}
              className="absolute top-0 left-0 h-auto max-w-none will-change-transform select-none"
              style={{ zIndex: copies - i, opacity: copies === 1 ? 1 : 1 - (1 - fade) * (i / (copies - 1)) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
