import { useId, useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP, useScroller, prefersReducedMotion } from '@kit/lib/gsap'

export interface MeltTextProps {
  children: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span'
  className?: string
  /** Seconds before the first line starts */
  delay?: number
  /** Seconds between lines */
  stagger?: number
  /** How blurry each line starts (SVG stdDeviation) */
  blur?: number
  /** Reveal on mount instead of when scrolled into view */
  immediate?: boolean
  /** ScrollTrigger start, e.g. 'top 92%' */
  start?: string
  /** Scroll container, when the text lives inside one (a drawer, a demo frame) */
  scroller?: React.RefObject<HTMLElement | null>
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * "Melt" reveal from bleibtgleich.dev: each line starts as an invisible blur,
 * thickens into a gooey blob (blur + alpha threshold), then snaps sharp.
 */
export default function MeltText({
  children,
  as: Tag = 'p',
  className = '',
  delay = 0,
  stagger = 0.1,
  blur = 50,
  immediate = false,
  start = 'top 92%',
  scroller,
}: MeltTextProps) {
  const root = useRef<HTMLElement>(null)
  const defs = useRef<SVGDefsElement>(null)
  const uid = useId().replace(/:/g, '')
  const scrollerEl = useScroller(scroller)

  useGSAP(
    () => {
      if (prefersReducedMotion() || scrollerEl === undefined) return
      let revealed = false

      SplitText.create(root.current!, {
        type: 'lines',
        linesClass: 'kit-melt-line',
        tag: 'span',
        autoSplit: true,
        onSplit(self) {
          defs.current!.replaceChildren()
          if (revealed) return
          const tl = gsap.timeline({ paused: true, delay, onComplete: () => (revealed = true) })

          ;(self.lines as HTMLElement[]).forEach((line, i) => {
            const filter = document.createElementNS(SVG_NS, 'filter')
            filter.id = `melt-${uid}-${i}`
            filter.setAttribute('x', '-20%')
            filter.setAttribute('y', '-60%')
            filter.setAttribute('width', '140%')
            filter.setAttribute('height', '220%')
            const blurEl = document.createElementNS(SVG_NS, 'feGaussianBlur')
            const matrix = document.createElementNS(SVG_NS, 'feColorMatrix')
            matrix.setAttribute('type', 'matrix')
            filter.append(blurEl, matrix)
            defs.current!.append(filter)
            line.style.filter = `url(#${filter.id})`

            const state = { std: blur, a: 20, b: -8 }
            const apply = () => {
              blurEl.setAttribute('stdDeviation', String(state.std))
              matrix.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${state.a} ${state.b}`)
            }
            apply()

            const at = i * stagger
            tl.to(state, { std: 0, duration: 1.2, ease: 'power2.out', onUpdate: apply }, at)
              .to(state, { a: 1, b: 0, duration: 0.42, ease: 'none', onUpdate: apply }, at + 0.78)
              .call(() => (line.style.filter = 'none'), [], at + 1.25)
          })

          if (immediate) tl.play()
          else
            ScrollTrigger.create({
              trigger: root.current,
              start,
              once: true,
              scroller: scrollerEl ?? undefined,
              onEnter: () => tl.play(),
            })
          return tl
        },
      })
    },
    { scope: root, dependencies: [scrollerEl] },
  )

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <defs ref={defs} />
      </svg>
      <Tag
        ref={(el: HTMLElement | null) => {
          root.current = el
        }}
        className={className}
      >
        {children}
      </Tag>
    </>
  )
}
