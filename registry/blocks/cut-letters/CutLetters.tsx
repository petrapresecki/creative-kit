import { useId, useLayoutEffect, useRef } from 'react'

export interface CutLettersProps {
  /** The word or name, already cased the way it should read (mixed case is the point: "pEtRa pResEčKi") */
  text: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span'
  className?: string
  /** How far the edges are roughened, in px (displacement scale); 0 for clean letters */
  rough?: number
  /** Largest rotation of a single letter, in degrees */
  tilt?: number
  /** Scale the font size so the text fills its container's width on one line */
  fit?: boolean
}

/** A fixed pattern of tilts and drops, so the letters read hand-set but never jump between renders */
const TILTS = [-0.8, 0.6, -0.4, 1, -0.6, 0.4, -1, 0.8, -0.2, 0.6, -0.8, 0.4, 1, -0.4]
const DROPS = [0, 0.03, 0.06]

/**
 * After petrmenhart.xyz: a name as if each letter was cut out and pasted down by hand. Every letter
 * tilts a little and sits a little off the baseline, and one SVG filter roughens the edges like a bad
 * photocopy. Set the case by hand in `text` (avoid capital O and I in blackletter faces: they read as
 * 0 and 1). Looks best in a blackletter or brush face such as Pirata One, in one bright colour.
 */
export default function CutLetters({ text, as: Tag = 'h1', className = '', rough = 5, tilt = 5, fit = false }: CutLettersProps) {
  const id = `cut-${useId().replace(/:/g, '')}`
  const box = useRef<HTMLElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!fit) return
    const el = inner.current
    const wrap = box.current
    if (!el || !wrap) return
    const size = () => {
      el.style.fontSize = '100px'
      const w = el.getBoundingClientRect().width
      if (!w) return
      el.style.fontSize = `${(100 * wrap.clientWidth) / w}px`
      // kerning and optical sizes don't scale quite linearly, so correct once at the real size
      const w2 = el.getBoundingClientRect().width
      if (w2) el.style.fontSize = `${(parseFloat(el.style.fontSize) * wrap.clientWidth) / w2}px`
    }
    size()
    document.fonts.ready.then(size)
    document.fonts.addEventListener('loadingdone', size)
    const ro = new ResizeObserver(size)
    ro.observe(wrap)
    return () => {
      ro.disconnect()
      document.fonts.removeEventListener('loadingdone', size)
    }
  }, [fit, text])

  return (
    <Tag ref={box as never} className={`${fit ? 'whitespace-nowrap' : ''} ${className}`} aria-label={text}>
      <span ref={inner} aria-hidden className="inline-block" style={rough ? { filter: `url(#${id})` } : undefined}>
        {[...text].map((ch, i) => (
          <span
            key={i}
            className="inline-block"
            style={{ rotate: `${TILTS[i % TILTS.length] * tilt}deg`, translate: `0 ${DROPS[i % DROPS.length]}em` }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
      {rough > 0 && (
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id={id}>
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale={rough} />
          </filter>
        </svg>
      )}
    </Tag>
  )
}
