import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects, demoText } from '@site/data/demo'
import TiledWallpaper from '@kit/blocks/tiled-wallpaper/TiledWallpaper'
import StarGlass from './StarGlass'

export const controls: Control[] = [
  { name: 'blur', label: 'Blur (px)', type: 'range', min: 0, max: 30, step: 1, default: 16 },
  { name: 'stars', label: 'Corner stars', type: 'toggle', default: true },
]

export default function Demo({ values }: DemoProps) {
  const p = demoProjects[1]
  return (
    <TiledWallpaper image={demoProjects[0].image} tile={180} wash={0.35} className="px-6 py-14 md:px-16">
      <StarGlass blur={Number(values.blur)} stars={Boolean(values.stars)} className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <img src={p.image} alt="" className="aspect-[4/3] w-full rounded-kit object-cover" />
        <div className="flex flex-col justify-end gap-3">
          <p className="m-0">I taught myself to make</p>
          <h2 className="m-0 font-mono text-headline font-normal">
            {p.title} <i>by</i> Iva
          </h2>
          <p className="m-0 text-muted">{demoText.statement}</p>
          <span className="-rotate-3 self-end font-mono text-[14px] italic text-muted">
            photo: {p.category.toLowerCase()}, {p.year}
          </span>
        </div>
      </StarGlass>
    </TiledWallpaper>
  )
}
