#!/usr/bin/env node
// Everything in creative-kit on one page, for coming up with a site concept: the manifesto,
// themes, blocks, grid systems, inspo pins grouped by site, and the galleries and foundries.
// Image paths are absolute, so they can be opened (Read) from any repo.
//
// Usage (from anywhere; the kit is found from this script's real location):
//   node ~/.claude/skills/site-concept/scripts/digest.mjs [--out file.md]
// Set CREATIVE_KIT=/path/to/creative-kit to point it at another checkout.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const KIT = process.env.CREATIVE_KIT
  ? path.resolve(process.env.CREATIVE_KIT)
  : path.resolve(path.dirname(fs.realpathSync(fileURLToPath(import.meta.url))), '../../..')
if (!fs.existsSync(path.join(KIT, 'registry/blocks'))) {
  console.error(`No creative-kit at ${KIT}. Set CREATIVE_KIT=/path/to/creative-kit.`)
  process.exit(1)
}

const args = process.argv.slice(2)
const outIndex = args.indexOf('--out')
const out = outIndex >= 0 ? args[outIndex + 1] : null

const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const jsonIn = dir => fs.readdirSync(path.join(KIT, dir)).filter(f => f.endsWith('.json')).map(f => readJson(path.join(KIT, dir, f)))
const groupBy = (list, key) => list.reduce((m, x) => ((m[key(x)] ??= []).push(x), m), {})
const abs = rel => path.join(KIT, rel)
const exists = rel => fs.existsSync(abs(rel))
const lines = []
const say = (...l) => lines.push(...l)

say(`# creative-kit digest`, '', `Kit: ${KIT}`, `Showcase (live demos): cd ${KIT} && pnpm dev`, '')

// Manifesto
const readme = fs.readFileSync(abs('README.md'), 'utf8')
const manifesto = readme.match(/## Manifesto\n([\s\S]*?)\n(?=```|## )/)
if (manifesto) say('## Manifesto', manifesto[1].trim(), '')

// Themes
const order = (fs.readFileSync(abs('apps/site/src/data/themes.ts'), 'utf8').match(/order\s*=\s*\[([^\]]*)\]/)?.[1] ?? '')
  .match(/'([^']+)'/g)?.map(s => s.slice(1, -1)) ?? []
const themes = jsonIn('themes').sort((a, b) => (order.indexOf(a.id) >>> 0) - (order.indexOf(b.id) >>> 0))
say(`## Themes (${themes.length})`, '')
for (const t of themes) {
  const fonts = Object.entries(t.fonts).map(([role, f]) => `${role} ${f.family} (stand-in for ${f.fallback.split(',')[0]})`).join('; ')
  const display = t.type.find(s => s.name === 'display')
  say(
    `### ${t.name} \`${t.id}\``,
    t.description,
    `- colours: ${Object.entries(t.colors).map(([k, v]) => `${k} ${v}`).join(', ')}${t.palette?.length ? ` · palette ${t.palette.map(p => `${p.name} ${p.value}`).join(', ')}` : ''}`,
    `- fonts: ${fonts}`,
    `- display ${display?.size}, leading ${display?.leading}, tracking ${display?.tracking}, weight ${display?.weight} · radius ${t.radius}`,
    `- from pins: ${(t.inspiredBy ?? []).join(', ') || '—'}`,
    '',
  )
}

// Blocks
const blocks = fs
  .readdirSync(abs('registry/blocks'))
  .filter(slug => exists(`registry/blocks/${slug}/meta.json`))
  .map(slug => ({ slug, ...readJson(abs(`registry/blocks/${slug}/meta.json`)) }))
say(`## Blocks (${blocks.length})`, '')
for (const [cat, items] of Object.entries(groupBy(blocks, b => b.category))) {
  say(`### ${cat}`, '')
  for (const b of items) {
    const preview = `apps/site/src/assets/previews/${b.slug}.jpg`
    const tags = [b.webgl && 'WebGL', b.theme && `theme ${b.theme}`, b.registryDependencies?.length && `uses ${b.registryDependencies.join(', ')}`].filter(Boolean)
    say(
      `- **${b.title}** \`${b.slug}\`${tags.length ? ` (${tags.join(' · ')})` : ''}: ${b.description}`,
      `  from pins: ${(b.inspiredBy ?? []).join(', ') || '—'}${b.usedIn?.length ? ` · used in ${b.usedIn.join(', ')}` : ''}${exists(preview) ? ` · preview ${abs(preview)}` : ''}`,
    )
  }
  say('')
}

// Grid systems (they live in the showcase's Grids page)
const grids = fs.readFileSync(abs('apps/site/src/pages/Grids.tsx'), 'utf8').match(/const systems = \[([\s\S]*?)\n\]/)?.[1]
if (grids) {
  say('## Grid systems', '')
  for (const m of grids.matchAll(/name: '([^']+)', spec: '([^']+)', use: '([^']+)'/g)) say(`- **${m[1]}**: ${m[2]}. ${m[3]}`)
  say('')
}

// Pins, grouped by project and then by site (the id prefix)
const projects = readJson(abs('content/projects.json'))
const pins = jsonIn('content/inspo').sort((a, b) => a.added - b.added)
const siteOf = p => p.id.split('-').slice(0, 2).join('-')
say(`## Inspo pins (${pins.length})`, '', 'verdict: ♥ love · ? maybe · ✕ nope. Kinds: site (overall), shot (one detail), idea, decision, question.', '')
for (const project of projects) {
  const mine = pins.filter(p => p.project === project.id)
  if (!mine.length) continue
  say(`### ${project.name} \`${project.id}\`${project.repo ? ` (${project.repo})` : ''}`, '')
  for (const [site, group] of Object.entries(groupBy(mine, siteOf))) {
    const overview = group.find(p => p.kind === 'site')
    say(`#### ${site}${overview?.url ? ` — ${overview.url}` : ''}${overview?.siteType ? ` (${overview.siteType})` : ''}`)
    for (const p of group) {
      const mark = { love: '♥', maybe: '?', nope: '✕' }[p.verdict] ?? ''
      say(`- ${mark} \`${p.id}\` [${p.kind} · ${p.section}] **${p.title}**: ${p.note}${p.image ? ` · image ${abs(`content/inspo/${p.image}`)}` : ''}`)
    }
    say('')
  }
}

// Where to look
const sources = readJson(abs('content/sources.json'))
say('## Galleries', ...sources.galleries.map(g => `- ${g.name}${g.favourite ? ' (favourite)' : ''}: ${g.url} — ${g.note}`), '')
say('## Font foundries', ...sources.fonts.map(f => `- ${f.name}: ${f.url} — ${f.note}`), '')
say('## Tools', ...sources.tools.map(t => `- ${t.name}: ${t.url} — ${t.note}`), '')

const text = lines.join('\n')
if (out) {
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true })
  fs.writeFileSync(out, text)
  console.log(`Kit: ${KIT}\nDigest: ${path.resolve(out)} (${themes.length} themes, ${blocks.length} blocks, ${pins.length} pins)`)
} else console.log(text)
