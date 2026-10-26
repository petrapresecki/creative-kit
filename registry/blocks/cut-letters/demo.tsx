import type { Control, DemoProps } from '@kit/lib/demo'
import CutLetters from './CutLetters'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: 'iVa pResEčKi' },
  { name: 'rough', label: 'Rough (px)', type: 'range', min: 0, max: 14, step: 1, default: 5 },
  { name: 'tilt', label: 'Tilt (deg)', type: 'range', min: 0, max: 12, step: 0.5, default: 5 },
  { name: 'face', label: 'Face', type: 'select', options: ['Pirata One', 'UnifrakturMaguntia', 'Grenze Gotisch'], default: 'Pirata One' },
]

const FONTS = 'https://fonts.googleapis.com/css2?family=Pirata+One&family=UnifrakturMaguntia&family=Grenze+Gotisch:wght@700&family=Manrope:wght@500;800&display=swap'

export default function Demo({ values }: DemoProps) {
  return (
    <div className="grid min-h-[520px] content-center gap-6 bg-paper px-6 py-12 text-center text-ink">
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <div style={{ fontFamily: `'${String(values.face)}', serif` }}>
        <CutLetters
          text={String(values.text)}
          rough={Number(values.rough)}
          tilt={Number(values.tilt)}
          fit
          className="leading-[0.9] text-accent"
        />
      </div>
      <p className="mx-auto text-[clamp(20px,1.9vw,30px)] font-extrabold tracking-[-0.06em]" style={{ fontFamily: 'Manrope, sans-serif' }}>
        branding ✦ packaging ✦ motion ✦ 3D
      </p>
    </div>
  )
}
