// Sample content for the live demos: Iva Presečki's projects (used with her permission as the kit's first site)

export interface DemoProject {
  id: string
  title: string
  category: string
  year: number
  video: string
  image: string
  cards: string[]
}

const cards = (id: string, count: number) => Array.from({ length: count }, (_, i) => `/demo/cards/${id}-${i + 1}.jpg`)

export const demoProjects: DemoProject[] = [
  {
    id: 'rool',
    title: 'Rool',
    category: 'Branding, visual identity',
    year: 2026,
    video: '/demo/video/rool.mp4',
    image: '/demo/images/rool.jpg',
    cards: cards('rool', 8),
  },
  {
    id: 'apuro',
    title: 'Apuro',
    category: 'Branding, packaging',
    year: 2025,
    video: '/demo/video/apuro.mp4',
    image: '/demo/images/apuro.jpg',
    cards: cards('apuro', 8),
  },
  {
    id: 'booklet',
    title: 'Booklet',
    category: 'Editorial design',
    year: 2025,
    video: '/demo/video/booklet.mp4',
    image: '/demo/images/booklet.jpg',
    cards: cards('booklet', 7),
  },
  {
    id: 'gabagool',
    title: 'Gabagool',
    category: 'Branding, visual identity',
    year: 2026,
    video: '/demo/video/gabagool.mp4',
    image: '/demo/images/gabagool.webp',
    cards: cards('gabagool', 7),
  },
]

/** One flat list of stills, dealt round-robin so neighbours come from different projects. */
export const demoCards = Array.from({ length: 8 }, (_, i) =>
  demoProjects.filter(p => p.cards[i]).map(p => ({ id: `${p.id}-${i + 1}`, src: p.cards[i], label: `${p.title} — ${p.category}`, group: p.id })),
).flat()

export const demoText = {
  statement: 'I see design as a constantly evolving field shaped by new techniques and current trends.',
  approach:
    'I am motivated by continuous learning and the exploration of ways to integrate animation, 3D, and classic 2D practices into cohesive product presentations.',
  email: 'presecki.iva@gmail.com',
}

/** An about page in short blocks: what she does, recognition and where to find her. */
export const demoAbout = {
  services: [
    { title: 'Branding', items: ['Visual identity', 'Packaging', 'Tone of voice', 'Brand guidelines'] },
    { title: 'Editorial', items: ['Books', 'Booklets', 'Posters', 'Type layout'] },
    { title: 'Motion', items: ['Product animation', '3D renders', 'Social media', 'Presentations'] },
  ],
  contact: ['Email', 'Instagram', 'Behance', 'LinkedIn'],
}
