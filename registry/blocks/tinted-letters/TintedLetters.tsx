import { useEffect, useMemo, useState } from 'react'
import { prefersReducedMotion } from '@kit/lib/gsap'

export interface TintedLettersProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  /** Colours a letter can take. Defaults to the theme accent */
  colors?: string[]
  /** How many runs of letters are coloured at once */
  runs?: number
  /** Longest run, in letters */
  maxRun?: number
  /** Milliseconds between changes */
  interval?: number
  /** Draw with mix-blend-mode: difference, for text over images and video */
  blend?: boolean
  className?: string
}

/**
 * From locomotive.ca: a headline where a few letters, sometimes a short run, take an
 * accent colour and hand it on about once a second, so colour wanders through the words.
 * New lines in `text` break the line.
 */
export default function TintedLetters({
  text,
  as: Tag = 'h2',
  colors = ['var(--color-accent)'],
  runs = 2,
  maxRun = 4,
  interval = 900,
  blend = false,
  className = '',
}: TintedLettersProps) {
  const chars = useMemo(() => [...text], [text])
  const [tint, setTint] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    const letters = chars.flatMap((c, i) => (/\s/.test(c) ? [] : [i]))
    if (!letters.length) return
    const pick = () => {
      const next = new Map<number, string>()
      for (let r = 0; r < runs; r++) {
        const start = letters[Math.floor(Math.random() * letters.length)]
        const len = 1 + Math.floor(Math.random() * maxRun)
        const color = colors[Math.floor(Math.random() * colors.length)]
        for (let i = start; i < start + len && i < chars.length && !/\s/.test(chars[i]); i++) next.set(i, color)
      }
      setTint(next)
    }
    pick()
    if (prefersReducedMotion()) return
    const timer = window.setInterval(pick, interval)
    return () => clearInterval(timer)
    // colors is compared by value so an inline array doesn't restart the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars, runs, maxRun, interval, colors.join()])

  return (
    <Tag aria-label={text} className={`${blend ? 'mix-blend-difference' : ''} ${className}`}>
      {chars.map((c, i) =>
        c === '\n' ? (
          <br key={i} />
        ) : (
          <span key={i} aria-hidden style={tint.has(i) ? { color: tint.get(i) } : undefined}>
            {c}
          </span>
        ),
      )}
    </Tag>
  )
}
