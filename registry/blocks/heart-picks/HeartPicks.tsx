import { useId } from 'react'

export interface HeartPick {
  id: string
  title: string
  /** Small italic line under the name */
  note?: string
  /** Leave out for an empty white heart (an "add your own" slot) */
  image?: string
}

export interface HeartPicksProps {
  items: HeartPick[]
  heading?: string
  /** id of the pick that is on; its name lights up in the accent */
  current?: string
  onPick?: (item: HeartPick) => void
  className?: string
}

/**
 * The row of heart-cropped crushes from do-you-have-a-crush-on.me, each with its name
 * in pixel type underneath. The crop is an SVG clipPath in objectBoundingBox units, so
 * any size of tile becomes the same heart; the red halo is a drop-shadow on the parent,
 * because a filter on the clipped element itself would be clipped away.
 */
export default function HeartPicks({ items, heading, current, onPick, className = '' }: HeartPicksProps) {
  const id = `heart-${useId().replace(/:/g, '')}`
  const halo = 'drop-shadow(0 0 2px white) drop-shadow(0 0 6px color-mix(in srgb, var(--color-accent) 90%, transparent))'
  return (
    <section className={className}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <path d="M.5 .2C.4 0 .05 0 .02 .3C0 .55 .3 .78 .5 1C.7 .78 1 .55 .98 .3C.95 0 .6 0 .5 .2z" />
        </clipPath>
      </svg>
      {heading && <h3 className="m-0 font-display text-title">{heading}</h3>}
      <ul className="m-0 mt-2 flex list-none flex-wrap gap-[18px] p-0 max-md:gap-x-[5%] max-md:gap-y-[10px]">
        {items.map(item => {
          const on = current === item.id
          return (
            <li key={item.id} className="w-[132px] text-center max-md:w-[30%]">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onPick?.(item)}
                className="group block w-full cursor-pointer border-0 bg-transparent p-0 text-ink outline-none"
              >
                <span
                  className="block transition-transform duration-300 ease-out-expo group-hover:-rotate-3 group-hover:scale-[1.04] group-focus-visible:scale-[1.06] motion-reduce:transition-none"
                  style={{ filter: halo }}
                >
                  <span
                    className="block aspect-[132/118] w-full bg-white bg-cover bg-center"
                    style={{ clipPath: `url(#${id})`, backgroundImage: item.image ? `url(${item.image})` : undefined }}
                  />
                </span>
                <span
                  className={`mt-[3px] block font-display text-[13px] font-bold leading-tight group-focus-visible:underline ${on ? 'text-accent [text-shadow:0_0_6px_white]' : ''}`}
                >
                  {item.title.toLowerCase()}
                </span>
                {item.note && <i className={`block text-[12px] ${on ? 'text-accent' : ''}`}>{item.note}</i>}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
