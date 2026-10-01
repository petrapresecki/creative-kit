import { useRef } from 'react'
import { demoProjects } from '@site/data/demo'
import FisheyeIndex from './FisheyeIndex'

const sections = [{ id: 'fe-intro', label: 'Intro' }, ...demoProjects.map(p => ({ id: `fe-${p.id}`, label: p.title })), { id: 'fe-contact', label: 'Contact' }]
const tones = ['bg-paper', 'bg-mist', 'bg-accent', 'bg-mist', 'bg-paper', 'bg-accent']

export default function Demo() {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div ref={scroller} data-lenis-prevent className="relative h-[560px] overflow-y-auto">
      {sections.map((s, i) => (
        <section key={s.id} id={s.id} className={`flex h-[420px] items-end justify-end p-6 ${tones[i]}`}>
          <p className="text-headline">{s.label}</p>
        </section>
      ))}
      <FisheyeIndex sections={sections} scroller={scroller} className="sticky bottom-4 left-4 -mt-[200px] h-[200px] w-fit pl-4" />
    </div>
  )
}
