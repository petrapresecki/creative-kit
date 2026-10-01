import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { readToken, toRgb } from '@kit/lib/tokens'

export interface BlendNavLink {
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
}

export interface BlendNavProps {
  brand: string
  onBrandClick?: () => void
  links: BlendNavLink[]
  /** `fixed` for a site header; `sticky`/`absolute` to place it inside a section or demo */
  position?: 'fixed' | 'sticky' | 'absolute'
  /** Colour the hover fill should read as; defaults to the theme's --color-accent */
  accent?: string
  className?: string
}

/** The colour that, painted in difference mode over white, shows as `color`. */
function complement(color: string) {
  return '#' + toRgb(color).map(c => Math.round((1 - c) * 255).toString(16).padStart(2, '0')).join('')
}

/**
 * Iva's "mask" nav: everything is drawn in white with mix-blend-difference, so
 * it reads black on light sections and inverts over images and dark ones. Pill
 * hovers fill with the accent's complement, which shows as the accent itself.
 */
export default function BlendNav({ brand, onBrandClick, links, position = 'fixed', accent, className = '' }: BlendNavProps) {
  const root = useRef<HTMLElement>(null)
  const [fill, setFill] = useState('#fa00bc')

  useLayoutEffect(() => {
    setFill(complement(accent ?? readToken('--color-accent', '#05ff43', root.current!)))
  }, [accent])

  const pill = (link: BlendNavLink) => {
    const cls = `group relative overflow-hidden rounded-full border border-white px-4 py-1.5 text-[13px] font-medium uppercase tracking-[0.04em] md:px-6 md:py-2 md:text-[15px] ${
      link.active ? 'bg-white text-black' : 'text-white'
    }`
    const inner = (
      <>
        {!link.active && (
          <span className="absolute inset-0 origin-left scale-x-0 rounded-full bg-(--blend-fill) transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
        )}
        <span className="relative">{link.label}</span>
      </>
    )
    return link.href ? (
      <a key={link.label} href={link.href} onClick={link.onClick} aria-current={link.active ? 'page' : undefined} className={cls}>
        {inner}
      </a>
    ) : (
      <button key={link.label} onClick={link.onClick} aria-current={link.active ? 'page' : undefined} className={cls}>
        {inner}
      </button>
    )
  }

  return (
    <header
      ref={root}
      style={{ '--blend-fill': fill } as CSSProperties}
      className={`pointer-events-none ${position} inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 text-white mix-blend-difference md:px-5 md:py-5 ${className}`}
    >
      <button onClick={onBrandClick} className="pointer-events-auto text-[15px] font-semibold tracking-[0.01em] md:text-[17px]">
        {brand}
      </button>
      <nav className="pointer-events-auto flex gap-2">{links.map(pill)}</nav>
    </header>
  )
}
