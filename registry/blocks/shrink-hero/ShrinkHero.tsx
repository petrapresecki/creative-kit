import { useRef } from 'react'
import { gsap, useGSAP, useScroller, prefersReducedMotion } from '@kit/lib/gsap'

export interface ShrinkHeroProps {
  /** The background: an image, video or MosaicVideo, filling the hero */
  media: React.ReactNode
  /** Sits on the bottom edge and rides up with it */
  title: React.ReactNode
  /** Fraction of the hero height left as a band before it scrolls away */
  band?: number
  /** Height classes for the hero. Defaults to the full screen */
  className?: string
  scroller?: React.RefObject<HTMLElement | null>
}

/**
 * From locomotive.ca: scrolling down, the hero's bottom edge rises with the page while
 * its top and the media behind stay put, and the title rides up on that bottom edge.
 * Once only a band is left, the band scrolls away with the page.
 */
export default function ShrinkHero({ media, title, band = 1 / 3, className = 'h-svh', scroller }: ShrinkHeroProps) {
  const root = useRef<HTMLElement>(null)
  const scrollerEl = useScroller(scroller)

  useGSAP(
    () => {
      if (scrollerEl === undefined || prefersReducedMotion()) return
      const el = root.current!
      const travel = () => el.offsetHeight * (1 - band)
      // Clip the top by as much as we've scrolled and push the media down by the same,
      // so both look pinned while the bottom edge moves with the page
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => `+=${travel()}`,
            scrub: true,
            invalidateOnRefresh: true,
            scroller: scrollerEl ?? undefined,
          },
        })
        .fromTo(el, { clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: () => `inset(${travel()}px 0px 0px 0px)` }, 0)
        .fromTo('[data-shrink-media]', { y: 0 }, { y: travel }, 0)
    },
    { scope: root, dependencies: [band, scrollerEl] },
  )

  return (
    <section ref={root} className={`relative overflow-hidden bg-ink ${className}`}>
      <div data-shrink-media className="absolute inset-0">
        {media}
      </div>
      <div className="absolute inset-x-0 bottom-0">{title}</div>
    </section>
  )
}
