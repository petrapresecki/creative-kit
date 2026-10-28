import type { ReactNode } from 'react'

export interface StarGlassProps {
  children: ReactNode
  /** Backdrop blur in px (lower it on phones, it is the expensive part) */
  blur?: number
  /** A four-point star on each corner */
  stars?: boolean
  className?: string
}

const CORNERS = ['-left-[11px] -top-[11px]', '-right-[11px] -top-[11px]', '-left-[11px] -bottom-[11px]', '-right-[11px] -bottom-[11px]']

/**
 * The frosted panel from a-galera-ta-online: half-white glass over whatever is behind,
 * a white rim, a white glow outside and in, and a sparkle pinned to each corner.
 * Needs something busy behind it (a photo, a tiled wallpaper) or the glass reads as plain white.
 */
export default function StarGlass({ children, blur = 16, stars = true, className = '' }: StarGlassProps) {
  return (
    <div
      className={`relative rounded-[26px] border-[1.5px] border-white/95 bg-white/50 p-[22px] max-md:rounded-[18px] max-md:p-3 ${className}`}
      style={{
        backdropFilter: `blur(${blur}px) saturate(1.3)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(1.3)`,
        boxShadow: '0 0 30px 6px rgba(255, 255, 255, .85), inset 0 0 26px rgba(255, 255, 255, .9)',
      }}
    >
      {stars &&
        CORNERS.map(p => (
          <svg key={p} aria-hidden viewBox="0 0 20 20" className={`pointer-events-none absolute h-[22px] w-[22px] ${p}`}>
            <path d="M10 0l1.6 8.4L20 10l-8.4 1.6L10 20l-1.6-8.4L0 10l8.4-1.6z" fill="white" stroke="var(--color-ink)" strokeWidth=".6" />
          </svg>
        ))}
      {children}
    </div>
  )
}
