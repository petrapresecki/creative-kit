import { useRef } from 'react'
import { gsap, useGSAP, useScroller } from '@kit/lib/gsap'

export interface PullApartHeadingProps {
  left: string
  right: string
  className?: string
  scroller?: React.RefObject<HTMLElement | null>
}

/** Two words that start together and are pushed to opposite edges as the heading scrolls in (bleibtgleich.dev). */
export default function PullApartHeading({ left, right, className = '', scroller }: PullApartHeadingProps) {
  const heading = useRef<HTMLDivElement>(null)
  const scrollerEl = useScroller(scroller)

  useGSAP(
    () => {
      if (scrollerEl === undefined) return
      const el = heading.current!
      // Where the words sit side by side: their own widths plus the gap (scrollWidth would be the full row)
      const together = () => [...el.children].reduce((w, c) => w + c.getBoundingClientRect().width, 0) + parseFloat(getComputedStyle(el).columnGap || '0')
      gsap.fromTo(
        el,
        { width: together },
        {
          width: '100%',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 25%', scrub: true, invalidateOnRefresh: true, scroller: scrollerEl ?? undefined },
        },
      )
    },
    { dependencies: [left, right, scrollerEl] },
  )

  return (
    <div ref={heading} className={`flex justify-between gap-[0.3em] whitespace-nowrap ${className}`}>
      <h2>{left}</h2>
      <span>{right}</span>
    </div>
  )
}
