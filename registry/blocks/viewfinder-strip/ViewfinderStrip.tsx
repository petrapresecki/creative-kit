import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '@kit/lib/gsap'

export interface ViewfinderItem {
  id: string
  /** Image URL; any aspect ratio */
  src: string
  title: string
  /** Shown on the centre line beside the frame, e.g. the field or client type */
  category?: string
  /** Shown on the other side of the frame, e.g. services or the year */
  detail?: string
  href?: string
}

export interface ViewfinderStripProps {
  items: ViewfinderItem[]
  /** Called when the framed item is clicked (or Enter is pressed); without it, follows `href` */
  onOpen?: (item: ViewfinderItem) => void
  /** Thumbnail size as a fraction of the container height (a portrait image is a bit taller, a landscape one a bit shorter) */
  size?: number
  /** How much the framed image grows */
  zoom?: number
  /** Distance between the two brackets, as a fraction of the container height */
  frame?: number
  /** Settle on the nearest item when scrolling stops */
  snap?: boolean
  /** Brackets open out of a closed lens while the strip rises in */
  intro?: boolean
  /** Show the project list, category, detail and number on the centre line (from md up) */
  meta?: boolean
  className?: string
}

const GAP = 6
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const smoothstep = (x: number, a: number, b: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const mod = (v: number, n: number) => ((v % n) + n) % n
/** Signed distance on a loop of length n, in −n/2…n/2 */
const wrap = (v: number, n: number) => mod(v + n / 2, n) - n / 2

/**
 * One half of the lens: a box with chamfered outer corners and a big circular bite out of its inner side,
 * leaving thick tips and a thin spine. Mirror it for the right half.
 */
function Bracket({ className = '' }: { className?: string }) {
  const h = 100
  const w = 45
  const spine = 3.5
  const bevel = 6
  // Circle through the two inner tips (w, 0) and (w, h) whose leftmost point leaves the spine
  const cx = (w * w + (h * h) / 4 - spine * spine) / (2 * (w - spine))
  const r = cx - spine
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden>
      <path d={`M${w} 0H${bevel}L0 ${bevel}V${h - bevel}L${bevel} ${h}H${w}A${r} ${r} 0 0 1 ${w} 0Z`} fill="currentColor" />
    </svg>
  )
}

export default function ViewfinderStrip({
  items,
  onOpen,
  size = 0.15,
  zoom = 1.3,
  frame = 0.41,
  snap = true,
  intro = true,
  meta = true,
  className = '',
}: ViewfinderStripProps) {
  const N = items.length
  const root = useRef<HTMLDivElement>(null)
  const tiles = useRef<(HTMLButtonElement | null)[]>([])
  const titles = useRef<(HTMLLIElement | null)[]>([])
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)
  const metaRow = useRef<HTMLDivElement>(null)
  const aspects = useRef<number[]>([])
  const [height, setHeight] = useState(640)
  const [active, setActive] = useState(0)
  const reduced = useMemo(() => prefersReducedMotion(), [])
  // Scroll position in px along the strip; target is where it's heading
  const motion = useRef({ scroll: 0, target: 0, lastInput: 0, dragging: false, dragY: 0, moved: 0, open: 1, started: false, centres: [] as number[], length: 1 })

  // Repeat the items until the loop is at least two screens long, so it never shows its own end
  const copies = Math.max(1, Math.ceil((2 * height) / Math.max(1, N * (height * size + GAP))))
  const loop = useMemo(() => Array.from({ length: copies }, () => items).flat(), [copies, items])

  useEffect(() => {
    const el = root.current!
    const observer = new ResizeObserver(() => setHeight(el.clientHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Nearest copy of item k to the target, as a target offset
  const offsetTo = (k: number) => {
    const m = motion.current
    let best = Infinity
    for (let c = 0; c < copies; c++) {
      const d = wrap(m.centres[k + c * N] - m.target, m.length)
      if (Math.abs(d) < Math.abs(best)) best = d
    }
    return best
  }
  const nearest = () => {
    const m = motion.current
    let best = 0
    m.centres.forEach((c, j) => {
      if (Math.abs(wrap(c - m.target, m.length)) < Math.abs(wrap(m.centres[best] - m.target, m.length))) best = j
    })
    return best
  }
  const goTo = (k: number) => {
    motion.current.target += offsetTo(mod(k, N))
    motion.current.lastInput = 0
  }
  const step = (dir: number) => goTo((nearest() % N) + dir)
  const open = (k: number) => {
    const item = items[mod(k, N)]
    if (onOpen) onOpen(item)
    else if (item.href) window.location.assign(item.href)
  }

  // The loop: lay the strip out around the centre line every frame
  useEffect(() => {
    const m = motion.current
    const el = root.current!
    let current = -1

    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 30)
      const H = el.clientHeight
      const base = H * size
      // Same area for every thumbnail: portraits come out taller, landscapes wider
      const heights = loop.map((_, j) => base / Math.sqrt(aspects.current[j % N] ?? 0.75))
      let acc = 0
      m.centres = heights.map(h => {
        const c = acc + h / 2
        acc += h + GAP
        return c
      })
      m.length = acc
      // Start on the first item, once; a resize only re-lays the strip out
      if (!m.started) {
        m.started = true
        m.scroll = m.target = m.centres[0]
        if (intro && !reduced) {
          // Rise in from below while the lens opens into two brackets
          m.scroll -= H * 1.1
          m.open = 0
          gsap.to(m, { open: 1, duration: 1.4, delay: 0.5, ease: 'expo.inOut' })
        }
      }

      const now = performance.now()
      if (snap && !m.dragging && m.lastInput && now - m.lastInput > 160) {
        m.lastInput = 0
        m.target += wrap(m.centres[nearest()] - m.target, m.length)
      }
      const k = 1 - Math.exp(-(m.dragging || reduced ? 30 : m.open < 1 ? 3 : 7) * dt)
      m.scroll += (m.target - m.scroll) * k

      // Where each thumbnail would sit, and how framed it is
      const ys = m.centres.map(c => wrap(c - m.scroll, m.length))
      const focus = ys.map((y, j) => 1 - smoothstep(Math.abs(y), 0, (heights[j] + GAP) * 0.85))
      const grow = heights.map((h, j) => h * (zoom - 1) * focus[j])
      let nearestJ = 0
      ys.forEach((y, j) => {
        if (Math.abs(y) < Math.abs(ys[nearestJ])) nearestJ = j
      })

      tiles.current.forEach((tile, j) => {
        if (!tile) return
        // Push neighbours apart by half of whatever is growing between them and the centre
        let y = ys[j]
        for (let i = 0; i < ys.length; i++) if (i !== j && grow[i] > 0.01) y += (grow[i] / 2) * Math.sign(ys[j] - ys[i])
        const h = heights[j]
        const visible = Math.abs(y) < H / 2 + h * zoom
        tile.style.visibility = visible ? 'visible' : 'hidden'
        if (!visible) return
        tile.style.height = `${h}px`
        tile.style.width = `${h * (aspects.current[j % N] ?? 0.75)}px`
        tile.style.transform = `translate(-50%, -50%) translate3d(0, ${y.toFixed(2)}px, 0) scale(${(1 + (zoom - 1) * focus[j]).toFixed(4)})`
        const f = focus[j]
        tile.style.filter = f > 0.99 ? 'none' : `grayscale(${1 - f}) contrast(${0.82 + 0.18 * f}) brightness(${0.9 + 0.1 * f})`
        tile.style.zIndex = f > 0.5 ? '2' : '1'
      })

      // The list turns with the strip, so the framed title always sits on the centre line
      const idx = nearestJ % N
      const frac = -ys[nearestJ] / (heights[nearestJ] + GAP)
      const listPos = idx + frac
      const line = 13
      titles.current.forEach((li, i) => {
        if (!li) return
        const off = wrap(i - listPos, N)
        li.style.transform = `translate3d(0, ${(off * line).toFixed(2)}px, 0)`
        li.style.opacity = String(1 - smoothstep(Math.abs(off), N / 2 - 1.5, N / 2 - 0.5))
      })

      // Brackets: closed into one lens at 0, apart at 1
      const gap = H * frame * m.open
      const bh = H * 0.145
      // Side text keeps clear of the brackets
      el.style.setProperty('--vf-clear', `${(gap / 2 + bh * 0.45 + 24).toFixed(1)}px`)
      for (const [el, x] of [
        [left.current, `calc(-100% - ${(gap / 2).toFixed(2)}px)`],
        [right.current, `${(gap / 2).toFixed(2)}px`],
      ] as const) {
        if (!el) continue
        el.style.transform = `translate(${x}, -50%)`
        el.style.height = `${bh}px`
      }

      if (idx !== current) {
        current = idx
        setActive(idx)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [loop, N, size, zoom, frame, snap, intro, reduced])

  // Wheel and trackpad scroll the strip directly; snapping happens when it goes quiet
  useEffect(() => {
    const el = root.current!
    const m = motion.current
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      m.target += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * (e.deltaMode === 1 ? 32 : 1)
      m.lastInput = performance.now()
    }
    const down = (e: PointerEvent) => {
      m.dragging = true
      m.dragY = e.clientY
      m.moved = 0
    }
    const move = (e: PointerEvent) => {
      if (!m.dragging) return
      const dy = e.clientY - m.dragY
      m.dragY = e.clientY
      m.moved += Math.abs(dy)
      m.target -= dy
    }
    const up = () => {
      if (!m.dragging) return
      m.dragging = false
      m.lastInput = performance.now() - 1000
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  // The centre-line text rises in for each new item
  useEffect(() => {
    if (reduced || !metaRow.current) return
    gsap.fromTo(metaRow.current.querySelectorAll('[data-swap]'), { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' })
  }, [active, reduced])

  const item = items[active]
  const swap = 'block overflow-hidden'

  return (
    <div
      ref={root}
      data-lenis-prevent
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${item?.title ?? ''}, ${active + 1} of ${N}`}
      onKeyDown={e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(1)
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(-1)
        else if (e.key === 'Enter') open(active)
        else return
        e.preventDefault()
      }}
      className={`relative touch-none overflow-clip bg-paper text-ink outline-none select-none ${className}`}
    >
      {loop.map((it, j) => (
        <button
          key={`${it.id}-${j}`}
          ref={el => {
            tiles.current[j] = el
          }}
          type="button"
          tabIndex={-1}
          aria-label={it.title}
          onClick={() => {
            if (motion.current.moved > 6) return
            if (j % N === active && Math.abs(wrap(motion.current.centres[j] - motion.current.scroll, motion.current.length)) < 4) open(j)
            else goTo(j % N)
          }}
          className="absolute top-1/2 left-1/2 block cursor-pointer overflow-hidden will-change-transform"
          style={{ visibility: 'hidden' }}
        >
          <img
            src={it.src}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
            onLoad={e => {
              const img = e.currentTarget
              aspects.current[j % N] = img.naturalWidth / img.naturalHeight
            }}
          />
        </button>
      ))}

      <div ref={left} className="pointer-events-none absolute top-1/2 left-1/2 z-10 aspect-[45/100]">
        <Bracket className="h-full w-full" />
      </div>
      <div ref={right} className="pointer-events-none absolute top-1/2 left-1/2 z-10 aspect-[45/100]">
        <Bracket className="h-full w-full -scale-x-100" />
      </div>

      {meta && (
        <div ref={metaRow} className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden h-[13px] -translate-y-1/2 text-[11px] leading-[13px] md:block">
          <div className="absolute inset-y-0 left-3 grid right-[calc(50%+var(--vf-clear,30%))] grid-cols-2 gap-4">
            <ul className="relative">
              {items.map((it, i) => (
                <li
                  key={it.id}
                  ref={el => {
                    titles.current[i] = el
                  }}
                  className="absolute inset-x-0 top-0 truncate"
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => goTo(i)}
                    className={`pointer-events-auto cursor-pointer transition-colors duration-300 ${i === active ? 'text-ink' : 'text-ink/25 hover:text-ink/60'}`}
                  >
                    {it.title}
                  </button>
                </li>
              ))}
            </ul>
            <span className={swap}>
              <span data-swap className="block truncate">
                {item?.category}
              </span>
            </span>
          </div>
          <div className="absolute inset-y-0 right-3 left-[calc(50%+var(--vf-clear,30%))] flex justify-between gap-4">
            <span className={`${swap} min-w-0`}>
              <span data-swap className="block truncate">
                {item?.detail}
              </span>
            </span>
            <span className={`${swap} shrink-0 tabular-nums`}>
              <span data-swap className="block">
                {String(active + 1).padStart(2, '0')}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Small screens: the title and number under the frame */}
      {meta && (
        <p className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-between px-4 text-[11px] md:hidden">
          <span>{item?.title}</span>
          <span className="tabular-nums">{String(active + 1).padStart(2, '0')}</span>
        </p>
      )}
    </div>
  )
}
