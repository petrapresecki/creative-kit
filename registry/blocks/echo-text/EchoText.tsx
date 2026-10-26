import { useRef, type CSSProperties } from 'react'
import { gsap, useGSAP, useScroller, prefersReducedMotion } from '@kit/lib/gsap'

export interface EchoTextProps {
  children: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'div'
  className?: string
  /** How many stacked copies pile up under the line */
  copies?: number
  /** Offset between copies, in px */
  dx?: number
  dy?: number
  /** Letter spacing the line drifts out to, in em (0 = none) */
  spread?: number
  /** Opacity of the deepest copy (the first stays at 1) */
  fade?: number
  /** ScrollTrigger start and end of the scrub */
  start?: string
  end?: string
  /** Scroll container, when the text lives inside one (a drawer, a demo frame) */
  scroller?: React.RefObject<HTMLElement | null>
}

/**
 * From dieleerezwischendenzeilen.xyz: a line stutters into a pile of offset copies
 * as it scrolls through, like an echo or a stuck feed, and can drift its letters apart.
 * Plain DOM, scrubbed with ScrollTrigger. Reduced motion shows the finished pile.
 */
export default function EchoText({
  children,
  as: Tag = 'p',
  className = '',
  copies = 10,
  dx = 2,
  dy = 7,
  spread = 0,
  fade = 0.35,
  start = 'top 85%',
  end = 'center 35%',
  scroller,
}: EchoTextProps) {
  const root = useRef<HTMLElement>(null)
  const scrollerEl = useScroller(scroller)
  const opacity = (i: number) => 1 - ((1 - fade) * (i + 1)) / copies

  useGSAP(
    () => {
      if (scrollerEl === undefined) return
      const echoes = gsap.utils.toArray<HTMLElement>('.kit-echo', root.current)
      const done = { x: (i: number) => dx * (i + 1), y: (i: number) => dy * (i + 1), opacity }
      if (prefersReducedMotion()) {
        gsap.set(echoes, done)
        gsap.set(root.current, { '--spread': `${spread}em` })
        return
      }
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start, end, scrub: true, scroller: scrollerEl ?? undefined } })
        .fromTo(echoes, { x: 0, y: 0, opacity: 0 }, { ...done, ease: 'none', stagger: 0.1 }, 0)
        .fromTo(root.current, { '--spread': '0em' }, { '--spread': `${spread}em`, ease: 'none', duration: 1 + copies * 0.1 }, 0)
    },
    { scope: root, dependencies: [scrollerEl, copies, dx, dy, spread, fade, start, end] },
  )

  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        root.current = el
      }}
      className={`relative ${className}`}
      style={{ '--spread': '0em', letterSpacing: 'var(--spread)' } as CSSProperties}
    >
      {Array.from({ length: copies }, (_, i) => (
        <span key={i} aria-hidden className="kit-echo pointer-events-none absolute inset-0 opacity-0 select-none">
          {children}
        </span>
      ))}
      <span className="relative">{children}</span>
    </Tag>
  )
}
