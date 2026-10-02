import MeltText from '@kit/blocks/melt-text/MeltText'
import Marquee from '@kit/blocks/marquee/Marquee'
import OrbitGallery from '@kit/blocks/orbit-gallery/OrbitGallery'
import DitherTrail from '@kit/blocks/dither-trail/DitherTrail'
import ScrambleText from '@kit/blocks/scramble-text/ScrambleText'
import RollText from '@kit/blocks/roll-text/RollText'
import { Cell, CellGrid } from '@kit/blocks/cell-grid/CellGrid'
import { blocks, CATEGORY_ORDER } from '@site/data/registry'
import { themes } from '@site/data/themes'
import { pins } from '@site/data/inspo'
import { demoCards } from '@site/data/demo'
import { linkProps, navigate } from '@site/lib/router'
import BlockCard from '@site/components/BlockCard'
import ThemeScope from '@site/components/ThemeScope'
import PinCard from '@site/components/PinCard'
import Command from '@site/components/Command'

export default function Home() {
  const categories = CATEGORY_ORDER.filter(c => blocks.some(b => b.category === c))
  return (
    <>
      <section className="relative">
        <DitherTrail className="absolute inset-0 h-full w-full" />
        <CellGrid cols={4} rows="60fr 40fr" className="relative border-l-0 md:h-[calc(100svh-57px)]">
          <Cell colSpan={2}>
            <p className="caption flex items-center gap-2">
              <span className="size-2 bg-accent" /> Petra’s building blocks
            </p>
            <div>
              <MeltText as="h1" immediate delay={0.2} className="max-w-[13ch] text-headline text-balance">
                Everything I like, ready to build with.
              </MeltText>
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-ink pt-3">
                {[
                  ['Blocks', blocks.length],
                  ['Themes', themes.length],
                  ['Inspo pins', pins.length],
                ].map(([label, n]) => (
                  <div key={label}>
                    <dt className="caption text-muted">{label}</dt>
                    <dd className="text-title tabular-nums">{n}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Cell>
          <Cell colSpan={2} rowSpan={2} tone="ink" className="!p-0">
            <OrbitGallery items={demoCards} onOpen={() => navigate('/blocks/orbit-gallery')} className="h-[70svh] md:h-full" hint="Orbit gallery · drag, hover, click" />
          </Cell>
          <Cell tone="window">
            <span />
            <p className="caption w-fit bg-paper px-1.5 py-0.5">Dither trail · move the mouse here</p>
          </Cell>
          <Cell tone="accent">
            <p className="text-lead">Start the next site from here:</p>
            <div className="grid gap-3">
              <Command>pnpm kit new ../my-site --theme graphite</Command>
              <a {...linkProps('/start')} className="group caption w-fit border-b border-ink pb-0.5">
                <RollText text="How it works →" />
              </a>
            </div>
          </Cell>
        </CellGrid>
      </section>

      <Marquee duration={40} className="border-b border-ink py-3">
        {categories.map(c => (
          <span key={c} className="flex items-center gap-6 pr-6 text-title">
            {c} <span className="size-3 bg-accent" />
          </span>
        ))}
      </Marquee>

      <section className="pt-16">
        <div className="flex items-end justify-between px-4 pb-6 md:px-5">
          <h2 className="text-headline">Blocks</h2>
          <a {...linkProps('/blocks')} className="group caption pb-2">
            <RollText text={`All ${blocks.length} →`} />
          </a>
        </div>
        <div className="grid border-t border-l border-ink sm:grid-cols-2 lg:grid-cols-4">
          {blocks.slice(0, 8).map((b, i) => (
            <BlockCard key={b.slug} block={b} index={i} />
          ))}
        </div>
      </section>

      <section className="pt-20">
        <div className="flex items-end justify-between px-4 pb-6 md:px-5">
          <h2 className="text-headline">Themes</h2>
          <a {...linkProps('/themes')} className="group caption pb-2">
            <RollText text="All themes →" />
          </a>
        </div>
        <div className="grid border-t border-ink md:grid-cols-5">
          {themes.map(t => (
            <a key={t.id} {...linkProps(`/themes/${t.id}`)} className="group block border-b border-ink md:border-r md:last:border-r-0">
              <ThemeScope theme={t} className="flex h-[300px] flex-col justify-between p-4 transition-colors">
                <p className="caption">{t.name}</p>
                <p className="font-display text-[clamp(56px,6vw,96px)] leading-none">Aa</p>
                <div className="flex gap-1">
                  {(['ink', 'accent', 'mist', 'muted'] as const).map(k => (
                    <span key={k} className="size-6 rounded-full border border-ink/20" style={{ background: t.colors[k] }} />
                  ))}
                </div>
              </ThemeScope>
            </a>
          ))}
        </div>
      </section>

      <section className="px-4 pt-20 md:px-5">
        <div className="flex items-end justify-between pb-6">
          <h2 className="text-headline">Inspo</h2>
          <a {...linkProps('/inspo')} className="group caption pb-2">
            <RollText text={`All ${pins.length} pins →`} />
          </a>
        </div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
          {pins.filter(p => p.image && p.kind === 'site').slice(0, 8).map(p => (
            <PinCard key={p.id} pin={p} />
          ))}
        </div>
      </section>

      <section className="px-4 pt-20 md:px-5">
        <h2 className="border-b border-ink pb-6 text-headline">Manifesto</h2>
        <div className="grid max-w-[60ch] gap-6 pt-6 text-lead">
          <p>Most of what’s in here started on someone else’s website. The exception is everything from Iva’s portfolio, which I built myself.</p>
          <p>None of it is here to be copied as it is. These are things I like, kept as inspiration. When one of them goes into a new site, the job is to improve it and reshape it to fit that site’s vibe, vision and context.</p>
          <p>The hope is that one day every animation, block and theme in here gets replaced by our own version of it, made while building new sites.</p>
        </div>
      </section>

      <footer className="mt-24 border-t border-ink px-4 py-10 md:px-5">
        <ScrambleText text="creative-kit" className="text-display" />
        <p className="caption mt-6 text-muted">Built from the iva-v2 redesign · grows with every site</p>
      </footer>
    </>
  )
}
