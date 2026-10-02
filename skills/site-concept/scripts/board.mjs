#!/usr/bin/env node
// Render site concepts as one static HTML board: per concept its idea, palette as swatches,
// type set in the free stand-in fonts, the signature moment, sections, a row of the kit pieces
// it uses (block previews, theme swatches, grid columns, pin shots) with what each becomes,
// reference images with captions and, once one is built, the signature-moment prototype.
// Images are copied next to the page, so the folder can be opened, zipped or shared as it is.
//
// Usage:
//   node ~/.claude/skills/site-concept/scripts/board.mjs <concepts.json> [--out <dir>] [--open]
// The JSON shape is in ../SKILL.md ("The board").
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// The kit, found from this script's real location like digest.mjs (CREATIVE_KIT overrides)
const KIT = process.env.CREATIVE_KIT
  ? path.resolve(process.env.CREATIVE_KIT)
  : path.resolve(path.dirname(fs.realpathSync(fileURLToPath(import.meta.url))), '../../..')
const kitFile = rel => path.join(KIT, rel)
const kitJson = rel => (fs.existsSync(kitFile(rel)) ? JSON.parse(fs.readFileSync(kitFile(rel), 'utf8')) : null)
const grids = fs.existsSync(kitFile('apps/site/src/pages/Grids.tsx'))
  ? [...fs.readFileSync(kitFile('apps/site/src/pages/Grids.tsx'), 'utf8').matchAll(/name: '([^']+)', spec: '([^']+)'/g)].map(m => ({ name: m[1], spec: m[2] }))
  : []

const args = process.argv.slice(2)
const flag = name => {
  const i = args.indexOf(`--${name}`)
  return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true)
}
const input = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out')
if (!input) {
  console.error('Usage: board.mjs <concepts.json> [--out dir] [--open]')
  process.exit(1)
}
const data = JSON.parse(fs.readFileSync(input, 'utf8'))
const OUT = path.resolve(typeof flag('out') === 'string' ? flag('out') : path.join(path.dirname(input), 'board'))
fs.mkdirSync(path.join(OUT, 'images'), { recursive: true })

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const list = items => (items?.length ? `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '')
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Copy every image next to the page; skip (and report) the ones that don't exist
const missing = []
const image = (src, prefix, base = path.dirname(input)) => {
  if (/^https?:/.test(src)) return src
  const file = path.resolve(base, src)
  if (!fs.existsSync(file)) return missing.push(src), null
  const name = `${prefix}-${path.basename(file)}`
  fs.copyFileSync(file, path.join(OUT, 'images', name))
  return `images/${name}`
}

// Pins first: they're where a concept starts; blocks, themes and grids build on them
const KINDS = ['pin', 'block', 'theme', 'grid']
const DEPTH = { base: 'Base: its code, reshaped', reworked: 'Reworked: its technique, a new piece', principle: 'Principle only' }

/** One kit piece as a card: what it looks like in the kit, then what it becomes here. */
function kitCard(k, prefix) {
  if (!k.kind) return `<div class="kit-card"><div class="kit-body"><code>${esc(k.from)}</code><p>${esc(k.to)}</p></div></div>`
  let thumb = ''
  let title = k.id
  if (!k.id) title = `No kit ${k.kind}`
  else if (k.kind === 'block') {
    const meta = kitJson(`registry/blocks/${k.id}/meta.json`)
    title = meta?.title ?? k.id
    const src = image(`apps/site/src/assets/previews/${k.id}.jpg`, prefix, KIT)
    if (src) thumb = `<img src="${esc(src)}" alt="" />`
  } else if (k.kind === 'theme') {
    const t = kitJson(`themes/${k.id}.json`)
    title = t?.name ?? k.id
    if (t) thumb = `<div class="kit-theme" style="background:${esc(t.colors.paper)};color:${esc(t.colors.ink)}"><span style="font-family:'${esc(t.fonts.display?.family ?? t.fonts.sans.family)}',sans-serif">Aa</span><div>${Object.values(t.colors).map(v => `<i style="background:${esc(v)}"></i>`).join('')}</div></div>`
    for (const f of Object.values(t?.fonts ?? {})) if (f?.google) families.add(f.google)
  } else if (k.kind === 'grid') {
    const g = grids.find(g => g.name.toLowerCase() === String(k.id).toLowerCase())
    const cols = Number(g?.spec.match(/(\d+) columns/)?.[1] ?? 12)
    thumb = `<div class="kit-grid" style="grid-template-columns:repeat(${cols},1fr)">${'<i></i>'.repeat(cols)}</div>`
    title = g ? `${g.name} · ${g.spec}` : k.id
  } else if (k.kind === 'pin') {
    const pin = kitJson(`content/inspo/${k.id}.json`)
    title = pin?.title ?? k.id
    const src = pin?.image && image(`content/inspo/${pin.image}`, prefix, KIT)
    if (src) thumb = `<img src="${esc(src)}" alt="" />`
  }
  return `<div class="kit-card${k.id ? '' : ' kit-none'}">
    ${thumb ? `<div class="kit-thumb">${thumb}</div>` : ''}
    <div class="kit-body">
      <div class="caption">${esc(k.kind)}${k.id ? ` · ${esc(k.id)}` : ''}${k.depth ? ` · ${esc(DEPTH[k.depth] ?? k.depth)}` : ''}</div>
      <strong>${esc(title)}</strong>
      <p>${esc(k.to)}</p>
    </div>
  </div>`
}

const families = new Set()
const concepts = data.concepts.map((c, n) => {
  const id = slug(c.name) || `concept-${n + 1}`
  for (const f of c.fonts ?? []) if (f.google) families.add(f.google)
  const colors = Object.entries(c.colors ?? {})
  const color = role => c.colors?.[role]
  const fonts = (c.fonts ?? [])
    .map(
      f => `<div class="font">
        <div class="font-meta caption">${esc(f.role)} · ${esc(f.family)}${f.standIn && f.standIn !== f.family ? ` <span>(shown in ${esc(f.standIn)})</span>` : ''}</div>
        <div class="font-sample" style="font-family:'${esc(f.standIn ?? f.family)}',sans-serif;font-size:${esc(f.size ?? '40px')};font-weight:${esc(f.weight ?? 400)};letter-spacing:${esc(f.tracking ?? 'normal')};line-height:${esc(f.leading ?? 1.05)}${f.case ? `;text-transform:${esc(f.case)}` : ''}">${esc(f.sample ?? 'The quick brown fox')}</div>
      </div>`,
    )
    .join('')
  const kit = (c.kit ?? [])
    .toSorted((a, b) => (KINDS.indexOf(a.kind) >>> 0) - (KINDS.indexOf(b.kind) >>> 0))
    .map(k => kitCard(k, id))
    .join('')
  const images = (c.images ?? [])
    .map(img => {
      const src = image(img.src, id)
      return src ? `<figure><img src="${esc(src)}" alt="" /><figcaption>${esc(img.caption)}</figcaption></figure>` : ''
    })
    .join('')
  return `<section class="concept" id="${id}">
    <header class="hero" style="background:${esc(color('paper') ?? '#fff')};color:${esc(color('ink') ?? '#111')}">
      <div class="caption">${esc(c.label ?? `Concept ${n + 1}`)}</div>
      <h2 style="font-family:'${esc(c.fonts?.find(f => f.role === 'display')?.standIn ?? c.fonts?.[0]?.standIn ?? 'inherit')}',sans-serif">${esc(c.name)}</h2>
      <p class="idea">${esc(c.idea)}</p>
      ${color('accent') ? `<span class="chip" style="background:${esc(color('accent'))};color:${esc(color('ink'))}">${esc(c.mood ?? 'accent')}</span>` : ''}
    </header>
    <div class="body">
      ${c.why ? `<div class="block"><h3>Why it fits</h3><p>${esc(c.why)}</p></div>` : ''}
      ${c.signature ? `<div class="block"><h3>Signature moment</h3><p>${esc(c.signature)}</p></div>` : ''}
      ${colors.length ? `<div class="block"><h3>Colour</h3><div class="swatches">${colors.map(([k, v]) => `<div class="swatch"><i style="background:${esc(v)}"></i><span>${esc(k)}</span><code>${esc(v)}</code></div>`).join('')}</div></div>` : ''}
      ${fonts ? `<div class="block"><h3>Type</h3>${fonts}</div>` : ''}
      ${c.motion ? `<div class="block"><h3>Motion</h3><p>${esc(c.motion)}</p></div>` : ''}
      ${c.sections?.length ? `<div class="block"><h3>Pages and sections</h3>${list(c.sections)}</div>` : ''}
      ${c.new?.length ? `<div class="block"><h3>New for this site</h3>${list(c.new)}</div>` : ''}
      ${c.risks?.length ? `<div class="block"><h3>Watch out</h3>${list(c.risks)}</div>` : ''}
    </div>
    ${kit ? `<div class="kit"><h3>From the kit</h3><div class="kit-cards">${kit}</div></div>` : ''}
    ${c.prototype ? `<div class="proto"><h3>Signature moment, prototype · <a href="${esc(path.relative(OUT, path.resolve(path.dirname(input), c.prototype)))}" target="_blank">open full screen</a></h3><iframe src="${esc(path.relative(OUT, path.resolve(path.dirname(input), c.prototype)))}" title="Prototype"></iframe></div>` : ''}
    ${images ? `<div class="refs">${images}</div>` : ''}
  </section>`
})

const fontsUrl = families.size ? `https://fonts.googleapis.com/css2?${[...families].map(f => `family=${f}`).join('&')}&display=swap` : null
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(data.site ?? 'Site')} concepts</title>
${fontsUrl ? `<link rel="stylesheet" href="${fontsUrl}" />` : ''}
<style>
  :root { --paper: #f6f6f4; --ink: #151515; --muted: #77756f; --rule: #dcdad5; --card: #fff; }
  @media (prefers-color-scheme: dark) { :root { --paper: #121212; --ink: #ededeb; --muted: #8d8b86; --rule: #2c2c2a; --card: #1b1b1a; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif; }
  .page { max-width: 1440px; margin: 0 auto; padding: 32px 20px 96px; }
  .top { display: grid; gap: 12px; padding-bottom: 32px; border-bottom: 1px solid var(--rule); }
  .top h1 { margin: 0; font-size: clamp(32px, 5vw, 64px); line-height: 1; letter-spacing: -0.03em; font-weight: 500; }
  .top p { margin: 0; max-width: 70ch; color: var(--muted); }
  .caption { font: 11px/1.3 ui-monospace, 'SF Mono', Menlo, monospace; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.7; }
  nav { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 8px; }
  nav a { color: inherit; }
  .concept { margin-top: 48px; background: var(--card); border: 1px solid var(--rule); }
  .hero { padding: clamp(24px, 4vw, 56px) clamp(20px, 3vw, 40px); display: grid; gap: 16px; }
  .hero h2 { margin: 0; font-size: clamp(40px, 7vw, 112px); line-height: 0.9; letter-spacing: -0.03em; font-weight: 500; overflow-wrap: anywhere; }
  .idea { margin: 0; max-width: 46ch; font-size: clamp(17px, 1.6vw, 22px); line-height: 1.35; }
  .chip { justify-self: start; padding: 4px 12px; border-radius: 999px; font-size: 13px; }
  .body { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr)); margin-right: -1px; overflow: hidden; }
  .block { border-top: 1px solid var(--rule); border-right: 1px solid var(--rule); padding: 20px clamp(20px, 3vw, 40px) 28px; min-width: 0; }
  .block h3 { margin: 0 0 10px; font: 11px/1.3 ui-monospace, 'SF Mono', Menlo, monospace; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); font-weight: 400; }
  .block p { margin: 0; max-width: 62ch; }
  .block ul { margin: 0; padding-left: 18px; } .block li + li { margin-top: 4px; }
  .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 12px; }
  .swatch { display: grid; gap: 4px; font-size: 12px; } .swatch i { display: block; height: 56px; border: 1px solid var(--rule); }
  .swatch code { color: var(--muted); }
  .font + .font { margin-top: 18px; } .font-meta span { text-transform: none; }
  .font-sample { margin-top: 6px; overflow-wrap: anywhere; }
  .kit, .proto { padding: 20px clamp(20px, 3vw, 40px) 28px; border-top: 1px solid var(--rule); }
  .kit h3, .proto h3 { margin: 0 0 14px; font: 11px/1.3 ui-monospace, 'SF Mono', Menlo, monospace; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); font-weight: 400; }
  .proto a { color: inherit; }
  .kit-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: 16px; }
  .kit-card { border: 1px solid var(--rule); display: grid; grid-template-rows: auto 1fr; min-width: 0; }
  .kit-none { border-style: dashed; }
  .kit-thumb { aspect-ratio: 16 / 10; overflow: hidden; border-bottom: 1px solid var(--rule); }
  .kit-thumb img { border: 0; height: 100%; }
  .kit-theme { height: 100%; display: grid; align-content: space-between; padding: 12px; }
  .kit-theme span { font-size: 56px; line-height: 1; }
  .kit-theme div { display: flex; gap: 4px; } .kit-theme i { width: 22px; height: 22px; border-radius: 50%; box-shadow: 0 0 0 1px rgba(127, 127, 127, 0.35); }
  .kit-grid { height: 100%; display: grid; gap: 4px; padding: 12px; } .kit-grid i { background: color-mix(in srgb, var(--ink) 10%, transparent); }
  .kit-body { padding: 12px 14px 16px; display: grid; gap: 6px; align-content: start; }
  .kit-body strong { font-weight: 500; } .kit-body p { margin: 0; font-size: 14px; }
  .proto iframe { display: block; width: 100%; height: min(80vh, 760px); border: 1px solid var(--rule); background: #fff; }
  code { font: 12px ui-monospace, 'SF Mono', Menlo, monospace; }
  .refs { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 16px; padding: 20px clamp(20px, 3vw, 40px) 32px; border-top: 1px solid var(--rule); }
  figure { margin: 0; } img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; object-position: top; border: 1px solid var(--rule); }
  figcaption { margin-top: 6px; font-size: 12px; color: var(--muted); }
</style>
</head>
<body>
<main class="page">
  <div class="top">
    <div class="caption">Concepts${data.date ? ` · ${esc(data.date)}` : ''}</div>
    <h1>${esc(data.site ?? 'New site')}</h1>
    ${data.brief ? `<p>${esc(data.brief)}</p>` : ''}
    ${data.concepts.length > 1 ? `<nav>${data.concepts.map((c, n) => `<a href="#${slug(c.name) || `concept-${n + 1}`}">${esc(c.label ?? `Concept ${n + 1}`)}: ${esc(c.name)}</a>`).join('')}</nav>` : ''}
  </div>
  ${concepts.join('\n')}
</main>
</body>
</html>
`
fs.writeFileSync(path.join(OUT, 'index.html'), html)
console.log(`Board: ${path.join(OUT, 'index.html')}`)
if (missing.length) console.log(`Missing images (skipped): ${missing.join(', ')}`)
if (flag('open')) execSync(`open "${path.join(OUT, 'index.html')}"`)
