import { useState } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import RingCarousel, { type RingItem } from './RingCarousel'

export const controls: Control[] = [
  { name: 'heroSize', label: 'Hero size', type: 'range', min: 0.3, max: 0.65, step: 0.01, default: 0.47 },
  { name: 'tilt', label: 'Pointer tilt', type: 'range', min: 0, max: 2, step: 0.1, default: 1 },
  { name: 'fog', label: 'Back fade', type: 'range', min: 0, max: 1, step: 0.05, default: 0.55 },
  { name: 'autoplay', label: 'Autoplay (s)', type: 'range', min: 0, max: 6, step: 0.5, default: 0 },
  { name: 'intro', label: 'Intro', type: 'toggle', default: true },
]

// Ten items with mixed shapes: each project's wide cover, then its portrait stills
const items: RingItem[] = Array.from({ length: 10 }, (_, i) => {
  const p = demoProjects[i % demoProjects.length]
  const n = Math.floor(i / demoProjects.length)
  return { id: `${p.id}-${n}`, src: n === 0 ? p.image : p.cards[n], title: p.title, meta: String(p.year) }
})

export default function Demo({ values }: DemoProps) {
  const [opened, setOpened] = useState<RingItem | null>(null)
  return (
    <div className="relative">
      <RingCarousel
        key={String(values.intro)}
        items={items}
        introText="A small studio for identities, books, packaging and the odd website"
        intro={Boolean(values.intro)}
        heroSize={Number(values.heroSize)}
        tilt={Number(values.tilt)}
        fog={Number(values.fog)}
        autoplay={Number(values.autoplay)}
        onOpen={setOpened}
        className="h-[640px]"
      />
      {opened && (
        <button onClick={() => setOpened(null)} className="caption absolute top-3 left-3 z-20 bg-ink px-2 py-1 text-paper">
          Opened {opened.title} · close ×
        </button>
      )}
    </div>
  )
}
