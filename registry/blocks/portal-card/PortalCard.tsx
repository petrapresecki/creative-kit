import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, useGSAP } from '@kit/lib/gsap'

export interface PortalCardProps {
  /** The world behind the window: an image, a video, a scene. It stays still while the card scrolls */
  children: ReactNode
  /** Sizes the window, e.g. 'aspect-[3/4] w-[16vw]' */
  className?: string
  /** Shown on the card, e.g. "About →" */
  label?: ReactNode
  onOpen?: () => void
  onClose?: () => void
  /** Seconds the window takes to fill the screen */
  duration?: number
  /** Scroll container: the world fills that box instead of the screen */
  scroller?: React.RefObject<HTMLElement | null>
}

/**
 * Kokopako's portal: the card is a window onto a second world fixed behind the
 * page. Click it and the window grows until that world is all you see.
 */
export default function PortalCard({ children, className = 'aspect-[3/4] w-[18vw] min-w-[200px]', label, onOpen, onClose, duration = 1.1, scroller }: PortalCardProps) {
  const card = useRef<HTMLButtonElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const toggle = useRef<(next: boolean) => void>(() => {})

  useGSAP(
    () => {
      const el = world.current!
      const radius = () => getComputedStyle(card.current!).borderTopLeftRadius || '0px'
      // The world covers the screen (or the scroller); a clip-path cut to the card's rect makes the window
      const bounds = () => scroller?.current?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight)
      const clipToCard = () => {
        const b = bounds()
        const c = card.current!.getBoundingClientRect()
        // Keep the window inside the scroller when the card scrolls past its edges
        const top = Math.max(0, c.top - b.top)
        const left = Math.max(0, c.left - b.left)
        const bottom = Math.max(0, b.bottom - c.bottom)
        const right = Math.max(0, b.right - c.right)
        return { top, right, bottom, left }
      }
      const frame = () => {
        const b = bounds()
        gsap.set(el, { top: b.top, left: b.left, width: b.width, height: b.height })
      }
      const state = { ...clipToCard(), r: parseFloat(radius()) }
      const apply = () => {
        el.style.clipPath = `inset(${state.top}px ${state.right}px ${state.bottom}px ${state.left}px round ${state.r}px)`
      }
      const sync = () => {
        frame()
        if (openRef.current) return
        Object.assign(state, clipToCard())
        apply()
      }
      sync()

      // Capture catches scrolling in any container, so this works before the scroller's ref is attached
      window.addEventListener('scroll', sync, { capture: true, passive: true })
      window.addEventListener('resize', sync)

      toggle.current = next => {
        openRef.current = next
        const to = next ? { top: 0, right: 0, bottom: 0, left: 0, r: 0 } : { ...clipToCard(), r: parseFloat(radius()) }
        gsap.to(state, { ...to, duration: next ? duration : duration * 0.75, ease: 'expo.inOut', overwrite: true, onUpdate: apply })
      }
      return () => {
        window.removeEventListener('scroll', sync, { capture: true })
        window.removeEventListener('resize', sync)
      }
    },
    { dependencies: [duration] },
  )

  const set = (next: boolean) => {
    setOpen(next)
    toggle.current(next)
    if (next) onOpen?.()
    else onClose?.()
  }

  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && set(false)
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  return (
    <>
      {/* The button only holds the place and takes the click; the world shows through it from the layer below */}
      <button ref={card} onClick={() => set(!open)} aria-expanded={open} className={`group relative z-50 block rounded-kit ${className}`}>
        {label && (
          <span
            className={`caption absolute bottom-3 left-3 rounded-full bg-paper px-3 py-1.5 text-ink transition-[translate,opacity] duration-500 ease-out-expo group-hover:-translate-y-1 ${open ? 'opacity-0' : ''}`}
          >
            {label}
          </span>
        )}
      </button>
      <div ref={world} onClick={() => open && set(false)} className={`fixed z-40 overflow-hidden ${open ? 'cursor-zoom-out' : 'pointer-events-none'}`}>
        {children}
      </div>
    </>
  )
}
