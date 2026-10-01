import { useRef } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects, demoText } from '@site/data/demo'
import ParallaxWindow from '@kit/blocks/parallax-window/ParallaxWindow'
import LetterMask from './LetterMask'

export const controls: Control[] = [
  { name: 'text', label: 'Text', type: 'text', default: demoText.approach },
  { name: 'blend', label: 'Invert over images', type: 'toggle', default: true },
]

export default function Demo({ values }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null)
  return (
    <div ref={scroller} data-lenis-prevent className="relative h-[560px] overflow-y-auto bg-[#0c0c0c] text-white">
      <p className="caption sticky top-0 z-20 p-4 text-white/60">Scroll inside this frame</p>
      <div className="relative px-6 pt-[40vh] pb-[60vh] md:px-12">
        <ParallaxWindow scroller={scroller} type="video" src={demoProjects[3].video} className="absolute top-[34vh] right-6 aspect-[4/5] w-[38%]" />
        <ParallaxWindow scroller={scroller} src={demoProjects[1].image} className="absolute top-[70vh] left-6 aspect-[4/5] w-[32%]" />
        <LetterMask
          key={String(values.text) + values.blend}
          scroller={scroller}
          text={String(values.text)}
          blend={Boolean(values.blend)}
          className="max-w-[20ch] text-headline md:ml-[10%]"
        />
      </div>
    </div>
  )
}
