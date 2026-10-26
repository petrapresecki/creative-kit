export interface StudyMeta {
  title: string
  prompt: string
  tool: 'p5' | 'gsap' | 'css' | 'three'
  principles?: string[]
  pins?: string[]
  learned?: string
  added?: number
}

export interface Study extends StudyMeta {
  slug: string
  loadHtml: () => Promise<string>
}

const metas = import.meta.glob<StudyMeta>('../../../../studies/*/meta.json', { eager: true, import: 'default' })
const pages = import.meta.glob<string>('../../../../studies/*/index.html', { query: '?raw', import: 'default' })

const slugOf = (path: string) => path.split('/').at(-2)!

export const studies: Study[] = Object.entries(metas)
  .map(([path, meta]) => {
    const slug = slugOf(path)
    const page = Object.entries(pages).find(([p]) => slugOf(p) === slug)?.[1]
    return { slug, ...meta, loadHtml: page ?? (() => Promise.resolve('')) }
  })
  .sort((a, b) => (b.added ?? 0) - (a.added ?? 0))

export const getStudy = (slug: string) => studies.find(s => s.slug === slug)
export const TOOLS: Record<StudyMeta['tool'], string> = { p5: 'p5.js', gsap: 'GSAP', css: 'CSS', three: 'three.js' }
