import { useEffect, useState, type ReactNode } from 'react'
import Marquee from '@kit/blocks/marquee/Marquee'

export interface DropSheetItem {
  id: string
  label: string
  content: ReactNode
}

/** One row of the stripe: [colour, relative width] pairs */
export type StripeRow = [string, number][]

export interface DropNavProps {
  brand: ReactNode
  sheets: DropSheetItem[]
  /** Words that run across the top of every sheet */
  marquee?: string
  /** Colour bands along the bottom edge of the sheet */
  stripe?: StripeRow[]
  className?: string
}

/**
 * Eylon Malkevich's nav: the links don't go anywhere, they drop printed sheets.
 * The clicked word turns into a tab with a ×, an inverted mono sheet unrolls from
 * under the bar and the page behind dims. Escape, the × or a click outside closes it.
 */
export default function DropNav({ brand, sheets, marquee, stripe, className = '' }: DropNavProps) {
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open])

  return (
    <>
      <div
        aria-hidden
        onClick={() => setOpen(null)}
        className={`fixed inset-0 z-10 bg-paper transition-opacity duration-500 ease-out-expo ${open ? 'opacity-50' : 'pointer-events-none opacity-0'}`}
      />
      <header className={`relative z-20 flex items-start justify-between px-3 md:px-4 ${className}`}>
        <div className="text-headline py-2 font-medium uppercase">{brand}</div>
        <nav className="flex">
          {sheets.map(s => {
            const on = open === s.id
            return (
              <button
                key={s.id}
                type="button"
                aria-expanded={on}
                aria-controls={`sheet-${s.id}`}
                onClick={() => setOpen(on ? null : s.id)}
                className={`text-headline relative cursor-pointer px-[.45em] py-2 font-medium uppercase transition-colors duration-200 ${on ? 'bg-ink text-paper' : ''}`}
              >
                <span className={on ? 'invisible' : ''}>{s.label}</span>
                {on && (
                  <span aria-label="Close" className="absolute inset-0 grid place-items-center font-normal">
                    ×
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {sheets.map(s => {
          const on = open === s.id
          return (
            <div
              key={s.id}
              id={`sheet-${s.id}`}
              role="dialog"
              aria-label={s.label}
              inert={!on}
              style={{ clipPath: on ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' }}
              className="absolute inset-x-3 top-full bg-ink font-mono text-[15px] leading-snug text-paper transition-[clip-path] duration-500 ease-out-expo md:inset-x-4"
            >
              {marquee && (
                <Marquee duration={40} className="pt-3 pb-1 text-[17px] font-medium italic">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className="pr-[.6em]">
                      {marquee}
                    </span>
                  ))}
                </Marquee>
              )}
              <div className="px-4 pb-8 md:px-8">{s.content}</div>
              {stripe && <Stripe rows={stripe} />}
            </div>
          )
        })}
      </header>
    </>
  )
}

/** A rule typed out of carets, as long as its container */
export function CaretRule({ char = '^', className = '' }: { char?: string; className?: string }) {
  return (
    <div aria-hidden className={`overflow-hidden leading-none whitespace-nowrap select-none ${className}`}>
      {char.repeat(400)}
    </div>
  )
}

/** A catalog line: icon, name, details and year over a dashed rule */
export function SheetRow({ icon, name, meta, year, href }: { icon?: ReactNode; name: string; meta?: string; year?: string | number; href?: string }) {
  const Tag = href ? 'a' : 'div'
  return (
    <Tag href={href} className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 border-b border-dashed border-current py-3 md:grid-cols-[3rem_1fr_1fr_auto]">
      <span className="flex h-6 items-center">{icon}</span>
      <span className="font-medium group-hover:underline">{name}</span>
      <span className="hidden font-light md:block">{meta}</span>
      <span className="italic">{year}</span>
    </Tag>
  )
}

/** Stacked bands of flat colour, each segment as wide as its weight */
export function Stripe({ rows, className = '' }: { rows: StripeRow[]; className?: string }) {
  return (
    <div aria-hidden className={className}>
      {rows.map((row, r) => (
        <div key={r} className="flex h-2">
          {row.map(([color, w], i) => (
            <span key={i} style={{ background: color, flexGrow: w }} />
          ))}
        </div>
      ))}
    </div>
  )
}
