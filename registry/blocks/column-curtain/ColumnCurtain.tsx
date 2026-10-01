import { useImperativeHandle, useRef, type Ref } from 'react'
import { gsap, prefersReducedMotion } from '@kit/lib/gsap'

export interface CurtainHandle {
  /** Cover the screen column by column, run `swap` (change page/content), then uncover */
  run: (swap: () => void | Promise<void>) => Promise<void>
}

export interface ColumnCurtainProps {
  ref?: Ref<CurtainHandle>
  /** Should match the site's grid */
  columns?: number
  /** Colour of the bars; defaults to the theme's ink */
  className?: string
  /** Seconds for each half of the transition */
  duration?: number
}

/**
 * Maximilian Kaspar's page transition: bars drop into each grid column to cover
 * the page, the content swaps underneath, then the bars shrink away.
 * Keep it fixed over the whole viewport (it is by default).
 */
export default function ColumnCurtain({ ref, columns = 4, className = 'bg-ink', duration = 0.55 }: ColumnCurtainProps) {
  const root = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    async run(swap) {
      const bars = root.current!.children
      if (prefersReducedMotion()) {
        await swap()
        return
      }
      await gsap.fromTo(
        bars,
        { scaleY: 0, transformOrigin: '50% 0%' },
        { scaleY: 1, duration, stagger: 0.06, ease: 'power3.inOut' },
      )
      await swap()
      await gsap.to(bars, { scaleY: 0, transformOrigin: '50% 100%', duration, stagger: 0.06, ease: 'power3.inOut' })
    },
  }))

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[80] grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className={`origin-top scale-y-0 ${className}`} />
      ))}
    </div>
  )
}
