import type { ReactNode } from 'react'

export interface MarqueeProps {
  children: ReactNode
  /** Seconds per loop */
  duration?: number
  reverse?: boolean
  className?: string
}

/** Infinite horizontal loop: the track holds two copies and slides by half. */
export default function Marquee({ children, duration = 30, reverse = false, className = '' }: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex w-max motion-reduce:animate-none"
        style={{ animation: `kit-marquee ${duration}s linear infinite`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
