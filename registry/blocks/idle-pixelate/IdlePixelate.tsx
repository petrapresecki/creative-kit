import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@kit/lib/gsap'

export interface IdlePixelateProps {
  src: string
  alt: string
  /** Block size in CSS px while nobody is looking */
  block?: number
  /** Milliseconds after the pointer leaves before the mosaic comes back */
  idle?: number
  /** Label on the detection box, e.g. an @handle. Leave empty for no box */
  tag?: string
  /** Detection box as fractions of the image: x, y, width, height */
  box?: [number, number, number, number]
  className?: string
}

// Block sizes stepped through on the way to sharp (1 = the real image)
const STEPS = [1, 0.5, 0.25, 0.12, 0]

/**
 * From barbianaliu.com: an image that falls apart into big square pixels when left
 * alone and snaps sharp under the pointer, with a camera-style detection box and tag.
 * Canvas 2D. On touch screens a tap toggles it.
 */
export default function IdlePixelate({
  src,
  alt,
  block = 18,
  idle = 700,
  tag = '',
  box = [0.2, 0.04, 0.6, 0.32],
  className = '',
}: IdlePixelateProps) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ratio, setRatio] = useState<number>()
  const [sharp, setSharp] = useState(false)

  useEffect(() => {
    const el = root.current!
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const small = document.createElement('canvas')
    const sctx = small.getContext('2d')!
    const img = new Image()
    let level = 1 // 1 = full mosaic, 0 = sharp
    let target = 1
    let timer = 0
    let leaveTimer = 0

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(el.clientWidth * dpr)
      const h = Math.round(el.clientHeight * dpr)
      if (!img.naturalWidth || !w || !h) return
      if (cv.width !== w || cv.height !== h) Object.assign(cv, { width: w, height: h })
      ctx.clearRect(0, 0, w, h)
      const px = level * block * dpr
      if (px < 1.5) {
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(img, 0, 0, w, h)
        return
      }
      const sw = Math.max(1, Math.ceil(w / px))
      const sh = Math.max(1, Math.ceil(h / px))
      Object.assign(small, { width: sw, height: sh })
      sctx.drawImage(img, 0, 0, sw, sh)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(small, 0, 0, sw, sh, 0, 0, w, h)
    }

    // Step through a few block sizes rather than tweening, so it reads as a camera refocusing
    const go = (to: number) => {
      target = to
      clearInterval(timer)
      if (prefersReducedMotion()) {
        level = to
        draw()
        return
      }
      const path = to === 0 ? STEPS : [...STEPS].reverse()
      let i = path.findIndex(s => (to === 0 ? s < level : s > level))
      if (i < 0) return
      timer = window.setInterval(() => {
        level = path[i++]
        draw()
        if (level === target || i >= path.length) clearInterval(timer)
      }, 70)
    }

    const enter = () => {
      clearTimeout(leaveTimer)
      setSharp(true)
      go(0)
    }
    const leave = () => {
      clearTimeout(leaveTimer)
      leaveTimer = window.setTimeout(() => {
        setSharp(false)
        go(1)
      }, idle)
    }
    const tap = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      if (target === 0) {
        setSharp(false)
        go(1)
      } else enter()
    }

    img.onload = () => {
      setRatio(img.naturalWidth / img.naturalHeight)
      requestAnimationFrame(draw)
    }
    img.src = src

    const ro = new ResizeObserver(draw)
    ro.observe(el)
    const over = (e: PointerEvent) => e.pointerType === 'mouse' && enter()
    const out = (e: PointerEvent) => e.pointerType === 'mouse' && leave()
    el.addEventListener('pointerenter', over)
    el.addEventListener('pointerleave', out)
    el.addEventListener('pointerup', tap)
    return () => {
      ro.disconnect()
      clearInterval(timer)
      clearTimeout(leaveTimer)
      el.removeEventListener('pointerenter', over)
      el.removeEventListener('pointerleave', out)
      el.removeEventListener('pointerup', tap)
    }
  }, [src, block, idle])

  const [x, y, w, h] = box
  return (
    <div ref={root} className={`relative w-full ${className}`} style={{ aspectRatio: ratio ?? 3 / 4 }}>
      <canvas ref={canvas} role="img" aria-label={alt} className="absolute inset-0 size-full" />
      {tag && (
        <div
          aria-hidden
          className="pointer-events-none absolute border border-accent transition-opacity duration-150"
          style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%`, opacity: sharp ? 1 : 0 }}
        >
          <span className="caption absolute bottom-full left-0 bg-accent px-1.5 py-0.5 whitespace-nowrap text-ink">{tag}</span>
        </div>
      )}
    </div>
  )
}
