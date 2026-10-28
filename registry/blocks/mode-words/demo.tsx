import type { CSSProperties } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects, demoText } from '@site/data/demo'
import cyanotype from '@themes/cyanotype.json'
import DriftCards from '@kit/blocks/drift-cards/DriftCards'
import { LineArt, ModeSwap, ModeWord, ModeWords } from './ModeWords'

export const controls: Control[] = [
  { name: 'start', label: 'Start locked in', type: 'select', options: ['none', 'typography', 'color', 'textures'], default: 'none' },
  { name: 'detail', label: 'Line art detail', type: 'range', min: 0, max: 1, step: 0.05, default: 0.5 },
]

const fills = cyanotype.palette.map(p => p.value)
const shapes = ['rounded-none', 'rounded-[18%/12%]', 'rounded-[14px]', 'rounded-[24%]']

// Typography mode: everything turns script and sentence case, set bigger to fill the same box
const script = 'group-data-[mode=typography]/modes:font-display group-data-[mode=typography]/modes:normal-case'
const colorBand = 'group-data-[mode=color]/modes:bg-mist'

export default function Demo({ values }: DemoProps) {
  const start = String(values.start)
  const detail = Number(values.detail)

  const items = demoProjects.map((p, i) => ({
    id: p.id,
    title: p.title,
    kind: p.category.split(',')[0],
    note: `${p.category} · ${p.year}`,
    style: { '--label': fills[5 + (i % 5)] } as CSSProperties,
    media: (
      <ModeSwap
        className="h-full"
        base={<img src={p.image} alt="" className="h-full w-full object-cover" />}
        modes={{
          color: <div className="h-full" style={{ background: fills[i % 5] }} />,
          textures: <LineArt src={p.image} detail={detail} />,
        }}
      />
    ),
    object: (
      <ModeSwap
        base={<img src={p.cards[1]} alt="" className="block aspect-[4/5] w-full bg-paper object-cover p-[4%] shadow-[0_22px_40px_-14px_rgb(0_0_0/0.55)]" />}
        modes={{
          color: <div className={`h-full border-2 border-ink ${shapes[i % shapes.length]}`} style={{ background: fills[(i + 2) % 5] }} />,
          textures: <LineArt src={p.cards[1]} detail={detail} className="border-2 border-ink" />,
        }}
      />
    ),
  }))

  return (
    <ModeWords key={start} defaultMode={start === 'none' ? null : start} className="flex flex-col bg-paper text-ink lg:h-[860px]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b-2 border-ink px-4 group-data-[mode=color]/modes:bg-accent md:px-6">
        <span className="font-display text-[30px] leading-none">Iva Presečki</span>
        <a href="#about" className={`text-[20px] tracking-[0.05em] uppercase group-data-[mode=typography]/modes:text-[28px] group-data-[mode=typography]/modes:tracking-normal ${script}`}>
          About
        </a>
      </header>

      <div className={`shrink-0 border-b-2 border-ink px-4 py-5 md:px-6 lg:flex lg:h-[176px] lg:items-center ${colorBand}`}>
        <p
          className={`text-headline uppercase group-data-[mode=typography]/modes:text-[clamp(30px,3.6vw,74px)] group-data-[mode=typography]/modes:leading-[0.92] ${script}`}
        >
          {demoText.statement} Playing with <ModeWord mode="typography">typography</ModeWord>, <ModeWord mode="color">color</ModeWord>, and all kinds
          of <ModeWord mode="textures">textures</ModeWord> is my thing.
        </p>
      </div>

      <DriftCards
        items={items}
        className="min-h-0 flex-1"
        labelClassName="group-data-[mode=color]/modes:bg-(--label)"
        titleClassName={`${script} group-data-[mode=typography]/modes:text-[clamp(24px,2.1vw,38px)] group-data-[mode=typography]/modes:leading-none`}
        textClassName={`${script} group-data-[mode=typography]/modes:not-italic group-data-[mode=typography]/modes:text-[1.35em]`}
      />
    </ModeWords>
  )
}
