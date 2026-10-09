import { useState } from 'react'
import MeltText from '@kit/blocks/melt-text/MeltText'
import { guide, stepsFor, type Principle } from '@site/data/guide'
import { getPin, type Pin } from '@site/data/inspo'
import { hashLinkProps, linkProps, useHashOnArrive } from '@site/lib/router'
import Command from '@site/components/Command'
import Lightbox from '@site/components/Lightbox'

function Example({ pin, look, onImage }: { pin: Pin; look: string; onImage: (pin: Pin) => void }) {
  return (
    <figure className="grid min-w-0 grid-cols-1 content-start gap-2">
      {pin.image ? (
        <button onClick={() => onImage(pin)} className="block cursor-zoom-in overflow-hidden rounded-kit bg-mist" aria-label={`Enlarge ${pin.title}`}>
          <img src={pin.image} alt={pin.title} loading="lazy" className="block aspect-[16/10] w-full object-cover object-top" />
        </button>
      ) : (
        <div className="grid aspect-[16/10] content-end rounded-kit bg-mist p-3">
          <p className="text-[15px] leading-snug font-medium text-balance">{pin.title}</p>
        </div>
      )}
      <figcaption className="grid grid-cols-1 gap-1">
        <p className="caption flex items-center gap-2 text-muted">
          {pin.verdict === 'nope' && <span className="rounded-full bg-ink px-1.5 text-paper">nope</span>}
          <span className="truncate">{pin.title}</span>
        </p>
        <p className="text-[14px] leading-snug">{look}</p>
      </figcaption>
    </figure>
  )
}

function PrincipleView({ p, onImage }: { p: Principle; onImage: (pin: Pin) => void }) {
  const examples = p.pins.map(e => ({ pin: getPin(e.id), look: e.look })).filter((e): e is { pin: Pin; look: string } => Boolean(e.pin))
  const steps = stepsFor(p.id)
  return (
    <article id={p.id} className="grid scroll-mt-20 gap-x-6 gap-y-10 border-t border-ink/15 py-12 md:grid-cols-12">
      <div className="grid min-w-0 content-start gap-6 md:col-span-5">
        <div>
          <h3 className="text-title">{p.name}</h3>
          <p className="mt-3 text-[19px] leading-snug font-medium text-balance">{p.short}</p>
        </div>
        <p className="text-[15px] text-ink/80">{p.explain}</p>
        <div>
          <p className="caption mb-1.5 text-muted">How to check</p>
          <p className="text-[15px]">{p.check}</p>
        </div>
        <div>
          <p className="caption mb-1.5 text-muted">Usual mistakes</p>
          <ul className="grid gap-1.5 text-[15px]">
            {p.mistakes.map(m => (
              <li key={m} className="flex gap-2">
                <span className="text-muted">×</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3 rounded-kit bg-mist p-4">
          <p className="caption">Practise</p>
          <p className="text-[15px]">{p.practice}</p>
          <Command>{`pnpm kit study ${p.id}`}</Command>
        </div>
        {steps.length > 0 && (
          <p className="flex flex-wrap items-center gap-1 text-[13px]">
            <span className="caption mr-1 text-muted">In the process</span>
            {steps.map(s => (
              <a key={s.id} {...linkProps(`/process#${s.id}`)} className="rounded-full border border-ink/20 px-2.5 py-0.5 hover:border-ink hover:bg-accent">
                {s.title}
              </a>
            ))}
          </p>
        )}
      </div>
      <div className="grid min-w-0 content-start gap-x-4 gap-y-8 sm:grid-cols-[repeat(2,minmax(0,1fr))] md:col-span-7">
        {examples.map(e => (
          <Example key={e.pin.id} pin={e.pin} look={e.look} onImage={onImage} />
        ))}
      </div>
    </article>
  )
}

export default function FieldGuide() {
  useHashOnArrive()
  const [zoom, setZoom] = useState<Pin | null>(null)
  return (
    <div className="pt-12">
      <div className="px-4 pb-10 md:px-5">
        <p className="caption text-muted">{guide.principles.length} principles</p>
        <MeltText as="h1" immediate className="mt-3 text-display">
          Field guide
        </MeltText>
        <p className="mt-6 max-w-[60ch] text-lead text-ink/80">{guide.intro}</p>
      </div>

      <nav aria-label="Principles" className="grid border-t border-l border-ink sm:grid-cols-3 lg:grid-cols-5">
        {guide.groups.map(g => (
          <div key={g.id} className="border-r border-b border-ink p-4">
            <a {...hashLinkProps(g.id)} className="caption text-muted hover:text-ink">
              {g.name}
            </a>
            <ul className="mt-2 grid">
              {guide.principles
                .filter(p => p.group === g.id)
                .map(p => (
                  <li key={p.id}>
                    <a {...hashLinkProps(p.id)} className="inline-block py-1 text-[15px] font-medium hover:underline">
                      {p.name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>

      {guide.groups.map(g => (
        <section key={g.id} id={g.id} className="scroll-mt-20 px-4 pt-16 md:px-5">
          <h2 className="pb-6 text-headline">{g.name}</h2>
          {guide.principles
            .filter(p => p.group === g.id)
            .map(p => (
              <PrincipleView key={p.id} p={p} onImage={setZoom} />
            ))}
        </section>
      ))}

      <div className="h-24" />
      {zoom?.image && <Lightbox src={zoom.image} caption={zoom.title} onClose={() => setZoom(null)} />}
    </div>
  )
}
