import { useRef } from 'react'
import { gsap, useGSAP, useScroller } from '@kit/lib/gsap'
import LazyVideo from '@kit/blocks/lazy-video/LazyVideo'

export interface ParallaxWindowProps {
  src: string
  type?: 'image' | 'video'
  alt?: string
  className?: string
  /** Fraction of the frame height the media travels while the frame crosses the screen */
  amount?: number
  scroller?: React.RefObject<HTMLElement | null>
}

/** Donut-studio window: a rounded frame with the media drifting inside it as you scroll. */
export default function ParallaxWindow({ src, type = 'image', alt = '', className = '', amount = 0.14, scroller }: ParallaxWindowProps) {
  const frame = useRef<HTMLDivElement>(null)
  const scrollerEl = useScroller(scroller)

  useGSAP(
    () => {
      if (scrollerEl === undefined) return
      gsap.fromTo(
        '[data-inner]',
        { yPercent: -amount * 100 },
        {
          yPercent: amount * 100,
          ease: 'none',
          scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true, scroller: scrollerEl ?? undefined },
        },
      )
    },
    { scope: frame, dependencies: [amount, scrollerEl] },
  )

  return (
    <div ref={frame} data-media className={`overflow-hidden rounded-kit bg-mist ${className}`}>
      <div data-inner className="h-[130%] -translate-y-[11.5%]">
        {type === 'video' ? (
          <LazyVideo src={src} className="h-full w-full object-cover" />
        ) : (
          <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
        )}
      </div>
    </div>
  )
}
