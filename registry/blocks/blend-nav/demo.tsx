import { useState } from 'react'
import { demoProjects } from '@site/data/demo'
import LazyVideo from '@kit/blocks/lazy-video/LazyVideo'
import BlendNav from './BlendNav'

export default function Demo() {
  const [page, setPage] = useState('Portfolio')
  return (
    <div data-lenis-prevent className="relative h-[560px] overflow-y-auto">
      <BlendNav
        position="sticky"
        brand="IVA PRESEČKI"
        links={['Portfolio', 'About'].map(label => ({ label, active: page === label, onClick: () => setPage(label) }))}
      />
      <div className="-mt-[72px]">
        <section className="flex h-[360px] items-end px-5 pb-6">
          <p className="caption text-muted">Scroll inside this frame — the nav inverts over every section</p>
        </section>
        <div data-media className="h-[420px] overflow-hidden">
          <LazyVideo src={demoProjects[0].video} className="h-full w-full object-cover" />
        </div>
        <section className="flex h-[300px] items-center bg-ink px-5">
          <p className="text-headline text-paper">Dark section</p>
        </section>
        <section className="flex h-[300px] items-center bg-accent px-5">
          <p className="text-headline">Accent section</p>
        </section>
        <img src={demoProjects[3].image} alt="" className="h-[420px] w-full object-cover" />
        <section className="h-[300px]" />
      </div>
    </div>
  )
}
