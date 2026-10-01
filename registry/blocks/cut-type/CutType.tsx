import { Fragment, useMemo, useRef } from 'react'
import { gsap, useGSAP, useScroller, prefersReducedMotion } from '@kit/lib/gsap'

export interface CutTypeProps {
  text: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span'
  className?: string
  /** Face above the cut; the other one sits below it */
  top?: 'display' | 'sans'
  /** Share of letters that get cut (0–1); the rest stay whole in the lower face */
  amount?: number
  /** Changes which letters are cut and where */
  seed?: number
  /** Re-cut the letters while the pointer is over the word */
  hover?: boolean
  /** Sweep the cuts in when scrolled into view */
  reveal?: boolean
  /** Scroll container, when the text lives inside one */
  scroller?: React.RefObject<HTMLElement | null>
}

/** Small seeded random so the cuts stay the same between renders. */
function random(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Cut height per letter as a share of the line box from the top: 0 = whole lower face, 1 = whole upper face. */
function cutsFor(count: number, amount: number, seed: number) {
  const rand = random(seed)
  return Array.from({ length: count }, () => (rand() < amount ? 0.4 + rand() * 0.35 : rand() < 0.12 ? 1 : 0))
}

/**
 * Kokopako titles: every letter is cut horizontally, the top half in one face
 * and the bottom half in the other, so the word looks stitched from two fonts.
 */
export default function CutType({
  text,
  as: Tag = 'p',
  className = '',
  top = 'display',
  amount = 0.45,
  seed = 7,
  hover = true,
  reveal = false,
  scroller,
}: CutTypeProps) {
  const root = useRef<HTMLElement>(null)
  const scrollerEl = useScroller(scroller)
  // Words stay whole so a line never breaks mid-word; `start` maps each letter to its cut
  const words = useMemo(
    () =>
      text.split(' ').reduce<{ text: string; start: number }[]>((out, t) => {
        const prev = out.at(-1)
        return [...out, { text: t, start: prev ? prev.start + [...prev.text].length : 0 }]
      }, []),
    [text],
  )
  const count = words.reduce((n, w) => n + [...w.text].length, 0)
  const cuts = useMemo(() => cutsFor(count, amount, seed), [count, amount, seed])
  const upper = top === 'display' ? 'font-display' : 'font-sans'
  const lower = top === 'display' ? 'font-sans' : 'font-display'

  useGSAP(
    () => {
      if (prefersReducedMotion() || scrollerEl === undefined) return
      const letters = gsap.utils.toArray<HTMLElement>('[data-cut]', root.current)
      const settle = () => gsap.to(letters, { '--cut': (i: number) => cuts[i], duration: 0.9, ease: 'expo.out', stagger: 0.02, overwrite: true })

      if (reveal) {
        gsap.set(letters, { '--cut': 1 })
        gsap.to(letters, {
          '--cut': (i: number) => cuts[i],
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.035,
          scrollTrigger: { trigger: root.current, start: 'top 85%', once: true, scroller: scrollerEl ?? undefined },
        })
      }
      if (!hover) return

      let round = 1
      const enter = () => {
        const next = cutsFor(letters.length, Math.min(1, amount + 0.25), seed + round++)
        gsap.to(letters, { '--cut': (i: number) => next[i], duration: 0.7, ease: 'expo.out', stagger: 0.015, overwrite: true })
      }
      const el = root.current!
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', settle)
      return () => {
        el.removeEventListener('pointerenter', enter)
        el.removeEventListener('pointerleave', settle)
      }
    },
    { scope: root, dependencies: [cuts, hover, reveal, scrollerEl] },
  )

  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        root.current = el
      }}
      aria-label={text}
      className={className}
    >
      {words.map((word, w) => (
        <Fragment key={w}>
          {w > 0 && ' '}
          <span aria-hidden className="inline-block whitespace-nowrap">
            {[...word.text].map((char, c) => (
              <span
                key={c}
                data-cut
                className="inline-grid justify-items-center [&>*]:col-start-1 [&>*]:row-start-1"
                style={{ '--cut': cuts[word.start + c] } as React.CSSProperties}
              >
                {/* The cut runs from 0.2em above the line box to 0.2em below it, so accents and descenders never clip */}
                <span className={lower} style={{ clipPath: 'inset(calc(var(--cut) * (100% + 0.4em) - 0.2em) -0.2em -0.2em -0.2em)' }}>
                  {char}
                </span>
                <span className={upper} style={{ clipPath: 'inset(-0.2em -0.2em calc((1 - var(--cut)) * (100% + 0.4em) - 0.2em) -0.2em)' }}>
                  {char}
                </span>
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
