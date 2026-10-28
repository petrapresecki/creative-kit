import { useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import HeartPicks from './HeartPicks'

export const controls: Control[] = [
  { name: 'heading', label: 'Heading', type: 'text', default: 'these are my project crushes:' },
  { name: 'empty', label: 'Empty heart at the end', type: 'toggle', default: true },
]

export default function Demo({ values }: DemoProps) {
  const [current, setCurrent] = useState(demoProjects[0].id)
  const items = [
    ...demoProjects.map(p => ({ id: p.id, title: p.title, note: `${p.category.split(',')[0].toLowerCase()}, ${p.year}`, image: p.image })),
    ...(values.empty ? [{ id: 'yours', title: 'your own', note: 'drop it here' }] : []),
  ]
  return (
    <div className="bg-mist px-6 py-14 md:px-12">
      <HeartPicks items={items} heading={String(values.heading)} current={current} onPick={p => setCurrent(p.id)} />
    </div>
  )
}
