import projectsJson from '@content/projects.json'
import sourcesJson from '@content/sources.json'

export type Verdict = 'love' | 'maybe' | 'nope'

export interface Pin {
  id: string
  title: string
  note?: string
  url?: string
  kind: 'site' | 'shot' | 'idea' | 'decision' | 'question'
  section: string
  verdict: Verdict
  project: string
  siteType?: string
  image?: string
  added?: number
}

export interface InspoProject {
  id: string
  name: string
  repo?: string
}

const files = import.meta.glob<Pin>('../../../../content/inspo/*.json', { eager: true, import: 'default' })
const images = import.meta.glob<string>('../../../../content/inspo/images/*', { eager: true, query: '?url', import: 'default' })

const imageUrl = (rel?: string) => {
  if (!rel) return undefined
  const key = Object.keys(images).find(k => k.endsWith('/' + rel))
  return key ? images[key] : undefined
}

export const pins: Pin[] = Object.values(files)
  .map(p => ({ ...p, image: imageUrl(p.image) }))
  .sort((a, b) => (b.added ?? 0) - (a.added ?? 0))

export const projects = projectsJson as InspoProject[]
export const getPin = (id: string) => pins.find(p => p.id === id)

export const KINDS: Record<Pin['kind'], string> = {
  site: 'Reference',
  shot: 'Screenshot',
  idea: 'Idea',
  decision: 'Decision',
  question: 'Open question',
}
export const SECTIONS = ['Overall', 'Hero', 'Navigation', 'Work', 'Layout', 'Type', 'Color', 'Motion', 'Interaction', 'Pages', 'Footer']
export const SITE_TYPES = ['Creative', 'Product / service', 'Portfolio', 'Webshop']
export const VERDICTS: Record<Verdict, string> = { love: 'Love', maybe: 'Maybe', nope: 'Nope' }

export interface Source {
  name: string
  url: string
  note?: string
  favourite?: boolean
}

/** Where to go looking: site galleries and type foundries */
export const sources = sourcesJson as { galleries: Source[]; fonts: Source[] }
