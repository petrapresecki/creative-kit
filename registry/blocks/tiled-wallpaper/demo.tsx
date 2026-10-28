import type { Control, DemoProps } from '@kit/lib/demo'
import { demoProjects } from '@site/data/demo'
import TiledWallpaper from './TiledWallpaper'

export const controls: Control[] = [
  { name: 'project', label: 'Image', type: 'select', options: demoProjects.map(p => p.title), default: demoProjects[3].title },
  { name: 'tile', label: 'Tile (px)', type: 'range', min: 60, max: 480, step: 10, default: 220 },
  { name: 'wash', label: 'Wash', type: 'range', min: 0, max: 1, step: 0.05, default: 0.66 },
]

export default function Demo({ values }: DemoProps) {
  const p = demoProjects.find(d => d.title === values.project) ?? demoProjects[0]
  return (
    <TiledWallpaper image={p.image} tile={Number(values.tile)} wash={Number(values.wash)} className="flex min-h-[460px] items-center px-6 md:px-16">
      <div className="max-w-[34ch]">
        <p className="m-0 font-display text-title">welcome to my fan site</p>
        <p className="m-0 mt-2 font-mono text-headline">
          dedicated to <u>{p.title}</u>, {p.category.toLowerCase()}, {p.year}.
        </p>
      </div>
    </TiledWallpaper>
  )
}
