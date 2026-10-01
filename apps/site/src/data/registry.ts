import type { ComponentType } from 'react'
import type { Control, DemoProps } from '@kit/lib/demo'
import { getPin } from './inspo'
import { demoCards } from './demo'

export interface BlockMeta {
  title: string
  description: string
  category: string
  files: string[]
  lib: string[]
  dependencies: string[]
  devDependencies?: string[]
  registryDependencies: string[]
  inspiredBy: string[]
  usedIn: string[]
  webgl?: boolean
}

export interface Block extends BlockMeta {
  slug: string
  loadDemo: () => Promise<{ default: ComponentType<DemoProps>; controls?: Control[] }>
  sources: Record<string, () => Promise<string>>
}

const metas = import.meta.glob<BlockMeta>('../../../../registry/blocks/*/meta.json', { eager: true, import: 'default' })
const demos = import.meta.glob<{ default: ComponentType<DemoProps>; controls?: Control[] }>('../../../../registry/blocks/*/demo.tsx')
const sources = import.meta.glob<string>('../../../../registry/blocks/*/*.{tsx,ts,svg}', { query: '?raw', import: 'default' })
const libSources = import.meta.glob<string>('../../../../registry/lib/*.{ts,css}', { query: '?raw', import: 'default' })

const slugOf = (path: string) => path.split('/').at(-2)!

export const CATEGORY_ORDER = ['Text', 'Media', 'Effects', '3D', 'Interaction', 'Motion', 'Navigation', 'Layout', 'Sections']

export const blocks: Block[] = Object.entries(metas)
  .map(([path, meta]) => {
    const slug = slugOf(path)
    const files: Block['sources'] = {}
    for (const file of meta.files) {
      const key = Object.keys(sources).find(k => k.endsWith(`/blocks/${slug}/${file}`))
      if (key) files[file] = sources[key]
    }
    const demoKey = Object.keys(demos).find(k => k.endsWith(`/blocks/${slug}/demo.tsx`))!
    return { ...meta, slug, loadDemo: demos[demoKey], sources: files }
  })
  .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.title.localeCompare(b.title))

export const getBlock = (slug?: string) => blocks.find(b => b.slug === slug)

export const libFile = (name: string) => {
  const key = Object.keys(libSources).find(k => k.endsWith(`/lib/${name}.ts`) || k.endsWith(`/lib/${name}`))
  return key ? libSources[key] : null
}

export const blocksInspiredBy = (pinId: string) => blocks.filter(b => b.inspiredBy.includes(pinId))

// Screenshots of each block's live demo, made by `pnpm previews`
const previews = import.meta.glob<string>('../assets/previews/*.jpg', { eager: true, query: '?url', import: 'default' })

/** A block's picture: a screenshot of its demo, else the reference that inspired it, else a still of Iva's work. */
export function blockImage(block: Block, i = 0) {
  const preview = Object.entries(previews).find(([k]) => k.endsWith(`/${block.slug}.jpg`))
  if (preview) return preview[1]
  for (const id of block.inspiredBy) {
    const img = getPin(id)?.image
    if (img) return img
  }
  return demoCards[(i * 7) % demoCards.length].src
}
