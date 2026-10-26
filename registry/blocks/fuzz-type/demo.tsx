import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import FuzzType from './FuzzType'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: 'IVA PRESEČKI' },
  { name: 'fuzz', label: 'Fuzz (px)', type: 'range', min: 0, max: 40, step: 1, default: 16 },
  { name: 'grain', label: 'Grain', type: 'range', min: 0.1, max: 2, step: 0.05, default: 0.55 },
  { name: 'glow', label: 'Glow', type: 'range', min: 0, max: 1, step: 0.05, default: 0.75 },
  { name: 'boil', label: 'Simmer', type: 'toggle', default: true },
  { name: 'colour', label: 'Colour', type: 'select', options: ['pink', 'paper', 'accent', 'ink'], default: 'pink' },
]

const colours: Record<string, string> = { pink: 'text-[#f7c8f1]', paper: 'text-paper', accent: 'text-accent', ink: 'text-ink' }

export default function Demo({ values }: DemoProps) {
  return (
    <div className="relative grid min-h-[560px] overflow-hidden bg-ink">
      <video src={demoProjects[0].video} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
      <nav className="caption relative mx-auto mt-3 flex h-fit gap-4 bg-paper px-2 text-ink uppercase">
        <span>Personal</span>
        <span>Commissioned</span>
        <span>Info</span>
      </nav>
      <div className="relative self-end px-4 pb-2">
        <FuzzType
          fit
          fuzz={Number(values.fuzz)}
          grain={Number(values.grain)}
          glow={Number(values.glow)}
          boil={Boolean(values.boil)}
          className={`font-display leading-[0.85] tracking-tight uppercase ${colours[String(values.colour)]}`}
        >
          {String(values.text)}
        </FuzzType>
      </div>
    </div>
  )
}
