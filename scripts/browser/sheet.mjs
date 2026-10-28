#!/usr/bin/env node
// Contact sheet: screenshot a list of sites at 1440x900 and write an index.html grid to pick from, with a
// tick box per frame and a "Copy picks" button. Publish the folder as an artifact to share it.
//   node scripts/browser/sheet.mjs <sites.txt> <outDir> [waitMs]
// sites.txt: one site per line, `url | kind | note` (kind and note optional); blank lines and # comments skipped.
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { launch } from './cdp.mjs'

const [list, out, wait = '9000'] = process.argv.slice(2)
if (!list || !out) {
  console.error('usage: sheet.mjs <sites.txt> <outDir> [waitMs]')
  process.exit(1)
}
mkdirSync(`${out}/shots`, { recursive: true })

const sites = readFileSync(list, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('#'))
  .map(l => {
    const [url, kind = '', note = ''] = l.split('|').map(s => s.trim())
    return { url: url.startsWith('http') ? url : `https://${url}`, kind, note }
  })

const page = await launch()
const done = []
for (const [i, s] of sites.entries()) {
  const name = s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/[^a-z0-9]+/gi, '-').replace(/-$/, '')
  const file = `shots/${String(i + 1).padStart(2, '0')}-${name}.jpg`
  try {
    await page.go(s.url, +wait)
    await page.shot(`${out}/${file}`, 72)
    // a tiny file is usually a preloader still on screen: give it longer
    if (statSync(`${out}/${file}`).size < 30000) {
      await page.sleep(13000)
      await page.shot(`${out}/${file}`, 72)
    }
    done.push({ ...s, file, title: (await page.js('document.title')) ?? '' })
    console.log('ok  ', s.url)
  } catch (e) {
    console.log('fail', s.url, e.message)
  }
}
await page.close()

const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const cards = done
  .map(
    (s, i) => `<li class="card">
  <label class="pick"><input type="checkbox" id="pick-${i + 1}" data-n="${i + 1}" data-site="${esc(s.url)}"><span>${String(i + 1).padStart(2, '0')}</span></label>
  <a class="shot" href="${esc(s.url)}" target="_blank" rel="noopener"><img src="${s.file}" alt="${esc(s.title || s.url)} at 1440 by 900" loading="lazy" width="1440" height="900"></a>
  <div class="meta"><a class="name" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a><span class="kind">${esc(s.kind)}</span></div>
  ${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}
</li>`,
  )
  .join('\n')

writeFileSync(
  `${out}/index.html`,
  `<title>Inspiration Contact Sheet</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* A photographer's contact sheet: numbered frames on a light table, tick the ones worth a closer look */
:root { --table: #e9e8e4; --sheet: #f6f5f2; --ink: #141414; --muted: #6c6a64; --line: #d3d1cb; --mark: #ff5a00; --display: 'Archivo', 'Arial Narrow', Arial, sans-serif; --mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --table: #121211; --sheet: #1b1b1a; --ink: #efeeea; --muted: #a09e97; --line: #34332f; --mark: #ff7a33; color-scheme: dark } }
:root[data-theme="dark"] { --table: #121211; --sheet: #1b1b1a; --ink: #efeeea; --muted: #a09e97; --line: #34332f; --mark: #ff7a33; color-scheme: dark }
body { background: var(--table); color: var(--ink); font-family: var(--display); font-size: 15px; line-height: 1.4; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 120px; }
.wrap { max-width: 1500px; margin: 0 auto; display: grid; gap: 28px; }
h1 { margin: 0; font-weight: 900; font-stretch: 112%; font-size: clamp(34px, 5vw, 64px); line-height: 0.9; letter-spacing: -0.03em; text-wrap: balance; }
header p { margin: 8px 0 0; color: var(--muted); max-width: 70ch; }
.grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr)); gap: 22px 16px; }
.card { position: relative; display: grid; gap: 8px; align-content: start; min-width: 0; }
.shot { display: block; background: var(--sheet); border: 1px solid var(--line); overflow: hidden; }
.shot img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 10; object-fit: cover; }
.meta { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.name { color: var(--ink); font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
.name:hover { text-decoration: underline; }
.kind { font-family: var(--mono); font-size: 12px; color: var(--muted); white-space: nowrap; }
.note { margin: 0; color: var(--muted); font-size: 14px; }
.pick { position: absolute; top: 8px; left: 8px; z-index: 1; display: flex; align-items: center; gap: 6px; padding: 4px 8px 4px 6px; background: var(--sheet); border: 1px solid var(--line); cursor: pointer; font-family: var(--mono); font-size: 13px; }
.pick input { margin: 0; accent-color: var(--mark); width: 16px; height: 16px; }
.card:has(input:checked) .shot { outline: 3px solid var(--mark); outline-offset: 3px; }
.card:has(input:checked) .pick { background: var(--mark); border-color: var(--mark); color: #fff; }
.tray { position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding: 12px max(16px, env(safe-area-inset-right, 0px)) calc(12px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); background: var(--sheet); border-top: 1px solid var(--line); }
.tray output { flex: 1 1 260px; min-width: 0; font-family: var(--mono); font-size: 13px; overflow-wrap: anywhere; }
.tray button { font: inherit; font-weight: 700; padding: 8px 14px; background: var(--ink); color: var(--sheet); border: 0; cursor: pointer; }
.tray button:disabled { opacity: 0.4; cursor: default; }
:focus-visible { outline: 2px solid var(--mark); outline-offset: 2px; }
</style>
<div class="wrap">
  <header><h1>${done.length} sites to look at</h1><p>Each frame is the site's home page at 1440 × 900, a few seconds after it loaded. Tick the ones worth studying, then copy your picks and paste them into the chat.</p></header>
  <ul class="grid">
${cards}
  </ul>
</div>
<div class="tray"><output id="picked">Nothing picked yet</output><button id="copy" type="button" disabled>Copy picks</button></div>
<script>
const boxes = [...document.querySelectorAll('.pick input')], out = document.getElementById('picked'), copy = document.getElementById('copy')
const text = () => boxes.filter(b => b.checked).map(b => b.dataset.n.padStart(2, '0') + ' ' + b.dataset.site).join(', ')
const update = () => { const t = text(); out.textContent = t || 'Nothing picked yet'; copy.disabled = !t; copy.textContent = 'Copy picks' }
boxes.forEach(b => b.addEventListener('change', update))
copy.addEventListener('click', () => navigator.clipboard.writeText('Picks: ' + text()).then(() => (copy.textContent = 'Copied'), () => { const r = document.createRange(); r.selectNodeContents(out); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = 'Selected, press copy' }))
update()
</script>
`,
)
console.log(`${out}/index.html (${done.length} of ${sites.length} sites)`)
