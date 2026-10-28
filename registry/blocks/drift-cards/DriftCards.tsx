import { useRef, type CSSProperties, type ReactNode } from 'react'
import { prefersReducedMotion } from '@kit/lib/gsap'

export interface DriftCardItem {
  id: string
  title: string
  /** Discipline, e.g. "Visual identity" */
  kind?: string
  /** One line about the project */
  note?: string
  /** Background photo */
  image?: string
  /** Replaces the background photo (e.g. a <ModeSwap>) */
  media?: ReactNode
  /** The thing that floats over the photo: an image URL (shown as a 4:5 print with a paper border and shadow) or any node */
  object?: string | ReactNode
  /** CSS width of the object, default 58% */
  objectWidth?: string
  href?: string
  /** Per-card styles, handy for CSS variables such as --label */
  style?: CSSProperties
}

export interface DriftCardsProps {
  items: DriftCardItem[]
  /** How far the object drifts with the pointer, in px each way */
  drift?: number
  onOpen?: (item: DriftCardItem) => void
  className?: string
  labelClassName?: string
  titleClassName?: string
  textClassName?: string
}

/**
 * Liya Kedar's project columns: edge-to-edge cards split by 2px rules, each a photo with
 * an object floating on its own layer that drifts toward the pointer, and a label
 * (title, discipline, one-liner) that fills with the accent on hover.
 */
export default function DriftCards({ items, drift = 7, onOpen, className = '', labelClassName = '', titleClassName = '', textClassName = '' }: DriftCardsProps) {
  return (
    <div
      style={{ '--n': items.length } as CSSProperties}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:h-full lg:grid-cols-[repeat(var(--n),minmax(0,1fr))] ${className}`}
    >
      {items.map(item => (
        <DriftCard
          key={item.id}
          item={item}
          drift={drift}
          onOpen={onOpen}
          labelClassName={labelClassName}
          titleClassName={titleClassName}
          textClassName={textClassName}
        />
      ))}
    </div>
  )
}

interface DriftCardProps extends Required<Pick<DriftCardsProps, 'drift' | 'labelClassName' | 'titleClassName' | 'textClassName'>> {
  item: DriftCardItem
  onOpen?: (item: DriftCardItem) => void
}

function DriftCard({ item, drift, onOpen, labelClassName, titleClassName, textClassName }: DriftCardProps) {
  const object = useRef<HTMLDivElement>(null)

  const move = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || !object.current || prefersReducedMotion()) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * drift
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2 * drift
    object.current.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
  }
  const leave = () => {
    if (object.current) object.current.style.transform = ''
  }

  const Tag = item.href ? 'a' : 'div'

  return (
    <Tag
      href={item.href}
      onClick={() => onOpen?.(item)}
      onPointerMove={move}
      onPointerLeave={leave}
      style={item.style}
      className={`group flex min-w-0 flex-col border-b-2 border-ink sm:border-r-2 sm:even:border-r-0 lg:border-b-0 lg:even:border-r-2 lg:last:border-r-0 ${onOpen || item.href ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-ink lg:aspect-auto lg:min-h-0 lg:flex-1">
        <div className="absolute inset-0">{item.media ?? (item.image && <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />)}</div>
        {item.object && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div
              ref={object}
              style={{ width: item.objectWidth ?? '58%' }}
              className="transition-transform duration-[350ms] ease-[cubic-bezier(.22,.61,.36,1)]"
            >
              {typeof item.object === 'string' ? (
                <img src={item.object} alt="" loading="lazy" className="block aspect-[4/5] w-full bg-paper object-cover p-[4%] shadow-[0_22px_40px_-14px_rgb(0_0_0/0.55)]" />
              ) : (
                item.object
              )}
            </div>
          </div>
        )}
      </div>
      <div className={`px-4 py-4 transition-colors duration-200 group-hover:bg-accent md:px-6 md:py-5 lg:h-[clamp(112px,15vh,160px)] lg:shrink-0 ${labelClassName}`}>
        <h3 className={`text-title uppercase ${titleClassName}`}>{item.title}</h3>
        {item.kind && <p className={`mt-2 text-[clamp(13px,1.12vw,20px)] leading-tight ${textClassName}`}>{item.kind}</p>}
        {item.note && <p className={`mt-1.5 text-[clamp(12px,0.98vw,18px)] leading-tight italic ${textClassName}`}>{item.note}</p>}
      </div>
    </Tag>
  )
}
