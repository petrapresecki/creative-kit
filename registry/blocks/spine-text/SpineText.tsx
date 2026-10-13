import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, prefersReducedMotion, SplitText } from '@kit/lib/gsap'

export type SpineBlock =
  /** Text on one side of the spine: a grotesk heading, then a list (one line per item) and/or a paragraph */
  | { side: 'left' | 'right'; heading?: string; items?: string[]; text?: string }
  /** A chapter row: a big numeral on the spine with a label on each side */
  | { chapter: string; left?: string; right?: string }

export interface SpineTextProps {
  blocks: SpineBlock[]
  /** The object pinned on the spine while the text scrolls past (an image, video, canvas, 3D scene…) */
  children?: ReactNode
  /** Space kept between a line and the object's edge, px */
  clearance?: number
  /** Gap between the two columns, px */
  gap?: number
  /** How quickly lines catch up with the object, 0–1 per frame (1 = no easing) */
  follow?: number
  className?: string
}

interface Line {
  el: HTMLElement
  /** 1 pushes right (right column), -1 pushes left */
  dir: 1 | -1
  /** Line centre and half height, relative to the root's top */
  y: number
  half: number
  /** Most it may move before leaving the root */
  max: number
  x: number
}

/**
 * Gionatan Nese's About page: text on a centre spine, left blocks right-aligned and
 * right blocks left-aligned, with an object pinned in the middle. Every line that
 * passes the object is pushed sideways just far enough to clear its circle, so lists
 * and paragraphs bend around it as you scroll.
 */
export default function SpineText({ blocks, children, clearance = 20, gap = 40, follow = 0.18, className = '' }: SpineTextProps) {
  const root = useRef<HTMLDivElement>(null)
  const object = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current!
    let lines: Line[] = []

    // Cache where every line sits, so the ticker only reads two rects per frame
    const measure = () => {
      const top = el.getBoundingClientRect().top
      const half = el.clientWidth / 2
      lines = [...el.querySelectorAll<HTMLElement>('[data-spine-line]')].map(line => {
        const r = line.getBoundingClientRect()
        const dir = line.closest('[data-spine-side="right"]') ? 1 : -1
        const prev = lines.find(l => l.el === line)
        return { el: line, dir, y: r.top - top + r.height / 2, half: r.height / 2, max: Math.max(0, half - gap / 2 - r.width), x: prev?.x ?? 0 }
      })
    }

    // Paragraphs wrap to lines like normal text, then each line moves on its own
    const splits = [...el.querySelectorAll<HTMLElement>('[data-spine-text]')].map(p =>
      SplitText.create(p, {
        type: 'lines',
        autoSplit: true,
        onSplit: self => {
          for (const line of self.lines as HTMLElement[]) {
            line.dataset.spineLine = ''
            line.style.width = 'fit-content'
            if (p.closest('[data-spine-side="left"]')) line.style.marginLeft = 'auto'
          }
          measure()
        },
      }),
    )
    measure()

    const ease = prefersReducedMotion() ? 1 : follow
    const tick = () => {
      const box = object.current?.getBoundingClientRect()
      if (!box?.height) return
      const top = el.getBoundingClientRect().top
      const cy = box.top + box.height / 2 - top
      const r = Math.max(box.width, box.height) / 2 + clearance
      for (const line of lines) {
        // Half the chord of the object's circle at this line's height, less the gap the line already keeps
        const dy = Math.max(0, Math.abs(line.y - cy) - line.half)
        const target = dy < r ? Math.min(line.max, Math.max(0, Math.sqrt(r * r - dy * dy) - gap / 2)) * line.dir : 0
        const x = line.x + (target - line.x) * ease
        if (Math.abs(x - line.x) < 0.05 && Math.abs(target - x) < 0.05) continue
        line.x = Math.abs(target - x) < 0.05 ? target : x
        line.el.style.transform = `translate3d(${line.x.toFixed(2)}px, 0, 0)`
      }
    }

    // Only run while the block is on screen (the implicit root respects scroll containers too)
    let running = false
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === running) return
      running = entry.isIntersecting
      if (running) gsap.ticker.add(tick)
      else gsap.ticker.remove(tick)
    })
    io.observe(el)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts?.ready.then(measure)

    return () => {
      io.disconnect()
      ro.disconnect()
      gsap.ticker.remove(tick)
      splits.forEach(s => s.revert())
    }
  }, [blocks, clearance, gap, follow])

  const column = (side: 'left' | 'right', content: ReactNode, pad = 0) => (
    <div
      data-spine-side={side}
      className={side === 'left' ? 'mr-[50%] text-right' : 'ml-[50%] text-left'}
      style={side === 'left' ? { paddingRight: gap / 2 + pad } : { paddingLeft: gap / 2 + pad }}
    >
      {content}
    </div>
  )
  const line = (text: string, cls: string, key?: number) => (
    <div key={key} data-spine-line className={`w-fit ${cls}`}>
      {text}
    </div>
  )
  const edge = (side: 'left' | 'right') => (side === 'left' ? 'ml-auto' : '')

  return (
    <div ref={root} className={`relative overflow-x-clip ${className}`}>
      {/* The object rides the vertical centre of the scroll view; percentage insets on sticky use the scrollport */}
      <div className="pointer-events-none sticky top-1/2 z-10 h-0">
        <div ref={object} className="absolute left-1/2 w-fit -translate-x-1/2 -translate-y-1/2">
          {children}
        </div>
      </div>

      <div className="flex flex-col gap-24 md:gap-32">
        {blocks.map((block, i) =>
          'chapter' in block ? (
            // Both columns share one grid cell, so the labels sit on either side of the numeral
            <div key={i} className="relative grid items-center">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-headline">{block.chapter}</span>
              <div className="[grid-area:1/1]">{column('left', block.left && line(block.left, 'ml-auto text-body font-medium'), 24)}</div>
              <div className="[grid-area:1/1]">{column('right', block.right && line(block.right, 'text-body font-medium'), 24)}</div>
            </div>
          ) : (
            <div key={i}>
              {column(
                block.side,
                <>
                  {block.heading && line(block.heading, `${edge(block.side)} mb-6 text-body font-medium`)}
                  {block.items?.map((item, j) => line(item, `${edge(block.side)} font-display text-lead`, j))}
                  {block.text && (
                    <p data-spine-text className={`${edge(block.side)} max-w-[22em] font-display text-lead`}>
                      {block.text}
                    </p>
                  )}
                </>,
              )}
            </div>
          ),
        )}
      </div>
    </div>
  )
}
