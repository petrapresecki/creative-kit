import { useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoCards, demoProjects } from '@site/data/demo'
import SpiralGallery, { type SpiralItem } from './SpiralGallery'

export const controls: Control[] = [
  { name: 'speed', label: 'Flow speed', type: 'range', min: 0, max: 3, step: 0.25, default: 1 },
  { name: 'highlight', label: 'Highlight group', type: 'select', options: ['none', ...demoProjects.map(p => p.id)], default: 'none' },
]

export default function Demo({ values }: DemoProps) {
  const [opened, setOpened] = useState<SpiralItem | null>(null)
  return (
    <div className="relative">
      <SpiralGallery
        items={demoCards}
        speed={Number(values.speed)}
        highlight={values.highlight === 'none' ? null : String(values.highlight)}
        onOpen={setOpened}
        className="h-[600px]"
      />
      {opened && (
        <button onClick={() => setOpened(null)} className="caption absolute top-3 left-3 z-20 rounded-full bg-paper px-3 py-1.5">
          Opened {opened.label} · close ×
        </button>
      )}
    </div>
  )
}
