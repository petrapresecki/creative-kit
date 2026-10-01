import { useEffect, useState } from 'react'
import MeltText from '@kit/blocks/melt-text/MeltText'
import { AxisGrid, AxisLine } from '@kit/blocks/axis-grid/AxisGrid'
import { Cell, CellGrid } from '@kit/blocks/cell-grid/CellGrid'
import RollText from '@kit/blocks/roll-text/RollText'
import { linkProps } from '@site/lib/router'

const systems = [
  { name: '8-column axis', spec: '8 columns · 16px gutter · 16–20px margin · one vertical rule', use: 'Big typographic statements, lines hanging off different columns.', block: 'axis-grid' },
  { name: 'Edge-to-edge cells', spec: '4 columns · no gutter · 1px rules · content bottom-left', use: 'Heroes and indexes where the grid itself is the look.', block: 'cell-grid' },
  { name: '12-column collage', spec: '12 columns · 24px gutter · asymmetric spans and drops', use: 'Donut-style work collages: 6 + 5, 7 centred, 6 + 6 with offsets.', block: null },
]

/** Toggleable 12-column overlay for the whole page (press G). */
function Overlay({ on }: { on: boolean }) {
  if (!on) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] grid grid-cols-4 gap-x-4 px-4 md:grid-cols-12 md:gap-x-6 md:px-5">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={`bg-accent/20 ${i >= 4 ? 'hidden md:block' : ''}`} />
      ))}
    </div>
  )
}

export default function Grids() {
  const [overlay, setOverlay] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g' && !(e.target as HTMLElement).closest('input, textarea')) setOverlay(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="pt-12">
      <Overlay on={overlay} />
      <div className="px-4 pb-10 md:px-5">
        <p className="caption text-muted">Layout systems</p>
        <MeltText as="h1" immediate className="mt-3 text-display">
          Grids
        </MeltText>
        <p className="mt-6 max-w-[54ch] text-lead text-ink/80">The grids I keep coming back to, with their numbers. Press G to lay a 12-column overlay over this page.</p>
        <button onClick={() => setOverlay(v => !v)} className="group caption mt-6 rounded-full border border-ink px-3 py-1.5 hover:bg-accent">
          <RollText text={overlay ? 'Hide overlay (G)' : 'Show overlay (G)'} />
        </button>
      </div>

      <div className="grid border-t border-l border-ink md:grid-cols-3">
        {systems.map(s => (
          <div key={s.name} className="grid content-between gap-6 border-r border-b border-ink p-5">
            <div>
              <h2 className="text-title">{s.name}</h2>
              <p className="caption mt-3 text-muted">{s.spec}</p>
            </div>
            <p className="text-[15px]">{s.use}</p>
            {s.block && (
              <a {...linkProps(`/blocks/${s.block}`)} className="group caption w-fit border-b border-ink pb-0.5">
                <RollText text="Open the block →" />
              </a>
            )}
          </div>
        ))}
      </div>

      <section className="px-4 py-20 md:px-5">
        <p className="caption mb-8">8-column axis</p>
        <AxisGrid axis={3} guides>
          {(
            [
              [2, 'the best'],
              [4, 'ideas deserve'],
              [3, 'a grid that'],
              [5, 'holds them.'],
            ] as [number, string][]
          ).map(([start, text]) => (
            <AxisLine key={text} start={start} className="text-headline">
              <MeltText as="span">{text}</MeltText>
            </AxisLine>
          ))}
        </AxisGrid>
      </section>

      <section className="border-t border-ink">
        <p className="caption px-4 py-4 md:px-5">Edge-to-edge cells</p>
        <CellGrid cols={4} rows="1fr 1fr" className="border-l-0 md:h-[480px]">
          <Cell colSpan={2}>
            <p className="caption">span 2</p>
            <p className="text-title">Content sits bottom-left</p>
          </Cell>
          <Cell rowSpan={2} tone="ink">
            <p className="caption text-paper/70">row-span 2</p>
          </Cell>
          <Cell tone="accent">
            <p className="caption">accent</p>
          </Cell>
          <Cell tone="mist">
            <p className="caption">mist</p>
          </Cell>
          <Cell colSpan={2}>
            <p className="caption">span 2</p>
          </Cell>
        </CellGrid>
      </section>

      <section className="px-4 py-20 md:px-5">
        <p className="caption mb-8">12-column collage</p>
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          {[
            'col-span-12 md:col-span-6 md:mt-[100px]',
            'col-span-12 md:col-start-8 md:col-span-5',
            'col-span-12 md:col-start-3 md:col-span-7',
            'col-span-12 md:col-start-7 md:col-span-6 md:mt-10',
          ].map((cls, i) => (
            <div key={cls} className={cls}>
              <div className="grid aspect-video place-items-center rounded-kit bg-mist font-mono text-[12px] text-muted">{cls.replace(/col-span-12 /, '')}</div>
              <p className="mt-2 flex justify-between text-[17px] font-medium">
                <span>Project</span>
                <span>({String(i + 1).padStart(2, '0')})</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
