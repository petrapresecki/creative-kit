import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@kit/lib/gsap'

export interface MosaicVideoProps {
  src: string
  poster?: string
  /** Size of one mosaic cell in CSS px */
  cell?: number
  /** How many mosaic patches drift over the video at once */
  patches?: number
  /** Milliseconds between patch moves */
  interval?: number
  className?: string
  /** Laid over the video, e.g. a title */
  children?: React.ReactNode
}

interface Patch {
  x: number
  y: number
  w: number
  h: number
}

const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))

/**
 * From locomotive.ca: a full-bleed video with a few patches drawn as big square pixels,
 * like censor bars, that jump to new spots and shapes every few hundred ms. Canvas 2D:
 * the frame is drawn tiny, then scaled up without smoothing inside each patch.
 */
export default function MosaicVideo({ src, poster, cell = 48, patches = 3, interval = 420, className = '', children }: MosaicVideoProps) {
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = root.current!
    const vid = video.current!
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const small = document.createElement('canvas')
    const sctx = small.getContext('2d')!
    const still = prefersReducedMotion()
    let cols = 1
    let rows = 1
    let list: Patch[] = []
    let raf = 0
    let timer = 0
    let visible = false

    // Patches favour the middle band of the frame, where faces and subjects usually are
    const place = (): Patch => {
      const w = Math.min(cols, rand(3, Math.max(4, Math.round(cols * 0.45))))
      const h = Math.min(rows, rand(2, Math.max(2, Math.round(rows * 0.3))))
      return { x: rand(0, cols - w), y: rand(Math.round(rows * 0.1), Math.max(0, Math.round(rows * 0.6) - h)), w, h }
    }
    const shuffle = () => {
      list = list.map(p => (Math.random() < 0.5 ? place() : { ...p, x: Math.max(0, Math.min(cols - p.w, p.x + rand(-2, 2))), w: Math.max(2, p.w + rand(-2, 2)) }))
    }

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      Object.assign(cv, { width: Math.round(el.clientWidth * dpr), height: Math.round(el.clientHeight * dpr) })
      cols = Math.max(1, Math.ceil(el.clientWidth / cell))
      rows = Math.max(1, Math.ceil(el.clientHeight / cell))
      Object.assign(small, { width: cols, height: rows })
      list = Array.from({ length: patches }, place)
    }

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (vid.readyState < 2) return
      const vw = vid.videoWidth
      const vh = vid.videoHeight
      const cw = el.clientWidth
      const ch = el.clientHeight
      // object-fit: cover, matching the <video> underneath
      const s = Math.max(cw / vw, ch / vh)
      const sw = (cols * cell) / s
      const sh = (rows * cell) / s
      sctx.drawImage(vid, (vw - cw / s) / 2, (vh - ch / s) / 2, sw, sh, 0, 0, cols, rows)
      const k = cv.width / cw
      ctx.clearRect(0, 0, cv.width, cv.height)
      ctx.imageSmoothingEnabled = false
      for (const p of list) ctx.drawImage(small, p.x, p.y, p.w, p.h, p.x * cell * k, p.y * cell * k, p.w * cell * k, p.h * cell * k)
    }

    const start = () => {
      if (raf) return
      vid.play().catch(() => {})
      raf = requestAnimationFrame(frame)
      if (!still) timer = window.setInterval(shuffle, interval)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
      raf = 0
      vid.pause()
    }

    size()
    const ro = new ResizeObserver(size)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(el)
    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
    }
  }, [src, cell, patches, interval])

  return (
    <div ref={root} data-media className={`relative overflow-hidden bg-ink ${className}`}>
      <video ref={video} src={src} poster={poster} muted loop playsInline preload="auto" className="absolute inset-0 size-full object-cover" />
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      {children && <div className="relative h-full">{children}</div>}
    </div>
  )
}
