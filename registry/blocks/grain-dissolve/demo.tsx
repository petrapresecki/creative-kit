import { useRef } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import GrainDissolve from './GrainDissolve'

export const controls: Control[] = [
  { name: 'mode', label: 'Mode', type: 'select', options: ['both', 'out', 'in', 'hover', 'manual'], default: 'both' },
  { name: 'amount', label: 'Amount (hover, manual)', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
  { name: 'grain', label: 'Grain (px)', type: 'range', min: 1, max: 6, step: 0.5, default: 2 },
]

export default function Demo({ values }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const mode = values.mode as 'both' | 'out' | 'in' | 'hover' | 'manual'
  const props = { mode, amount: Number(values.amount), grain: Number(values.grain), scroller }
  const still = mode === 'hover' || mode === 'manual'
  return (
    <div ref={scroller} data-lenis-prevent className="h-[520px] overflow-y-auto">
      <p className="caption p-4">{still ? (mode === 'hover' ? 'Hover the title or the image' : 'Drag “Amount”') : 'Scroll inside this frame'}</p>
      <div className={`grid gap-24 px-6 md:px-12 ${still ? 'pt-6 pb-16' : 'pt-[40vh] pb-[60vh]'}`}>
        {demoProjects.slice(0, still ? 1 : 3).map(p => (
          <div key={p.id} className="grid gap-6 md:grid-cols-2 md:items-end">
            <GrainDissolve key={JSON.stringify(values)} {...props}>
              <p className="font-display text-display">{p.title}.</p>
            </GrainDissolve>
            <GrainDissolve key={JSON.stringify(values) + 'img'} {...props}>
              <img src={p.image} alt="" className="aspect-[4/3] w-full rounded-kit object-cover" />
            </GrainDissolve>
          </div>
        ))}
      </div>
    </div>
  )
}
