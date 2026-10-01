import type { CSSProperties, ReactNode } from 'react'

export interface AxisGridProps {
  /** Number of columns (Bleibtgleich uses 8) */
  columns?: number
  /** Column line the vertical axis sits on, 0 for none */
  axis?: number
  /** Show the column guides */
  guides?: boolean
  className?: string
  children: ReactNode
}

export interface AxisLineProps {
  /** Starting column, 1-based */
  start: number
  /** Ending column line (exclusive), defaults to the last line */
  end?: number
  className?: string
  children: ReactNode
}

/**
 * Bleibtgleich-style typographic grid: big lines of text hang off different
 * columns, crossed by a single vertical axis. Text gets a paper backing so the
 * axis breaks where type crosses it.
 */
export function AxisGrid({ columns = 8, axis = 3, guides = false, className = '', children }: AxisGridProps) {
  return (
    <div
      className={`relative grid gap-x-4 [grid-template-columns:repeat(var(--columns),minmax(0,1fr))] ${className}`}
      style={{ '--columns': columns } as CSSProperties}
    >
      {guides && (
        <div aria-hidden className="pointer-events-none absolute inset-0 grid gap-x-4 [grid-template-columns:repeat(var(--columns),minmax(0,1fr))]">
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="bg-accent/15" />
          ))}
        </div>
      )}
      {axis > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-ink"
          style={{ left: `calc(${axis} * (100% - ${columns - 1} * 1rem) / ${columns} + ${axis - 0.5} * 1rem)` }}
        />
      )}
      {children}
    </div>
  )
}

export function AxisLine({ start, end, className = '', children }: AxisLineProps) {
  return (
    <div className="relative col-span-full md:[grid-column:var(--s)/var(--e)]" style={{ '--s': start, '--e': end ?? -1 } as CSSProperties}>
      {/* Paper backing (also on lines split by MeltText) so the axis breaks where type crosses it */}
      <span className={`inline bg-paper [box-decoration-break:clone] [&_.kit-melt-line]:w-fit [&_.kit-melt-line]:bg-paper ${className}`}>{children}</span>
    </div>
  )
}
