import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import { prefersReducedMotion } from '@kit/lib/gsap'

export interface FuzzTypeProps {
  children: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'div'
  className?: string
  /** How far the edges bleed, in px (displacement scale) */
  fuzz?: number
  /** Fineness of the fibres: higher = shorter, hairier edges */
  grain?: number
  /** Softening on top of the fuzz, in px */
  soften?: number
  /** 0–1: strength of the halo around the letters */
  glow?: number
  /** Re-seed the noise a few times a second so the edges simmer */
  boil?: boolean
  /** Scale the font size so the text fills its container's width on one line */
  fit?: boolean
}

/**
 * From akulshinasonya.com: a big name whose edges feather out like ink in blotting
 * paper, with a soft halo, to sit over film or photos. Live text through one SVG
 * filter (turbulence → displacement → blur). Colour comes from the text colour.
 */
export default function FuzzType({
  children,
  as: Tag = 'h1',
  className = '',
  fuzz = 16,
  grain = 0.55,
  soften = 1.2,
  glow = 0.75,
  boil = true,
  fit = false,
}: FuzzTypeProps) {
  const root = useRef<HTMLElement>(null)
  const noise = useRef<SVGFETurbulenceElement>(null)
  const id = `fuzz-${useId().replace(/:/g, '')}`

  // Fit: measure at a known size, then scale to the container's width
  useLayoutEffect(() => {
    const el = root.current!
    if (!fit) {
      el.style.fontSize = ''
      return
    }
    const parent = el.parentElement!
    const size = () => {
      el.style.fontSize = '100px'
      const cs = getComputedStyle(parent)
      const inner = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      el.style.fontSize = `${(100 * inner) / el.scrollWidth}px`
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(parent)
    document.fonts?.ready.then(size)
    return () => ro.disconnect()
  }, [fit, children])

  useEffect(() => {
    if (!boil || prefersReducedMotion()) return
    let seed = 1
    const timer = window.setInterval(() => noise.current?.setAttribute('seed', String((seed = (seed % 50) + 1))), 120)
    return () => clearInterval(timer)
  }, [boil])

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <filter id={id} x="-10%" y="-25%" width="120%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={noise} type="fractalNoise" baseFrequency={grain} numOctaves={2} seed={1} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={fuzz} xChannelSelector="R" yChannelSelector="G" result="fuzz" />
          <feGaussianBlur in="fuzz" stdDeviation={soften} result="soft" />
          <feGaussianBlur in="fuzz" stdDeviation={fuzz * 1.4} result="halo" />
          <feComponentTransfer in="halo" result="haloFaint">
            <feFuncA type="linear" slope={glow} />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="haloFaint" />
            <feMergeNode in="soft" />
          </feMerge>
        </filter>
      </svg>
      <Tag
        ref={(el: HTMLElement | null) => {
          root.current = el
        }}
        className={`${fit ? 'inline-block whitespace-nowrap' : ''} ${className}`}
        style={{ filter: `url(#${id})` }}
      >
        {children}
      </Tag>
    </>
  )
}
