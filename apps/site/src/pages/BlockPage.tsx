import { useEffect, useMemo, useState, type ComponentType } from 'react'
import type { Control, DemoProps, DemoValues } from '@kit/lib/demo'
import MeltText from '@kit/blocks/melt-text/MeltText'
import RollText from '@kit/blocks/roll-text/RollText'
import { blocks, getBlock, libFile } from '@site/data/registry'
import { themes } from '@site/data/themes'
import { getPin } from '@site/data/inspo'
import { linkProps } from '@site/lib/router'
import ThemeScope from '@site/components/ThemeScope'
import Controls from '@site/components/Controls'
import CodeView from '@site/components/CodeView'
import Command from '@site/components/Command'
import Chips from '@site/components/Chips'
import PinCard from '@site/components/PinCard'
import Lightbox from '@site/components/Lightbox'
import type { Pin } from '@site/data/inspo'

const defaults = (controls: Control[]): DemoValues => Object.fromEntries(controls.map(c => [c.name, c.default]))

export default function BlockPage({ slug }: { slug: string }) {
  const block = getBlock(slug)
  const [demo, setDemo] = useState<{ Demo: ComponentType<DemoProps>; controls: Control[] } | null>(null)
  const [values, setValues] = useState<DemoValues>({})
  const [themeId, setThemeId] = useState('iva')
  const [zoom, setZoom] = useState<Pin | null>(null)

  useEffect(() => {
    let live = true
    block?.loadDemo().then(m => {
      if (!live) return
      const controls = m.controls ?? []
      setDemo({ Demo: m.default, controls })
      setValues(defaults(controls))
    })
    return () => {
      live = false
    }
  }, [block])

  const files = useMemo(() => {
    if (!block) return {}
    const out = { ...block.sources }
    for (const name of block.lib) {
      const loader = libFile(name)
      if (loader) out[`lib/${name}.ts`] = loader
    }
    return out
  }, [block])

  if (!block) return <p className="p-10 text-title">No block called “{slug}”.</p>

  const i = blocks.indexOf(block)
  const prev = blocks[(i - 1 + blocks.length) % blocks.length]
  const next = blocks[(i + 1) % blocks.length]
  const theme = themes.find(t => t.id === themeId)
  const inspired = block.inspiredBy.map(getPin).filter(Boolean) as Pin[]
  const Demo = demo?.Demo

  return (
    <article className="pt-10">
      <header className="grid gap-6 px-4 md:grid-cols-12 md:px-5">
        <div className="md:col-span-8">
          <p className="caption text-muted">
            <a {...linkProps('/blocks')} className="hover:text-ink">Blocks</a> / {block.category}
          </p>
          <MeltText key={block.slug} as="h1" immediate className="mt-3 text-headline">
            {block.title}
          </MeltText>
          <p className="mt-5 max-w-[50ch] text-lead text-ink/80">{block.description}</p>
        </div>
        <div className="grid content-end gap-2 md:col-span-4">
          <p className="caption text-muted">Add it to a project</p>
          <Command>{`pnpm kit add ${block.slug} --to ../my-site`}</Command>
        </div>
      </header>

      <section className="mt-10 border-y border-ink">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink px-4 py-3 md:px-5">
          <p className="caption">Live demo</p>
          <Chips label="Preview theme" value={themeId} onChange={setThemeId} options={themes.map(t => ({ value: t.id, label: t.name }))} />
        </div>
        <div className="grid md:grid-cols-[1fr_300px]">
          <ThemeScope key={themeId} theme={theme} className="relative min-h-[320px] overflow-hidden md:border-r md:border-ink">
            <div data-demo className="contents" />
            {Demo ? <Demo values={values} /> : <p className="caption p-6 text-muted">Loading the demo…</p>}
          </ThemeScope>
          <aside className="border-t border-ink p-5 md:border-t-0">
            <p className="caption mb-5">Settings</p>
            {demo && (
              <Controls
                controls={demo.controls}
                values={values}
                onChange={(name, v) => setValues(s => ({ ...s, [name]: v }))}
                onReset={() => setValues(defaults(demo.controls))}
              />
            )}
          </aside>
        </div>
      </section>

      <section className="grid gap-10 px-4 pt-14 md:grid-cols-12 md:px-5">
        <div className="md:col-span-4">
          <h2 className="caption mb-4 flex items-center gap-2">
            <span className="size-2 bg-accent" /> What it needs
          </h2>
          <dl className="grid gap-4 text-[15px]">
            <div>
              <dt className="caption text-muted">npm packages</dt>
              <dd className="mt-1 font-mono text-[13px]">{block.dependencies.length ? block.dependencies.join(', ') : 'none'}</dd>
            </div>
            <div>
              <dt className="caption text-muted">Other blocks (added automatically)</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {block.registryDependencies.length
                  ? block.registryDependencies.map(d => (
                      <a key={d} {...linkProps(`/blocks/${d}`)} className="group rounded-full border border-ink px-2 py-0.5 text-[13px] hover:bg-accent">
                        <RollText text={getBlock(d)?.title ?? d} />
                      </a>
                    ))
                  : 'none'}
              </dd>
            </div>
            <div>
              <dt className="caption text-muted">Kit helpers</dt>
              <dd className="mt-1 font-mono text-[13px]">{block.lib.length ? block.lib.map(l => `lib/${l}`).join(', ') : 'none'}</dd>
            </div>
            {block.usedIn.length > 0 && (
              <div>
                <dt className="caption text-muted">Used in</dt>
                <dd className="mt-1">{block.usedIn.map(u => (u === 'iva' ? 'Iva Presečki portfolio' : u)).join(', ')}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="min-w-0 md:col-span-8">
          <h2 className="caption mb-4 flex items-center gap-2">
            <span className="size-2 bg-accent" /> Code
          </h2>
          <CodeView key={block.slug} files={files} />
        </div>
      </section>

      {inspired.length > 0 && (
        <section className="px-4 pt-16 md:px-5">
          <h2 className="caption mb-4 flex items-center gap-2">
            <span className="size-2 bg-accent" /> Inspired by
          </h2>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {inspired.map(p => (
              <PinCard key={p.id} pin={p} onImage={setZoom} showProject />
            ))}
          </div>
        </section>
      )}

      <nav className="mt-16 grid grid-cols-2 border-t border-ink">
        {[
          { b: prev, label: 'Previous', cls: 'pr-4 pl-4 md:pl-5' },
          { b: next, label: 'Next', cls: 'border-l border-ink pl-4 pr-4 text-right md:pr-5' },
        ].map(({ b, label, cls }) => (
          <a key={label} {...linkProps(`/blocks/${b.slug}`)} className={`group py-8 ${cls}`}>
            <span className="caption block text-muted">{label}</span>
            <span className="mt-2 block text-title">
              <RollText text={b.title} />
            </span>
          </a>
        ))}
      </nav>

      {zoom?.image && <Lightbox src={zoom.image} caption={zoom.title} onClose={() => setZoom(null)} />}
    </article>
  )
}
