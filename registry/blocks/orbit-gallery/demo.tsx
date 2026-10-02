import { useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoCards, demoProjects } from '@site/data/demo'
import OrbitGallery, { type OrbitItem, type OrbitShape } from './OrbitGallery'

export const controls: Control[] = [
  { name: 'shape', label: 'Shape', type: 'select', options: ['spiral', 'cone', 'sphere', 'ellipsoid', 'torus', 'globe'], default: 'spiral' },
  { name: 'motion', label: 'Motion', type: 'select', options: ['default', 'flow', 'turn'], default: 'default' },
  { name: 'speed', label: 'Speed', type: 'range', min: 0, max: 3, step: 0.25, default: 1 },
  { name: 'highlight', label: 'Highlight group', type: 'select', options: ['none', ...demoProjects.map(p => p.id)], default: 'none' },
]

export default function Demo({ values }: DemoProps) {
  const [opened, setOpened] = useState<OrbitItem | null>(null)
  return (
    <div className="relative">
      <OrbitGallery
        items={demoCards}
        shape={(values.shape as OrbitShape) ?? 'spiral'}
        speed={Number(values.speed)}
        motion={values.motion === 'default' ? undefined : (values.motion as 'flow' | 'turn')}
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
