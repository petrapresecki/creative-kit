import type { Control, DemoProps } from '@kit/lib/demo'
import PixelType from './PixelType'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: 'Die Leere zwischen den Zeilen' },
  { name: 'tall', label: 'Pixel height', type: 'range', min: 1, max: 3, step: 0.1, default: 1.5 },
  { name: 'gap', label: 'Gap', type: 'range', min: 0, max: 0.6, step: 0.02, default: 0.28 },
]

export default function Demo({ values }: DemoProps) {
  const tall = Number(values.tall)
  const gap = Number(values.gap)
  return (
    <div className="grid min-h-[520px] content-center gap-10 bg-paper px-6 py-12 text-ink">
      <PixelType text={String(values.text)} tall={tall} gap={gap} fill />
      <p className="text-headline max-w-[22ch] font-light">
        Inline it sits on the line at the text&rsquo;s own size: <PixelType text="Frontend engineer" tall={tall} gap={gap} />, from
        Zagreb.
      </p>
      <p className="text-title text-muted">
        <PixelType text="Č Ć Š Ž Đ 0123456789 ?!&+-/" tall={tall} gap={gap} />
      </p>
    </div>
  )
}
