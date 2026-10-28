import type { ReactNode } from 'react'

export interface GlowTitleProps {
  children: ReactNode
  /** Heading level to render */
  as?: 'h1' | 'h2' | 'h3' | 'p'
  /** How far the red light spreads, in px */
  glow?: number
  className?: string
}

/**
 * The glowing title bar from do-you-have-a-crush-on.me: a black bar with a white
 * keyline and a pink halo, and pixel type lit in the accent like a sign.
 * The light is three stacked text-shadows: a tight one, a wide one, and a hair of white.
 */
export default function GlowTitle({ children, as: Tag = 'h1', glow = 16, className = '' }: GlowTitleProps) {
  const soft = 'color-mix(in srgb, var(--color-accent) 70%, white)'
  return (
    <div
      className={`flex items-center rounded-kit bg-ink px-[0.6em] pb-[0.35em] pt-[0.25em] ${className}`}
      style={{ boxShadow: `0 0 0 2px white, 0 0 ${glow + 2}px color-mix(in srgb, ${soft} 60%, transparent)` }}
    >
      <Tag
        className="m-0 font-display text-display text-accent"
        style={{ textShadow: `0 0 ${glow * 0.4}px ${soft}, 0 0 ${glow}px ${soft}, 0 0 2px white` }}
      >
        {children}
      </Tag>
    </div>
  )
}
