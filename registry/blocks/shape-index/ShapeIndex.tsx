import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { prefersReducedMotion } from '@kit/lib/gsap'

export interface ShapeItem {
  id: string
  title: string
  /** Shown in brackets before the title, e.g. "01" */
  number?: string
  image: string
  /** SVG path data for the silhouette */
  shape: string
  /** viewBox of the path, e.g. "0 0 100 100" */
  viewBox: string
  /** Position and width on the stage, in % of its width/height */
  x: number
  y: number
  w: number
  /** Highlight behind the name while active, default the accent */
  color?: string
  href?: string
}

export interface ShapeIndexProps {
  items: ShapeItem[]
  /** Bold run-in label before the list */
  label?: string
  /** Stage proportions, width / height */
  aspect?: number
  /** How far each shape floats up and down, in px */
  float?: number
  onOpen?: (item: ShapeItem) => void
  className?: string
}

const durations = [6000, 5000, 7000, 4500, 5500]

/**
 * Eylon Malkevich's home: every project is a flat silhouette in one floating cluster,
 * named again in a run-in list below. Hover a shape or its name and the shape fills
 * with the project image (clipped to the same path); the name gets a colour block.
 * Touch screens cycle through the projects on their own.
 */
export default function ShapeIndex({ items, label = 'Projects:', aspect = 16 / 7, float = 10, onOpen, className = '' }: ShapeIndexProps) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '')
  const [active, setActive] = useState<string | null>(null)
  const shapes = useRef<(HTMLAnchorElement | null)[]>([])

  // Each shape breathes on its own loop so they never move in step
  useEffect(() => {
    if (prefersReducedMotion() || !float) return
    const anims = shapes.current.map((el, i) =>
      el?.animate(
        [{ transform: 'translateY(0)' }, { transform: `translateY(${float}px)` }, { transform: `translateY(${-float}px)` }, { transform: 'translateY(0)' }],
        { duration: durations[i % durations.length], iterations: Infinity, easing: 'ease-in-out', delay: -i * 700 },
      ),
    )
    return () => anims.forEach(a => a?.cancel())
  }, [float, items.length])

  // No hover on touch: show each project in turn
  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches || !items.length) return
    let i = 0
    const step = () => setActive(items[i++ % items.length].id)
    const first = setTimeout(step, 0)
    const t = setInterval(step, 2400)
    return () => {
      clearTimeout(first)
      clearInterval(t)
    }
  }, [items])

  const hover = (id: string | null) => () => {
    if (window.matchMedia('(hover: hover)').matches) setActive(id)
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative m-auto w-full" style={{ aspectRatio: aspect }}>
        {items.map((item, i) => {
          const [, , vw, vh] = item.viewBox.split(/[\s,]+/).map(Number)
          const on = active === item.id
          return (
            <a
              key={item.id}
              ref={el => {
                shapes.current[i] = el
              }}
              href={item.href}
              tabIndex={-1}
              aria-hidden
              onClick={() => onOpen?.(item)}
              onPointerEnter={hover(item.id)}
              onPointerLeave={hover(null)}
              className="absolute block cursor-pointer"
              style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, zIndex: on ? 2 : 1 }}
            >
              <svg viewBox={item.viewBox} className="block h-auto w-full overflow-visible">
                <clipPath id={`${uid}-${i}`}>
                  <path d={item.shape} />
                </clipPath>
                <path d={item.shape} className="fill-ink" />
                <image
                  href={item.image}
                  width={vw}
                  height={vh}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#${uid}-${i})`}
                  className={`transition-opacity duration-300 ease-out ${on ? 'opacity-100' : 'opacity-0'}`}
                />
              </svg>
            </a>
          )
        })}
      </div>

      <p className="text-headline pt-6 font-medium">
        <span className="font-bold uppercase">{label}</span>
        {items.map((item, i) => (
          <Fragment key={item.id}>
            {' '}
            <a
              href={item.href}
              onClick={() => onOpen?.(item)}
              onPointerEnter={hover(item.id)}
              onPointerLeave={hover(null)}
              onFocus={() => setActive(item.id)}
              onBlur={() => setActive(null)}
              style={active === item.id ? { background: item.color ?? 'var(--color-accent)' } : undefined}
              className="cursor-pointer px-[.12em] [box-decoration-break:clone] focus-visible:outline-none"
            >
              <span className="text-muted">[{item.number ?? String(i + 1).padStart(2, '0')}]</span>&nbsp;{item.title}
            </a>
          </Fragment>
        ))}
      </p>
    </div>
  )
}
