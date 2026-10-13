import { useMemo, useState } from 'react'
import MeltText from '@kit/blocks/melt-text/MeltText'
import { pins, projects, sources, SECTIONS, SITE_TYPES, VERDICTS, type Pin, type Source, type Verdict } from '@site/data/inspo'
import Chips from '@site/components/Chips'
import PinCard from '@site/components/PinCard'
import Lightbox from '@site/components/Lightbox'

function SourceList({ title, items }: { title: string; items: Source[] }) {
  return (
    <div>
      <h2 className="caption mb-3 text-muted">{title}</h2>
      <ul className="border-t border-ink/15">
        {items.map(s => (
          <li key={s.url} className="border-b border-ink/15">
            <a href={s.url} target="_blank" rel="noreferrer" className="group flex items-baseline justify-between gap-4 py-2.5">
              <span className="shrink-0 text-body font-medium whitespace-nowrap group-hover:underline">
                {s.name}
                {s.favourite && <span className="caption ml-2 rounded-full bg-accent px-2 py-0.5 text-ink">Favourite</span>}
              </span>
              {s.note && <span className="text-right text-[13px] text-muted">{s.note}</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

const groups: [Verdict, string][] = [
  ['love', 'Love'],
  ['maybe', 'Maybe & open questions'],
  ['nope', 'Nope'],
]

export default function Inspo() {
  const [project, setProject] = useState('all')
  const [siteType, setSiteType] = useState('all')
  const [section, setSection] = useState('all')
  const [verdict, setVerdict] = useState<'all' | Verdict>('all')
  const [q, setQ] = useState('')
  const [zoom, setZoom] = useState<Pin | null>(null)

  const scoped = pins.filter(p => project === 'all' || p.project === project)
  const list = useMemo(() => {
    const query = q.trim().toLowerCase()
    return scoped.filter(
      p =>
        (siteType === 'all' || p.siteType === siteType) &&
        (section === 'all' || p.section === section) &&
        (verdict === 'all' || p.verdict === verdict) &&
        (!query || [p.title, p.note, p.url, p.section, p.siteType].join(' ').toLowerCase().includes(query)),
    )
  }, [scoped, siteType, section, verdict, q])

  const count = (pred: (p: Pin) => boolean) => scoped.filter(pred).length

  return (
    <div className="pt-12">
      <div className="px-4 pb-8 md:px-5">
        <p className="caption text-muted">{pins.length} pins</p>
        <MeltText as="h1" immediate className="mt-3 text-display">
          Inspo
        </MeltText>
        <p className="mt-6 max-w-[56ch] text-lead text-ink/80">
          Sites, screenshots, ideas and decisions. Reusable inspiration lives in the general library; each site I build gets its own project with what I loved and what I said no to.
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-10">
          <SourceList title="Where to find sites" items={sources.galleries} />
          <SourceList title="Where to find fonts" items={sources.fonts} />
        </div>
      </div>

      <div className="sticky top-[57px] z-30 grid gap-3 border-y border-ink bg-paper/95 px-4 py-3 backdrop-blur md:px-5">
        <Chips
          label="Project"
          value={project}
          onChange={v => {
            setProject(v)
            setSection('all')
          }}
          options={[{ value: 'all', label: 'Everything', count: pins.length }, ...projects.map(p => ({ value: p.id, label: p.name, count: pins.filter(x => x.project === p.id).length }))]}
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Chips label="Site type" value={siteType} onChange={setSiteType} options={[{ value: 'all', label: 'Any site type' }, ...SITE_TYPES.map(t => ({ value: t, label: t, count: count(p => p.siteType === t) }))]} />
          <Chips label="Verdict" value={verdict} onChange={setVerdict} options={[{ value: 'all' as const, label: 'Any verdict' }, ...(Object.keys(VERDICTS) as Verdict[]).map(v => ({ value: v, label: VERDICTS[v] }))]} />
          <input value={q} onChange={e => setQ(e.target.value)} type="search" placeholder="Search pins" aria-label="Search pins" className="min-w-[160px] flex-1 rounded-full border border-ink/15 px-3 py-1 text-[13px] focus:border-ink focus:outline-none" />
        </div>
        <Chips label="Part of the site" value={section} onChange={setSection} options={[{ value: 'all', label: 'All parts' }, ...SECTIONS.map(s => ({ value: s, label: s, count: count(p => p.section === s) })).filter(o => o.count)]} />
      </div>

      <div className="px-4 md:px-5">
        {groups.map(([v, label]) => {
          const items = list.filter(p => p.verdict === v)
          if (!items.length) return null
          return (
            <section key={v} className="pt-10">
              <h2 className="mb-5 flex items-baseline justify-between text-title">
                {label}
                <span className="caption text-muted">{items.length}</span>
              </h2>
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                {items.map(p => (
                  <PinCard key={p.id} pin={p} onImage={setZoom} showProject={project === 'all'} />
                ))}
              </div>
            </section>
          )
        })}
        {!list.length && <p className="py-16 text-title">No pins match these filters.</p>}
        <p className="caption mt-16 max-w-[70ch] border-t border-ink pt-4 text-muted">
          To add a pin: drop a JSON file (and its screenshot in images/) into content/inspo, or ask Claude to research a site and pin it.
        </p>
      </div>

      {zoom?.image && <Lightbox src={zoom.image} caption={zoom.title} onClose={() => setZoom(null)} />}
    </div>
  )
}
