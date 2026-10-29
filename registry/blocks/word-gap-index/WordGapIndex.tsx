import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@kit/lib/gsap'
import { useTextScramble } from '@kit/lib/use-text-scramble'

export interface WordGapItem {
  id: string
  title: string
  image: string
  href?: string
  /** How many words come before the image. Defaults to 1 */
  split?: number
}

export interface WordGapIndexProps {
  items: WordGapItem[]
  /** Shuffle the letters as a row opens */
  shuffle?: boolean
  /** Pixel size the thumbnail starts at before it sharpens. 0 = no pixelation */
  pixel?: number
  onOpen?: (item: WordGapItem) => void
  className?: string
}

// Block sizes stepped through on the way to sharp, as fractions of `pixel`
const STEPS = [1, 0.5, 0.25, 0]

function Word({ text, play }: { text: string; play: boolean }) {
  const { display, trigger } = useTextScramble({ text, charDelay: 28, cycleSpeed: 35 })
  useEffect(() => {
    if (play) trigger()
  }, [play, trigger])
  return <span>{display}</span>
}

/** The thumbnail: a canvas that arrives as big pixels and sharpens in a few steps. */
function Thumb({ src, open, pixel }: { src: string; open: boolean; pixel: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const draw = useRef<(level: number) => void>(() => {})

  useEffect(() => {
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const small = document.createElement('canvas')
    const sctx = small.getContext('2d')!
    const im = img.current!
    draw.current = level => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(cv.clientWidth * dpr)
      const h = Math.round(cv.clientHeight * dpr)
      if (!im.naturalWidth || !w || !h) return
      if (cv.width !== w || cv.height !== h) Object.assign(cv, { width: w, height: h })
      // object-fit: cover
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight)
      const sw = w / s
      const sh = h / s
      const sx = (im.naturalWidth - sw) / 2
      const sy = (im.naturalHeight - sh) / 2
      const px = level * pixel * dpr
      if (px < 1.5) {
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(im, sx, sy, sw, sh, 0, 0, w, h)
        return
      }
      const tw = Math.max(1, Math.ceil(w / px))
      const th = Math.max(1, Math.ceil(h / px))
      Object.assign(small, { width: tw, height: th })
      sctx.drawImage(im, sx, sy, sw, sh, 0, 0, tw, th)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(small, 0, 0, tw, th, 0, 0, w, h)
    }
    const ready = () => draw.current(0)
    if (im.complete) ready()
    im.addEventListener('load', ready)
    return () => im.removeEventListener('load', ready)
  }, [pixel])

  useEffect(() => {
    if (!open) return
    if (!pixel || prefersReducedMotion()) return draw.current(0)
    let i = 0
    draw.current(STEPS[i++])
    const timer = window.setInterval(() => {
      draw.current(STEPS[i++])
      if (i >= STEPS.length) clearInterval(timer)
    }, 90)
    return () => clearInterval(timer)
  }, [open, pixel])

  return (
    <span
      className="relative inline-block h-[0.95em] shrink-0 overflow-hidden align-middle transition-[width,margin] duration-[450ms] ease-out-expo motion-reduce:transition-none"
      style={{ width: open ? '1.5em' : 0, marginInline: open ? '0.14em' : '0.12em' }}
    >
      <img ref={img} src={src} alt="" className="hidden" />
      <canvas ref={canvas} className="absolute inset-y-0 left-0 h-full w-[1.5em]" />
    </span>
  )
}

/**
 * From locomotive.ca: project titles centred between full-width rules. Hover a row and a
 * thumbnail opens in the gap between two words, pushing them apart, arriving as big
 * pixels and sharpening while the letters shuffle. On touch screens every thumbnail is open.
 */
export default function WordGapIndex({ items, shuffle = true, pixel = 14, onOpen, className = '' }: WordGapIndexProps) {
  const [active, setActive] = useState<number | null>(null)
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const set = () => setTouch(mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])

  return (
    <ul className={`border-t border-ink ${className}`} onMouseLeave={() => setActive(null)}>
      {items.map((item, i) => {
        const words = item.title.split(/\s+/)
        const split = Math.min(item.split ?? 1, words.length)
        const open = touch || active === i
        const Tag = item.href ? 'a' : 'button'
        return (
          <li key={item.id} className="border-b border-ink">
            <Tag
              {...(item.href ? { href: item.href } : { type: 'button' as const })}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => onOpen?.(item)}
              className="block w-full py-[0.12em] text-center font-display text-display leading-[1.1] focus-visible:outline-none"
            >
              <span className="sr-only">{item.title}</span>
              <span aria-hidden className="inline-flex max-w-full flex-wrap items-center justify-center whitespace-nowrap">
                {words.slice(0, split).map((w, j) => (
                  <span key={j} className="contents">
                    {j > 0 && <span className="w-[0.25em]" />}
                    {shuffle ? <Word text={w} play={active === i} /> : w}
                  </span>
                ))}
                <Thumb src={item.image} open={open} pixel={pixel} />
                {words.slice(split).map((w, j) => (
                  <span key={j} className="contents">
                    {j > 0 && <span className="w-[0.25em]" />}
                    {shuffle ? <Word text={w} play={active === i} /> : w}
                  </span>
                ))}
              </span>
            </Tag>
          </li>
        )
      })}
    </ul>
  )
}
