import { useState } from 'react'
import { demoProjects } from '@site/data/demo'
import RollText from '@kit/blocks/roll-text/RollText'
import LazyVideo from '@kit/blocks/lazy-video/LazyVideo'
import SlideDrawer from './SlideDrawer'

export default function Demo() {
  const [open, setOpen] = useState<number | null>(null)
  const project = open === null ? null : demoProjects[open]
  return (
    <div className="flex min-h-[340px] flex-wrap items-center justify-center gap-3 p-10">
      {demoProjects.map((p, i) => (
        <button key={p.id} onClick={() => setOpen(i)} className="group rounded-full border border-ink px-5 py-2 text-[15px] font-medium hover:bg-accent">
          <RollText text={`Open ${p.title}`} />
        </button>
      ))}
      <SlideDrawer open={project !== null} onClose={() => setOpen(null)}>
        {project && (
          <article className="px-6 pt-24 pb-16 md:px-16">
            <p className="caption border-b border-ink pb-3">{project.category} · {project.year}</p>
            <h1 className="mt-5 text-display">{project.title}</h1>
            <div data-media className="mt-8 aspect-video overflow-hidden rounded-kit">
              <LazyVideo src={project.video} className="h-full w-full object-cover" />
            </div>
            <p className="caption mt-6 text-muted">Press Escape or the arrow to close</p>
          </article>
        )}
      </SlideDrawer>
    </div>
  )
}
