import { useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects, demoText } from '@site/data/demo'
import PillNav from './PillNav'

export const controls: Control[] = [
  { name: 'brand', label: 'Brand', type: 'text', default: 'IP .D' },
  { name: 'expandOnHover', label: 'Open on hover', type: 'toggle', default: true },
]

const pages = ['Creative Space', 'Projects', 'About']

export default function Demo({ values }: DemoProps) {
  const [page, setPage] = useState(0)
  return (
    <div className="relative h-[520px] overflow-hidden bg-paper">
      <PillNav
        position="absolute"
        brand={String(values.brand)}
        onBrandClick={() => setPage(0)}
        expandOnHover={Boolean(values.expandOnHover)}
        links={pages.map((label, i) => ({ label, active: page === i, onClick: () => setPage(i) }))}
      />
      <div key={page} className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
        {page === 0 && (
          <div className="flex gap-2">
            {demoProjects.map(p => (
              <img key={p.id} src={p.cards[0]} alt="" className="h-28 w-20 rounded-kit object-cover md:h-36 md:w-28" />
            ))}
          </div>
        )}
        {page === 1 && (
          <p className="flex gap-[0.4em] text-body">
            <span className="font-medium">A Curated Selection of</span>
            <span className="font-display">{demoProjects.length} Branding and Editorial Projects</span>
          </p>
        )}
        {page === 2 && <p className="max-w-[16em] font-display text-headline">{demoText.statement}</p>}
        <p className="caption text-muted">Click the numbers</p>
      </div>
    </div>
  )
}
