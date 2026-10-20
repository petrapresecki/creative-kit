import { useEffect, useRef, useState, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '@kit/lib/gsap'
import { getLenis } from '@kit/lib/lenis'

export interface BlockMenuItem {
  label: string
  href?: string
  /** Block colour, any CSS colour. Defaults cycle through the theme's accent, mist and paper */
  color?: string
}

export interface BlockMenuLink {
  label: string
  href?: string
}

export interface BlockMenuProps {
  open: boolean
  onClose: () => void
  /** The main sections, stacked as colour blocks on the left */
  items: BlockMenuItem[]
  /** Secondary links at the top of the dark panel */
  links?: BlockMenuLink[]
  /** Anything under the rule in the dark panel: small links, socials, a form */
  footer?: ReactNode
  /** Space left at the top for a header that stays visible (px) */
  top?: number
  /** Size of the block links: display for short words, headline for longer ones */
  size?: 'display' | 'headline'
  /** false = fill the nearest positioned parent instead of the viewport */
  fixed?: boolean
  onNavigate?: (href?: string) => void
  className?: string
}

const DEFAULT_COLORS = ['var(--color-accent)', 'var(--color-mist)', 'var(--color-paper)']

/**
 * A full-screen menu where the main sections are stacked colour blocks with huge
 * links, next to a dark panel of secondary links. Fades in while the type rises.
 * Pauses smooth scroll underneath and closes on Escape.
 */
export default function BlockMenu({
  open,
  onClose,
  items,
  links = [],
  footer,
  top = 0,
  size = 'display',
  fixed = true,
  onNavigate,
  className = '',
}: BlockMenuProps) {
  const panel = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(open)

  // Mount before animating in, unmount after animating out
  if (open && !mounted) setMounted(true)

  useEffect(() => {
    const el = panel.current
    if (!el) return
    const rise = el.querySelectorAll('[data-rise]')
    const still = prefersReducedMotion()
    if (open) {
      if (fixed) getLenis()?.stop()
      gsap.killTweensOf([el, rise])
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: still ? 0.2 : 0.45, ease: 'power2.out' })
      if (!still) gsap.fromTo(rise, { y: 32 }, { y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.035 })
      el.focus({ preventScroll: true })
    } else {
      gsap.to(el, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (fixed) getLenis()?.start()
          setMounted(false)
        },
      })
    }
  }, [open, mounted, fixed])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null
  const go = (href?: string) => () => onNavigate?.(href)
  return (
    <div
      ref={panel}
      data-lenis-prevent
      role="dialog"
      aria-modal
      aria-label="Menu"
      tabIndex={-1}
      style={{ top }}
      className={`${fixed ? 'fixed' : 'absolute'} inset-x-0 bottom-0 z-40 grid overflow-y-auto bg-ink md:grid-cols-2 md:overflow-hidden outline-none ${className}`}
    >
      <nav className="flex min-h-[60vh] flex-col md:min-h-0">
        {items.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            onClick={go(item.href)}
            className="group flex flex-1 items-center overflow-hidden px-4 py-3 text-ink md:px-5"
            style={{ background: item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
          >
            <span
              data-rise
              className={`font-display ${size === 'display' ? 'text-display' : 'text-headline'} decoration-[0.07em] underline-offset-[0.12em] group-hover:underline group-focus-visible:underline`}
            >
              {item.label}
            </span>
          </a>
        ))}
      </nav>
      <div className="flex flex-col text-paper">
        {links.length > 0 && (
          <ul className="flex flex-col gap-1 px-5 py-6 md:flex-1">
            {links.map(link => (
              <li key={link.label} data-rise>
                <a href={link.href} onClick={go(link.href)} className="text-title decoration-1 underline-offset-4 hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        {footer && (
          <div data-rise className="border-t border-paper/30 px-5 py-6 md:flex-1">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
