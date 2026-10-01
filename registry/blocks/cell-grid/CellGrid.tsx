import type { CSSProperties, ReactNode } from 'react'

export interface CellGridProps {
  /** Columns at desktop width (stacks to one column on phones) */
  cols?: number
  /** CSS grid-template-rows, e.g. '58fr 42fr' */
  rows?: string
  className?: string
  children: ReactNode
}

export interface CellProps {
  colSpan?: number
  rowSpan?: number
  /** `window` cells are transparent, so a background effect shows through */
  tone?: 'paper' | 'ink' | 'accent' | 'mist' | 'window'
  className?: string
  children?: ReactNode
}

const tones = {
  paper: 'bg-paper text-ink',
  ink: 'bg-ink text-paper',
  accent: 'bg-accent text-ink',
  mist: 'bg-mist text-ink',
  window: 'bg-transparent',
}

/** Aspen-style grid: edge-to-edge cells split by 1px ink rules, content anchored bottom-left. */
export function CellGrid({ cols = 4, rows, className = '', children }: CellGridProps) {
  return (
    <div
      className={`grid grid-cols-1 border-t border-l border-ink md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] md:[grid-template-rows:var(--rows)] ${className}`}
      style={{ '--cols': cols, '--rows': rows ?? 'auto' } as CSSProperties}
    >
      {children}
    </div>
  )
}

export function Cell({ colSpan = 1, rowSpan = 1, tone = 'paper', className = '', children }: CellProps) {
  return (
    <div
      className={`flex min-h-[28svh] flex-col justify-between border-r border-b border-ink p-4 md:min-h-0 md:[grid-column:span_var(--cs)] md:[grid-row:span_var(--rs)] md:p-5 ${tones[tone]} ${className}`}
      style={{ '--cs': colSpan, '--rs': rowSpan } as CSSProperties}
    >
      {children}
    </div>
  )
}
