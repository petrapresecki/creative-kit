import { useLayoutEffect, useRef, useState } from 'react'

export interface PillNavLink {
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
}

export interface PillNavProps {
  brand: string
  onBrandClick?: () => void
  links: PillNavLink[]
  /** Open a pill's label while it is hovered or focused, not only on the current page */
  expandOnHover?: boolean
  /** `fixed` for a site header; `sticky`/`absolute` to place it inside a section or demo */
  position?: 'fixed' | 'sticky' | 'absolute'
  className?: string
}

// Horizontal padding of a closed and an open pill, px
const PAD = [7, 12]

/**
 * Gionatan Nese's nav: frosted pills where only the current page shows its name
 * (in the serif, with a superscript number); the others shrink to just the number.
 * A spacer's width opens the pill while the label slides in from the left behind
 * overflow:hidden, so the text is never squashed.
 */
export default function PillNav({ brand, onBrandClick, links, expandOnHover = true, position = 'fixed', className = '' }: PillNavProps) {
  const labels = useRef<(HTMLSpanElement | null)[]>([])
  const [widths, setWidths] = useState<number[]>([])
  const [hovered, setHovered] = useState<number | null>(null)

  // Measure every label (and again when the web font swaps in or the labels change)
  useLayoutEffect(() => {
    const measure = () => setWidths(labels.current.map(l => Math.ceil(l?.offsetWidth ?? 0)))
    measure()
    const ro = new ResizeObserver(measure)
    labels.current.forEach(l => l && ro.observe(l))
    return () => ro.disconnect()
  }, [links.length])

  const pill = (link: PillNavLink, i: number) => {
    const open = link.active || (expandOnHover && hovered === i)
    const w = widths[i] ?? 0
    const pad = PAD[open ? 1 : 0]
    const cls =
      'pointer-events-auto relative flex items-end self-stretch overflow-hidden rounded-kit bg-mist/50 py-1.5 backdrop-blur-2xl transition-[padding] duration-[450ms] ease-in-out-quart'
    const inner = (
      <>
        {/* Holds the label's room: 0 when closed */}
        <span aria-hidden className="h-[9px] transition-[width,margin] duration-[450ms] ease-in-out-quart" style={{ width: open ? w : 0, marginRight: open ? 3 : 0 }} />
        <span
          ref={el => {
            labels.current[i] = el
          }}
          className="absolute top-1.5 font-display text-[15px] leading-[1.1] whitespace-nowrap transition-[left] duration-[450ms] ease-in-out-quart"
          style={{ left: open ? PAD[1] : -w - PAD[1] }}
        >
          {link.label}
        </span>
        <sup className="translate-y-0.5 font-sans text-[11px] leading-[1.4] tabular-nums">{i + 1}</sup>
      </>
    )
    const props = {
      onClick: link.onClick,
      onPointerEnter: () => setHovered(i),
      onPointerLeave: () => setHovered(h => (h === i ? null : h)),
      onFocus: () => setHovered(i),
      onBlur: () => setHovered(h => (h === i ? null : h)),
      'aria-current': link.active ? ('page' as const) : undefined,
      className: cls,
      style: { paddingLeft: pad, paddingRight: pad },
    }
    return link.href ? (
      <a key={link.label} href={link.href} {...props}>
        {inner}
      </a>
    ) : (
      <button key={link.label} type="button" {...props}>
        {inner}
      </button>
    )
  }

  return (
    <header className={`pointer-events-none ${position} inset-x-0 top-0 z-50 flex justify-center px-4 py-2 ${className}`}>
      <div className="flex items-center gap-3.5">
        <button type="button" onClick={onBrandClick} className="pointer-events-auto font-sans text-sm font-medium">
          {brand}
        </button>
        <nav className="flex items-center gap-1">{links.map(pill)}</nav>
      </div>
    </header>
  )
}
