import { useId, useRef, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@kit/lib/gsap'

export interface GrainDissolveProps {
  children: ReactNode
  className?: string
  /**
   * in / out / both: driven by scroll as the element enters, leaves, or both.
   * hover: dissolves to `amount` while the pointer is over it.
   * manual: holds at `amount` (tweened when it changes).
   */
  mode?: 'in' | 'out' | 'both' | 'hover' | 'manual'
  /** 0 = solid, 1 = gone. Used by hover and manual */
  amount?: number
  /** Grain size in px */
  grain?: number
  /** Scroll container, when the content lives inside one */
  scroller?: React.RefObject<HTMLElement | null>
}

// Noise values sit roughly between 0.15 and 0.85; sweeping the threshold across that range eats the content dot by dot
const LOW = 0.12
const HIGH = 0.88
const SHARP = 40

/**
 * Kokopako's grain: text or images break into stippled noise dots instead of
 * fading. An SVG filter keeps only the pixels where noise beats a threshold.
 */
export default function GrainDissolve({ children, className = '', mode = 'out', amount = 0.5, grain = 2, scroller }: GrainDissolveProps) {
  const root = useRef<HTMLDivElement>(null)
  const matrix = useRef<SVGFEColorMatrixElement>(null)
  const id = `grain-${useId().replace(/:/g, '')}`

  useGSAP(
    () => {
      const el = root.current!
      const state = { p: 0 }
      const apply = () => {
        const p = state.p
        // Solid content skips the filter entirely so it stays crisp and cheap
        el.style.filter = p <= 0.001 ? 'none' : `url(#${id})`
        el.style.visibility = p >= 0.999 ? 'hidden' : 'visible'
        const t = LOW + p * (HIGH - LOW)
        matrix.current!.setAttribute('values', `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${SHARP} 0 0 0 ${-SHARP * t}`)
      }
      apply()
      if (prefersReducedMotion() && mode !== 'manual') return

      if (mode === 'manual') {
        gsap.to(state, { p: amount, duration: 0.6, ease: 'power2.out', onUpdate: apply })
        return
      }
      if (mode === 'hover') {
        const to = (p: number) => () => gsap.to(state, { p, duration: 0.6, ease: 'power2.out', overwrite: true, onUpdate: apply })
        const enter = to(amount)
        const leave = to(0)
        el.addEventListener('pointerenter', enter)
        el.addEventListener('pointerleave', leave)
        return () => {
          el.removeEventListener('pointerenter', enter)
          el.removeEventListener('pointerleave', leave)
        }
      }

      // Solid while the element's centre is in the middle of the view; grains out over the outer 30% at each end
      const update = () => {
        const view = scroller?.current?.getBoundingClientRect() ?? { top: 0, height: window.innerHeight }
        const r = el.getBoundingClientRect()
        const c = (r.top + r.height / 2 - view.top) / view.height
        const entering = gsap.utils.clamp(0, 1, (c - 0.7) / 0.3)
        const leaving = gsap.utils.clamp(0, 1, (0.3 - c) / 0.3)
        state.p = mode === 'in' ? entering : mode === 'out' ? leaving : Math.max(entering, leaving)
        apply()
      }
      // Capture catches scrolling in any container, so this works before the scroller's ref is attached
      window.addEventListener('scroll', update, { capture: true, passive: true })
      window.addEventListener('resize', update)
      update()
      return () => {
        window.removeEventListener('scroll', update, { capture: true })
        window.removeEventListener('resize', update)
      }
    },
    { scope: root, dependencies: [mode, amount] },
  )

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={1 / grain} numOctaves={1} seed={4} result="noise" />
          <feColorMatrix ref={matrix} in="noise" type="matrix" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </svg>
      <div ref={root} className={className}>
        {children}
      </div>
    </>
  )
}
