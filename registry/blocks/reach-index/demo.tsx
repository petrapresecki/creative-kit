import { useRef } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import ReachIndex from './ReachIndex'

export const controls: Control[] = [{ name: 'grain', label: 'Title grain over the card', type: 'range', min: 0, max: 0.7, step: 0.05, default: 0.35 }]

const items = demoProjects.map(p => ({ id: p.id, title: `${p.title}.`, meta: `${p.title} / ${p.category}`, image: p.image }))

export default function Demo({ values }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div ref={scroller} data-lenis-prevent className="h-[600px] overflow-y-auto">
      <p className="caption p-4">Scroll, then hover a title</p>
      <ReachIndex items={items} grain={Number(values.grain)} scroller={scroller} className="px-6 pb-[20vh] md:px-12" />
    </div>
  )
}
