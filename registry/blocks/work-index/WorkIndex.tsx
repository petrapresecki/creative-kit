import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@kit/lib/gsap'
import MeltText from '@kit/blocks/melt-text/MeltText'
import LazyVideo from '@kit/blocks/lazy-video/LazyVideo'

export interface WorkIndexItem {
  id: string
  title: string
  meta?: string
  year?: string | number
  /** Video or image URL for the floating preview */
  preview: string
}

export interface WorkIndexProps {
  items: WorkIndexItem[]
  onOpen?: (item: WorkIndexItem) => void
  className?: string
}

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

/**
 * Bleibtgleich-style index: the titles are the layout. Hovering a row wipes it
 * with the accent colour and a preview window trails the pointer, tilting with its speed.
 */
export default function WorkIndex({ items, onOpen, className = '' }: WorkIndexProps) {
  const root = useRef<HTMLDivElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [shown, setShown] = useState(0)

  useGSAP(
    () => {
      const el = preview.current!
      const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' })
      const tilt = gsap.quickTo(el, 'rotation', { duration: 0.5, ease: 'power3' })
      let lastX = 0
      const move = (e: PointerEvent) => {
        xTo(e.clientX)
        yTo(e.clientY)
        tilt(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4))
        lastX = e.clientX
      }
      window.addEventListener('pointermove', move)
      return () => window.removeEventListener('pointermove', move)
    },
    { scope: root },
  )

  const enter = (i: number) => {
    setActive(i)
    setShown(i)
  }

  return (
    <div ref={root} className={className}>
      <ul className="border-t border-ink" onMouseLeave={() => setActive(null)}>
        {items.map((item, i) => (
          <li key={item.id} className="border-b border-ink">
            <button
              onMouseEnter={() => enter(i)}
              onFocus={() => enter(i)}
              onBlur={() => setActive(null)}
              onClick={() => onOpen?.(item)}
              className="group relative block w-full overflow-hidden px-4 py-4 text-left md:px-5 md:py-5"
            >
              <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-500 ease-out-expo group-hover:translate-y-0" />
              <span className="relative grid grid-cols-[auto_1fr] items-end gap-x-4 md:grid-cols-[6ch_1fr_auto]">
                <span className="caption self-start md:pt-3">({String(i + 1).padStart(2, '0')})</span>
                <MeltText as="span" className="block text-display transition-transform duration-500 ease-out-expo group-hover:translate-x-[0.12em]">
                  {item.title}
                </MeltText>
                <span className="caption col-start-2 mt-3 flex gap-4 md:col-start-3 md:mt-0 md:flex-col md:items-end md:gap-1 md:pb-3 md:text-right">
                  {item.meta && <span>{item.meta}</span>}
                  {item.year && <span className="text-muted group-hover:text-ink">{item.year}</span>}
                </span>
              </span>
            </button>
            {/* Touch screens can't hover, so show the preview inline */}
            <div className="px-4 pb-4 md:hidden">
              <div data-media className="aspect-video overflow-hidden rounded-kit bg-mist">
                {isVideo(item.preview) ? <LazyVideo src={item.preview} className="h-full w-full object-cover" /> : <img src={item.preview} alt="" className="h-full w-full object-cover" />}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Floating preview; every clip stays mounted so switching rows doesn't reload them */}
      <div ref={preview} className="pointer-events-none fixed top-0 left-0 z-30 hidden md:block">
        <div
          className={`relative aspect-video w-[30vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-kit bg-ink transition-[clip-path] duration-500 ease-out-expo ${
            active === null ? '[clip-path:inset(50%_50%_50%_50%)]' : '[clip-path:inset(0%_0%_0%_0%)]'
          }`}
        >
          {items.map((item, i) => (
            <div key={item.id} className={`absolute inset-0 transition-opacity duration-300 ${i === shown ? 'opacity-100' : 'opacity-0'}`}>
              {isVideo(item.preview) ? <LazyVideo src={item.preview} className="h-full w-full object-cover" /> : <img src={item.preview} alt="" className="h-full w-full object-cover" />}
            </div>
          ))}
          {items[shown] && <span className="caption absolute bottom-2 left-2 rounded-full bg-accent px-2 py-1 text-ink">{items[shown].title} →</span>}
        </div>
      </div>
    </div>
  )
}
