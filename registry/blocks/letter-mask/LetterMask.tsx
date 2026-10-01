import { useRef } from 'react'
import { gsap, useGSAP } from '@kit/lib/gsap'

export interface LetterMaskProps {
  text: string
  className?: string
  /** Colour of letters not yet revealed, and once revealed */
  from?: string
  to?: string
  /** Invert whatever sits behind the text (mix-blend-difference) so it reads as cut out of images */
  blend?: boolean
  scroller?: React.RefObject<HTMLElement | null>
}

/**
 * Donut-studio "mask": a paragraph that lights up letter by letter as you
 * scroll. With `blend`, passing over images inverts them.
 */
export default function LetterMask({ text, className = '', from = '#2e2e2e', to = '#ffffff', blend = true, scroller }: LetterMaskProps) {
  const root = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-char]',
        { color: from },
        {
          color: to,
          stagger: 0.02,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'bottom 35%', scrub: true, scroller: scroller?.current ?? undefined },
        },
      )
    },
    { scope: root, dependencies: [text, from, to] },
  )

  return (
    <p ref={root} aria-label={text} className={`relative ${blend ? 'mix-blend-difference' : ''} ${className}`}>
      {text.split(' ').map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {[...word].map((char, c) => (
            <span key={c} data-char>
              {char}
            </span>
          ))}
          &nbsp;
        </span>
      ))}
    </p>
  )
}
