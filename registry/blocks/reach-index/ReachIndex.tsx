import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@kit/lib/gsap'
import CutType from '@kit/blocks/cut-type/CutType'
import GrainDissolve from '@kit/blocks/grain-dissolve/GrainDissolve'

export interface ReachIndexItem {
  id: string
  title: string
  /** Shown under the card, e.g. "Client / Website" */
  meta?: string
  image: string
}

export interface ReachIndexProps {
  items: ReachIndexItem[]
  onOpen?: (item: ReachIndexItem) => void
  className?: string
  /** How grainy the hovered title gets where it crosses the card (0–1) */
  grain?: number
  /** Scroll container, when the list lives inside one */
  scroller?: React.RefObject<HTMLElement | null>
}

const ALIGN = ['justify-start', 'justify-end', 'justify-center']

/**
 * Kokopako's work list: one small dark card waits mid-screen. Hover a title
 * and the card stretches over behind it, fills with the project, and the title
 * breaks into grain where it crosses the image.
 */
export default function ReachIndex({ items, onOpen, className = '', grain = 0.35, scroller }: ReachIndexProps) {
  const root = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const titles = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [shown, setShown] = useState(0)

  useGSAP(
    () => {
      const box = root.current!
      const el = card.current!

      const target = () => {
        const b = box.getBoundingClientRect()
        const title = active === null ? null : titles.current[active]
        if (title) {
          const t = title.getBoundingClientRect()
          const w = gsap.utils.clamp(b.width * 0.38, b.width * 0.62, t.width * 1.15)
          const h = w * 0.62
          return {
            x: gsap.utils.clamp(0, b.width - w, t.left - b.left + t.width / 2 - w / 2 + b.width * 0.04),
            y: Math.max(0, t.top - b.top - h * 0.12),
            width: w,
            height: h,
          }
        }
        // Resting: small, centred in whatever part of the list is on screen
        const view = scroller?.current?.getBoundingClientRect() ?? { top: 0, height: window.innerHeight }
        const w = Math.min(b.width * 0.2, 300)
        const h = w * 0.62
        return { x: b.width / 2 - w / 2, y: gsap.utils.clamp(0, b.height - h, view.top + view.height / 2 - b.top - h / 2), width: w, height: h }
      }

      gsap.to(el, { ...target(), duration: 0.9, ease: 'expo.out', overwrite: 'auto' })
      if (active !== null) return

      const follow = () => gsap.to(el, { ...target(), duration: 0.6, ease: 'power3.out', overwrite: 'auto' })
      // Capture catches scrolling in any container, so this works before the scroller's ref is attached
      window.addEventListener('scroll', follow, { capture: true, passive: true })
      window.addEventListener('resize', follow)
      return () => {
        window.removeEventListener('scroll', follow, { capture: true })
        window.removeEventListener('resize', follow)
      }
    },
    { scope: root, dependencies: [active, items.length] },
  )

  const enter = (i: number) => {
    setActive(i)
    setShown(i)
  }

  return (
    <div ref={root} className={`relative ${className}`} onMouseLeave={() => setActive(null)}>
      {/* The card: one element that travels between titles */}
      <div ref={card} aria-hidden className="pointer-events-none absolute top-0 left-0 z-0 hidden md:block">
        <div data-media className="relative h-full w-full overflow-hidden rounded-kit bg-ink">
          {items.map((item, i) => (
            <img
              key={item.id}
              src={item.image}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,scale] duration-700 ease-out-expo ${
                active !== null && i === shown ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
              }`}
            />
          ))}
        </div>
        {items[shown]?.meta && (
          <p className={`caption absolute top-full left-0 mt-3 transition-opacity duration-300 ${active === null ? 'opacity-0' : 'opacity-100'}`}>{items[shown].meta}</p>
        )}
      </div>

      <ul className="relative z-10">
        {items.map((item, i) => (
          <li key={item.id} className={`flex py-[6vh] md:py-[9vh] ${ALIGN[i % ALIGN.length]}`}>
            <button
              ref={el => {
                titles.current[i] = el
              }}
              onMouseEnter={() => enter(i)}
              onFocus={() => enter(i)}
              onBlur={() => setActive(null)}
              onClick={() => onOpen?.(item)}
              className="relative max-w-full text-left"
            >
              <GrainDissolve mode="manual" amount={active === i ? grain : 0}>
                <CutType as="span" text={item.title} seed={i * 11 + 3} className="block text-display" />
              </GrainDissolve>
              <span
                className={`caption absolute right-0 bottom-[0.6em] translate-x-1/3 grid size-14 place-items-center rounded-full bg-ink text-paper normal-case transition-[scale,opacity] duration-500 ease-out-expo ${
                  active === i ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
              >
                {i + 1} / {items.length}
              </span>
              {/* Touch screens can't hover, so the image sits under the title */}
              <img src={item.image} alt="" loading="lazy" className="mt-4 aspect-video w-full rounded-kit object-cover md:hidden" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
