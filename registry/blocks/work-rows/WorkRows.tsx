import { useRef } from 'react'
import { gsap, useGSAP } from '@kit/lib/gsap'
import LazyVideo from '@kit/blocks/lazy-video/LazyVideo'
import RollText from '@kit/blocks/roll-text/RollText'

export interface WorkRowItem {
  id: string
  title: string
  meta?: string
  year?: string | number
  /** Up to three video or image URLs */
  media: string[]
}

export interface WorkRowsProps {
  items: WorkRowItem[]
  onOpen?: (item: WorkRowItem) => void
  className?: string
}

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

/** Aspen-style rows: a title cell plus three media cells per project, split by 1px rules. */
export default function WorkRows({ items, onOpen, className = '' }: WorkRowsProps) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-row]').forEach(row => {
        gsap.from(row.querySelectorAll('[data-cell]'), {
          y: 80,
          opacity: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: row, start: 'top 85%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className={`border-t border-ink ${className}`}>
      {items.map((item, r) => (
        <div
          key={item.id}
          data-row
          role="button"
          onClick={() => onOpen?.(item)}
          className="group grid grid-cols-2 border-b border-ink md:h-[58svh] md:grid-cols-4"
        >
          <div
            data-cell
            className="col-span-2 flex min-h-[34svh] flex-col justify-between border-b border-ink px-4 py-4 transition-colors duration-300 group-hover:bg-accent md:col-span-1 md:min-h-0 md:border-r md:border-b-0 md:px-5 md:py-5"
          >
            <p className="caption flex justify-between">
              <span>({String(r + 1).padStart(2, '0')})</span>
              <span>{item.year}</span>
            </p>
            <div>
              <h3 className="text-title">
                <RollText text={item.title} />
              </h3>
              {item.meta && <p className="mt-3 max-w-[24ch] text-[15px] leading-snug font-medium">{item.meta}</p>}
              <p className="caption mt-6 flex items-center gap-2">
                Open project <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </p>
            </div>
          </div>
          {item.media.slice(0, 3).map((src, i) => (
            <div
              key={src + i}
              data-cell
              className={`overflow-hidden border-ink ${i === 0 ? 'col-span-2 aspect-video border-b md:col-span-1 md:aspect-auto md:border-b-0' : 'aspect-[4/5] md:aspect-auto'} ${i < 2 ? 'border-r' : ''}`}
            >
              {isVideo(src) ? (
                <LazyVideo src={src} className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
              ) : (
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
