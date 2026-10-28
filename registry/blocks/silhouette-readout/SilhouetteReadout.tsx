import { useId, useState } from 'react'

/** Six objects drawn to pack together on a 600 × 400 board. Use them, or draw your own on the same board. */
export const objectShapes = {
  key: 'M88 40a70 70 0 1 0 0 140a70 70 0 0 0 66-46h120v34h26v-34h20v20h26v-20h18v-34H154A70 70 0 0 0 88 40zm0 48a22 22 0 1 1 0 44a22 22 0 0 1 0-44z',
  bulb: 'M430 28a78 78 0 0 0-46 141c10 8 14 18 14 30v16h64v-16c0-12 4-22 14-30a78 78 0 0 0-46-141zM402 222h56v14h-56zM408 242h44l-8 16h-28z',
  metronome: 'M78 200h76l42 196H36zM118 368l58-170 14 5-58 170z',
  notes: 'M262 196l118-30v176a34 26-20 1 1-14-22V214l-90 23v126a34 26-20 1 1-14-22z',
  speaker: 'M414 284h54v76h-54zM468 284l90-46v168l-90-46z',
  drop: 'M548 24c-14 46-52 78-52 120a52 52 0 0 0 104 0c0-42-38-74-52-120z',
}

export interface SilhouetteItem {
  id: string
  /** Short name in brackets in the list */
  label: string
  /** The value that follows it */
  head: string
  /** SVG path on the board (see `objectShapes`) */
  shape: string
  /** Fills the shape while it is on; falls back to the shared `image` */
  image?: string
  /** Key–value lines shown under the list while this item is on */
  rows?: [string, string][]
}

export interface SilhouetteReadoutProps {
  items: SilhouetteItem[]
  /** Shared fill for items without their own image */
  image?: string
  /** Bold label at the start of the list */
  heading?: string
  /** viewBox of the board the shapes are drawn on */
  board?: string
  className?: string
}

/**
 * After eylonmalkevich.com, as a readout: flat white silhouettes packed into one
 * cluster, each standing for one part of a reading. Point at a shape, or its name in
 * the run-in list below, and it fills with the image, seen through a window cut in
 * that shape; its numbers appear underneath. The list is the accessible way in;
 * the shapes are a mouse-only mirror of it, so touch and keyboard lose nothing.
 */
export default function SilhouetteReadout({ items, image, heading = 'READ:', board = '0 0 600 400', className = '' }: SilhouetteReadoutProps) {
  const uid = useId().replace(/:/g, '')
  const [on, setOn] = useState(items[0]?.id)
  const cur = items.find(i => i.id === on)
  const [, , w, h] = board.split(' ').map(Number)
  const glow = (a: number, r: number) => `drop-shadow(0 0 ${r}px color-mix(in srgb, var(--color-accent) ${a}%, transparent))`

  return (
    <section className={`min-w-0 ${className}`}>
      <svg viewBox={board} aria-hidden className="block w-full overflow-visible">
        <defs>
          {items.map(i => (
            <pattern key={i.id} id={`${uid}-${i.id}`} patternUnits="userSpaceOnUse" width={w} height={h}>
              {(i.image ?? image) && <image href={i.image ?? image} width={w} height={h} preserveAspectRatio="xMidYMid slice" />}
            </pattern>
          ))}
        </defs>
        {items.map(i => {
          const lit = on === i.id
          return (
            <path
              key={i.id}
              d={i.shape}
              fillRule="evenodd"
              onPointerEnter={() => setOn(i.id)}
              className="cursor-pointer transition-[filter] duration-300 motion-reduce:transition-none"
              style={{
                fill: lit ? `url(#${uid}-${i.id})` : 'white',
                filter: lit
                  ? `drop-shadow(0 0 2px white) ${glow(85, 14)}`
                  : `drop-shadow(0 0 1px color-mix(in srgb, var(--color-ink) 35%, transparent)) ${glow(55, 10)}`,
              }}
            />
          )
        })}
      </svg>

      <p className="m-0 mt-3 font-mono text-lead">
        <span className="font-display text-[15px] font-bold tracking-[.04em]">{heading} </span>
        {items.map(i => {
          const lit = on === i.id
          return (
            <button
              key={i.id}
              type="button"
              aria-pressed={lit}
              onClick={() => setOn(i.id)}
              onFocus={() => setOn(i.id)}
              onPointerEnter={() => setOn(i.id)}
              className={`mr-3 inline cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 font-mono text-inherit transition-colors ${lit ? 'text-ink' : 'text-ink/45 hover:text-ink'}`}
            >
              <span className={`font-sans text-[14px] ${lit ? 'text-accent' : ''}`}>[{i.label}]</span> {i.head}
            </button>
          )
        })}
      </p>

      {cur?.rows && (
        <dl className="m-0 mt-2 flex flex-wrap gap-x-[18px] gap-y-[2px] text-[13.5px]">
          {cur.rows.map(([k, v]) => (
            <div key={k} className="flex gap-1.5">
              <dt className="text-muted">{k}</dt>
              <dd className="m-0 font-bold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
