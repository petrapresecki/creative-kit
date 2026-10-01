import { useEffect, useRef } from 'react'
import { ScrollTrigger, prefersReducedMotion } from '@kit/lib/gsap'
import { useTextScramble } from '@kit/lib/use-text-scramble'

export interface ScrambleTextProps {
  text: string
  /** When to decode: on mount, when scrolled into view, and/or on hover */
  play?: 'mount' | 'view'
  replayOnHover?: boolean
  charDelay?: number
  className?: string
}

/** Text that decodes through random characters, from Iva's original site. */
export default function ScrambleText({
  text,
  play = 'view',
  replayOnHover = true,
  charDelay = 45,
  className = '',
}: ScrambleTextProps) {
  const el = useRef<HTMLSpanElement>(null)
  const { display, trigger } = useTextScramble({ text, charDelay })

  useEffect(() => {
    if (prefersReducedMotion()) return
    if (play === 'mount') {
      trigger()
      return
    }
    const st = ScrollTrigger.create({ trigger: el.current, start: 'top 92%', once: true, onEnter: trigger })
    return () => st.kill()
  }, [play, trigger])

  return (
    <span
      ref={el}
      aria-label={text}
      onMouseEnter={() => replayOnHover && !prefersReducedMotion() && trigger()}
      className={className}
    >
      <span aria-hidden>{display}</span>
    </span>
  )
}
