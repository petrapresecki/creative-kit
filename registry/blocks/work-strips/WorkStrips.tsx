import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@kit/lib/gsap'
import LazyVideo from '@kit/blocks/lazy-video/LazyVideo'
import RollText from '@kit/blocks/roll-text/RollText'

export interface WorkStripItem {
  id: string
  title: string
  meta?: string
  /** Video or image URL */
  media: string
}

export interface WorkStripsProps {
  items: WorkStripItem[]
  onOpen?: (item: WorkStripItem) => void
  className?: string
}

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src)

/**
 * All the work in one screen: strips side by side, resting in black and white.
 * The one under the pointer widens and comes into full colour.
 */
export default function WorkStrips({ items, onOpen, className = '' }: WorkStripsProps) {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      gsap.from('[data-strip]', {
        clipPath: 'inset(100% 0% 0% 0%)',
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className={`flex flex-col border-y border-ink md:h-[82svh] md:flex-row ${className}`}>
      {items.map((item, i) => {
        const open = i === active
        const media = `absolute inset-0 h-full w-full object-cover transition-[filter,scale] duration-700 ease-out-expo ${open ? 'scale-100 grayscale-0' : 'scale-110 grayscale'}`
        return (
          <button
            key={item.id}
            data-strip
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => onOpen?.(item)}
            style={{ flexGrow: open ? 4 : 1 }}
            className="group relative h-[46svh] min-w-0 basis-0 overflow-hidden border-b border-ink text-left transition-[flex-grow] duration-700 ease-out-expo last:border-0 md:h-auto md:border-r md:border-b-0"
          >
            {isVideo(item.media) ? <LazyVideo src={item.media} className={media} /> : <img src={item.media} alt="" className={media} />}
            <span className={`absolute inset-0 bg-paper transition-opacity duration-700 ${open ? 'opacity-0' : 'opacity-25'}`} />

            <span className="caption absolute top-3 left-3 bg-paper px-1.5 py-0.5 md:top-4 md:left-4">({String(i + 1).padStart(2, '0')})</span>
            {/* Vertical title while narrow, full details once open */}
            <span
              className={`absolute bottom-4 left-3 hidden text-title whitespace-nowrap text-white mix-blend-difference transition-opacity duration-300 [writing-mode:vertical-rl] md:block md:rotate-180 ${
                open ? 'opacity-0' : 'opacity-100 delay-200'
              }`}
            >
              {item.title}
            </span>
            <span
              className={`absolute inset-x-3 bottom-3 flex items-end justify-between gap-4 transition-[opacity,translate] duration-500 md:inset-x-4 md:bottom-4 ${
                open ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-100 md:opacity-0'
              }`}
            >
              <span className="bg-paper px-3 pt-2 pb-3">
                <span className="block text-headline">
                  <RollText text={item.title} />
                </span>
                {item.meta && <span className="caption mt-2 block">{item.meta}</span>}
              </span>
              <span className="caption shrink-0 bg-accent px-2 py-1 text-ink">Open →</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
