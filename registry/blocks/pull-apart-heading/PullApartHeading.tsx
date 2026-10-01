import { useRef } from 'react'
import { gsap, useGSAP } from '@kit/lib/gsap'

export interface PullApartHeadingProps {
  left: string
  right: string
  className?: string
  scroller?: React.RefObject<HTMLElement | null>
}

/** Two words that start together and are pushed to opposite edges as the heading scrolls in (bleibtgleich.dev). */
export default function PullApartHeading({ left, right, className = '', scroller }: PullApartHeadingProps) {
  const heading = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = heading.current!
      gsap.fromTo(
        el,
        { width: () => el.scrollWidth },
        {
          width: '100%',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 25%', scrub: true, invalidateOnRefresh: true, scroller: scroller?.current ?? undefined },
        },
      )
    },
    { dependencies: [left, right] },
  )

  return (
    <div ref={heading} className={`flex justify-between gap-[0.3em] whitespace-nowrap ${className}`}>
      <h2>{left}</h2>
      <span>{right}</span>
    </div>
  )
}
