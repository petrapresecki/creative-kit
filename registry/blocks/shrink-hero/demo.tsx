import { useRef } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects, demoText } from '@site/data/demo'
import MosaicVideo from '@kit/blocks/mosaic-video/MosaicVideo'
import TintedLetters from '@kit/blocks/tinted-letters/TintedLetters'
import ShrinkHero from './ShrinkHero'

export const controls: Control[] = [{ name: 'band', label: 'Band left', type: 'range', min: 0.15, max: 0.6, step: 0.05, default: 0.35 }]

export default function Demo({ values }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div ref={scroller} data-lenis-prevent className="h-[560px] overflow-y-auto">
      <ShrinkHero
        key={String(values.band)}
        scroller={scroller}
        band={Number(values.band)}
        className="h-[560px]"
        media={<MosaicVideo src={demoProjects[2].video} poster={demoProjects[2].image} className="size-full" />}
        title={
          <TintedLetters
            text={'Small studio\nDigital-first design'}
            blend
            colors={['#2bc4d6', '#f39a3c']}
            className="px-6 pb-6 font-display text-headline leading-[1.05] text-white md:px-10"
          />
        }
      />
      <div className="grid gap-6 px-6 py-16 md:grid-cols-2 md:px-10">
        <p className="caption">Scroll inside this frame</p>
        <p className="text-lead">{demoText.approach}</p>
      </div>
      <div className="h-[600px]" />
    </div>
  )
}
