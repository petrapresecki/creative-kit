import type { Control, DemoProps } from '@kit/lib/demo'
import RuledText, { type RuledFace } from './RuledText'

export const controls: Control[] = [
  { name: 'face', label: 'Set apart in', type: 'select', options: ['script', 'blur', 'tall', 'cut', 'pixel'], default: 'script' },
  { name: 'ruled', label: 'Ruled lines', type: 'toggle', default: true },
  {
    name: 'text',
    label: 'Text',
    type: 'text',
    default: 'Hi! I’m Iva Presečki, a graphic designer working across branding, packaging, motion and 3D. Most of it starts as a sketch and ends as a system.',
  },
]

const FONTS =
  'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@200;400&family=Pinyon+Script&family=Pirata+One&family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap'

// the words the demo sets apart, wherever they turn up in the text
const APART = ['Hi! I’m Iva Presečki,', 'branding', 'packaging', 'motion and 3D', 'a sketch', 'a system']

export default function Demo({ values }: DemoProps) {
  const face = String(values.face) as RuledFace
  return (
    <div className="grid min-h-[560px] content-center gap-8 bg-paper px-6 py-12 text-ink" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <p className="flex justify-between border-b border-accent pb-1 text-[14px] text-accent">
        <span>Iva Presečki</span>
        <span>Works, About, Contact</span>
      </p>
      <RuledText
        as="h1"
        text={String(values.text)}
        apart={APART}
        face={face}
        ruled={Boolean(values.ruled)}
        className="text-[clamp(30px,3.5vw,50px)] font-extralight tracking-[-0.01em]"
      />
      <p className="text-[14px]">
        <span className="text-accent">Selected clients✦:</span> Rool, Apuro, Gabagool, Keyring
      </p>
    </div>
  )
}
