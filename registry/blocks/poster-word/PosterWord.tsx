import { useId, useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@kit/lib/gsap'

export interface Colourway {
  /** Any CSS colour, including theme tokens like var(--color-accent) */
  fill: string
  stroke?: string
  /** Shadow colour; leave out for no shadow */
  shadow?: string
  background?: string
  /** Photo behind the word (covers the background colour) */
  image?: string
}

export interface PosterWordProps {
  text: string
  colourways?: Colourway[]
  /** Fixed colourway; leave out to pick one at random on mount */
  index?: number
  /** Clicking moves on to the next colourway */
  cycleOnClick?: boolean
  /** Stroke width and shadow offset, as a fraction of the font size */
  strokeWidth?: number
  shadowOffset?: number
  font?: 'display' | 'sans'
  className?: string
}

const DEFAULT_COLOURWAYS: Colourway[] = [
  { background: 'var(--color-mist)', fill: 'var(--color-accent)', stroke: 'var(--color-paper)', shadow: 'var(--color-ink)' },
  { background: 'var(--color-accent)', fill: 'var(--color-paper)', stroke: 'var(--color-ink)', shadow: 'var(--color-ink)' },
  { background: 'var(--color-paper)', fill: 'var(--color-ink)', shadow: 'var(--color-accent)' },
]

// The word is laid out at this size in SVG units, then the viewBox is fitted to it
const FONT_SIZE = 100

/**
 * One word fitted edge to edge as SVG text, with a fill, a stroke and a hard
 * offset shadow (an feOffset + feFlood filter, no blur). A random colourway is
 * picked on each visit, so the hero looks a little different every time.
 */
export default function PosterWord({
  text,
  colourways = DEFAULT_COLOURWAYS,
  index,
  cycleOnClick = true,
  strokeWidth = 0.008,
  shadowOffset = 0.013,
  font = 'display',
  className = '',
}: PosterWordProps) {
  const svg = useRef<SVGSVGElement>(null)
  const word = useRef<SVGTextElement>(null)
  const filterId = `poster-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const [picked, setPicked] = useState(() => Math.floor(Math.random() * colourways.length))
  const [box, setBox] = useState<[number, number, number, number] | null>(null)
  const current = index ?? picked
  const way = colourways[current % colourways.length]

  // Fit the viewBox to the glyphs once the font has loaded
  useLayoutEffect(() => {
    let live = true
    const measure = () => {
      if (!live || !word.current) return
      const b = word.current.getBBox()
      const pad = FONT_SIZE * (shadowOffset + strokeWidth)
      setBox([b.x - pad / 2, b.y, b.width + pad * 1.5, b.height + pad])
    }
    measure()
    document.fonts?.ready.then(measure)
    return () => {
      live = false
    }
  }, [text, font, shadowOffset, strokeWidth])

  const next = () => {
    if (index !== undefined) return
    setPicked(i => (i + 1) % colourways.length)
    if (!prefersReducedMotion() && svg.current) {
      gsap.fromTo(svg.current, { scale: 0.97 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', overwrite: true })
    }
  }

  const offset = FONT_SIZE * shadowOffset
  return (
    <div
      className={`relative overflow-hidden ${cycleOnClick && index === undefined ? 'cursor-pointer' : ''} ${className}`}
      style={{ background: way.background }}
      onClick={cycleOnClick ? next : undefined}
    >
      {way.image && <img src={way.image} alt="" className="absolute inset-0 size-full object-cover" />}
      <svg
        ref={svg}
        role="img"
        aria-label={text}
        viewBox={box ? box.join(' ') : `0 -${FONT_SIZE} ${FONT_SIZE * text.length * 0.6} ${FONT_SIZE * 1.2}`}
        className="relative block h-auto w-full overflow-visible"
      >
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="130%" height="140%">
            <feOffset dx={offset} dy={offset} in="SourceAlpha" result="moved" />
            <feFlood style={{ floodColor: way.shadow ?? 'transparent' }} />
            <feComposite operator="in" in2="moved" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <text
          ref={word}
          aria-hidden
          x={0}
          y={0}
          fontSize={FONT_SIZE}
          filter={way.shadow ? `url(#${filterId})` : undefined}
          className={font === 'display' ? 'font-display' : 'font-sans'}
          style={{
            fill: way.fill,
            stroke: way.stroke ?? 'none',
            // Stroke drawn behind the fill (so twice as wide): hides overlapping contours in variable fonts
            strokeWidth: FONT_SIZE * strokeWidth * 2,
            strokeLinejoin: 'round',
            paintOrder: 'stroke',
            letterSpacing: '-0.02em',
          }}
        >
          {text}
        </text>
      </svg>
    </div>
  )
}
