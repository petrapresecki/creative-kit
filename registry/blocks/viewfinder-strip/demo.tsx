import { useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import ViewfinderStrip, { type ViewfinderItem } from './ViewfinderStrip'

export const controls: Control[] = [
  { name: 'size', label: 'Thumbnail size', type: 'range', min: 0.08, max: 0.25, step: 0.01, default: 0.15 },
  { name: 'zoom', label: 'Framed zoom', type: 'range', min: 1, max: 1.8, step: 0.05, default: 1.3 },
  { name: 'frame', label: 'Bracket gap', type: 'range', min: 0.2, max: 0.7, step: 0.01, default: 0.41 },
  { name: 'snap', label: 'Snap', type: 'toggle', default: true },
  { name: 'intro', label: 'Intro', type: 'toggle', default: true },
]

// Three images per project: its wide cover, then two portrait stills
const items: ViewfinderItem[] = demoProjects.flatMap(p =>
  [p.image, p.cards[0], p.cards[3]].map((src, n) => ({
    id: `${p.id}-${n}`,
    src,
    title: n === 0 ? p.title : `${p.title} ${String(n + 1).padStart(2, '0')}`,
    category: p.category,
    detail: String(p.year),
  })),
)

export default function Demo({ values }: DemoProps) {
  const [opened, setOpened] = useState<ViewfinderItem | null>(null)
  return (
    <div className="relative">
      <ViewfinderStrip
        key={String(values.intro)}
        items={items}
        size={Number(values.size)}
        zoom={Number(values.zoom)}
        frame={Number(values.frame)}
        snap={Boolean(values.snap)}
        intro={Boolean(values.intro)}
        onOpen={setOpened}
        className="h-[640px]"
      />
      {opened && (
        <button onClick={() => setOpened(null)} className="caption absolute top-3 left-3 z-30 bg-ink px-2 py-1 text-paper">
          Opened {opened.title} · close ×
        </button>
      )}
    </div>
  )
}
