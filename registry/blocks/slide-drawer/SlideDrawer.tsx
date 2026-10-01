import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap } from '@kit/lib/gsap'
import { getLenis } from '@kit/lib/lenis'

export interface SlideDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Accessible label for the back button */
  backLabel?: string
  className?: string
}

/**
 * A full-screen panel that slides up over the page (Iva's project drawer).
 * Pauses smooth scroll underneath, closes on Escape, scrolls on its own.
 */
export default function SlideDrawer({ open, onClose, children, backLabel = 'Back', className = '' }: SlideDrawerProps) {
  const panel = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(open)

  // Mount before animating in, unmount after animating out
  if (open && !mounted) setMounted(true)

  useEffect(() => {
    const el = panel.current
    if (!el) return
    if (open) {
      getLenis()?.stop()
      el.scrollTo(0, 0)
      gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: 'power4.inOut' })
    } else {
      gsap.to(el, {
        yPercent: 100,
        duration: 0.6,
        ease: 'power4.inOut',
        onComplete: () => {
          getLenis()?.start()
          setMounted(false)
        },
      })
    }
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null
  return (
    <div ref={panel} data-lenis-prevent role="dialog" aria-modal className={`fixed inset-0 z-40 overflow-y-auto bg-paper ${className}`}>
      <button
        onClick={onClose}
        aria-label={backLabel}
        className="group fixed top-1/2 left-3 z-50 -translate-y-1/2 rounded-full border border-ink/15 bg-paper/80 p-3 backdrop-blur transition-colors hover:border-ink hover:bg-accent md:left-5"
      >
        <svg className="size-5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {children}
    </div>
  )
}
