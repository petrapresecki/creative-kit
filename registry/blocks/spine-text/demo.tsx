import type { Control, DemoProps } from '@kit/lib/demo'
import { demoAbout, demoProjects, demoText } from '@site/data/demo'
import LazyVideo from '@kit/blocks/lazy-video/LazyVideo'
import SpineText, { type SpineBlock } from './SpineText'

export const controls: Control[] = [
  { name: 'size', label: 'Object size', type: 'range', min: 100, max: 320, step: 20, default: 180 },
  { name: 'clearance', label: 'Clearance', type: 'range', min: 0, max: 80, step: 4, default: 20 },
  { name: 'follow', label: 'Follow', type: 'range', min: 0.05, max: 1, step: 0.05, default: 0.18 },
]

const [branding, editorial, motion] = demoAbout.services
const blocks: SpineBlock[] = [
  { side: 'left', heading: branding.title, items: branding.items },
  { side: 'right', heading: editorial.title, items: editorial.items },
  { side: 'left', heading: motion.title, items: motion.items },
  { chapter: 'I', left: 'Ch. One', right: 'Approach' },
  { side: 'left', text: demoText.statement },
  { side: 'right', text: demoText.approach },
  { chapter: 'II', left: 'Ch. Two', right: 'Contact' },
  { side: 'right', items: demoAbout.contact },
]

export default function Demo({ values }: DemoProps) {
  const size = Number(values.size)
  return (
    <div data-lenis-prevent className="h-[600px] overflow-y-auto bg-paper">
      <p className="caption p-4 text-muted">Scroll inside this frame</p>
      <div className="px-4 pt-[240px] pb-[320px] text-center">
        <p className="mx-auto max-w-[14em] font-display text-headline">{demoText.statement}</p>
      </div>
      <SpineText blocks={blocks} clearance={Number(values.clearance)} follow={Number(values.follow)} className="px-4 pb-[300px]">
        <div style={{ width: size, height: size }} className="overflow-hidden rounded-full" data-media>
          <LazyVideo src={demoProjects[0].video} className="h-full w-full object-cover" />
        </div>
      </SpineText>
    </div>
  )
}
